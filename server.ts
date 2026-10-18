import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper paths
const ambulancesFilePath = path.join(process.cwd(), 'data/ambulances.json');
const hospitalsFilePath = path.join(process.cwd(), 'data/hospitals.json');

function getAmbulances() {
  if (fs.existsSync(ambulancesFilePath)) {
    return JSON.parse(fs.readFileSync(ambulancesFilePath, 'utf-8'));
  }
  return [];
}

function saveAmbulances(data: any) {
  fs.writeFileSync(ambulancesFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

function getHospitals() {
  if (fs.existsSync(hospitalsFilePath)) {
    return JSON.parse(fs.readFileSync(hospitalsFilePath, 'utf-8'));
  }
  return [];
}

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

// REST API ROUTES
app.get('/api/ambulances', (req: Request, res: Response) => {
  try {
    const ambulances = getAmbulances();
    const { status, type } = req.query;
    let filtered = [...ambulances];

    if (status) {
      filtered = filtered.filter((a: any) => a.status.toLowerCase() === String(status).toLowerCase());
    }
    if (type) {
      filtered = filtered.filter((a: any) => a.type.toLowerCase().includes(String(type).toLowerCase()));
    }

    res.json({
      success: true,
      count: filtered.length,
      total_in_fleet: ambulances.length,
      data: filtered,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/ambulances/:id', (req: Request, res: Response) => {
  const ambulances = getAmbulances();
  const ambulance = ambulances.find((a: any) => a.id.toUpperCase() === req.params.id.toUpperCase());
  if (!ambulance) {
    return res.status(404).json({ success: false, message: 'Ambulance not found' });
  }
  res.json({ success: true, data: ambulance });
});

app.post('/api/ambulances/dispatch', (req: Request, res: Response) => {
  try {
    const { latitude, longitude, patient_name, emergency_type, required_type } = req.body;
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }

    const patientLat = parseFloat(latitude);
    const patientLon = parseFloat(longitude);
    const ambulances = getAmbulances();

    let candidates = ambulances.filter((a: any) => a.status === 'available');
    if (required_type) {
      const match = candidates.filter((a: any) => a.type.toLowerCase().includes(String(required_type).toLowerCase()));
      if (match.length > 0) candidates = match;
    }

    if (candidates.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No available ambulances found in Mira Road area.'
      });
    }

    const withDistance = candidates.map((u: any) => {
      const dist = calculateHaversineDistance(
        u.current_location.latitude,
        u.current_location.longitude,
        patientLat,
        patientLon
      );
      const eta = Math.max(Math.ceil((dist / 30) * 60), 2);
      return { ...u, distance_km: dist, eta_minutes: eta };
    }).sort((a: any, b: any) => a.distance_km - b.distance_km);

    const selected = withDistance[0];

    // Find nearest hospital
    const hospitals = getHospitals();
    const hospitalsWithDist = hospitals.map((h: any) => ({
      ...h,
      distance_km: calculateHaversineDistance(patientLat, patientLon, h.location.latitude, h.location.longitude)
    })).sort((a: any, b: any) => a.distance_km - b.distance_km);

    res.json({
      success: true,
      message: `Nearest ambulance ${selected.vehicle_number} (${selected.id}) assigned successfully!`,
      dispatch_result: {
        emergency_location: { latitude: patientLat, longitude: patientLon },
        patient_name: patient_name || 'Emergency Victim',
        emergency_type: emergency_type || 'General Emergency',
        assigned_ambulance: selected,
        recommended_hospital: hospitalsWithDist[0] || null,
        other_available_units: withDistance.slice(1)
      },
      dispatched_at: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/ambulances/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  let { status } = req.body;

  const ambulances = getAmbulances();
  const idx = ambulances.findIndex((a: any) => a.id.toUpperCase() === id.toUpperCase());
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Ambulance not found' });
  }

  // If status is not provided, toggle current state
  if (!status) {
    status = ambulances[idx].status === 'available' ? 'busy' : 'available';
  } else {
    status = status.toLowerCase();
    if (!['available', 'busy'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be available or busy' });
    }
  }

  ambulances[idx].status = status;
  saveAmbulances(ambulances);
  res.json({ success: true, message: `Status updated to ${status}`, data: ambulances[idx] });
});

app.get('/api/hospitals', (_req: Request, res: Response) => {
  const hospitals = getHospitals();
  res.json({ success: true, count: hospitals.length, data: hospitals });
});

app.get('/api/system-info', (_req: Request, res: Response) => {
  res.json({
    project: 'Lifeline: Smart Emergency Ambulance Dispatch & Routing System',
    version: '1.0.0-production',
    region: 'Mira Road Emergency Operations Center, Thane, Mumbai Suburban Region',
    algorithm: 'Haversine Great-Circle Distance Metric + Status Heuristics',
    coverage_area: 'Mira Road East & West, Kashimira, Western Express Highway'
  });
});

// Full-stack Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(process.cwd(), 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚑 Lifeline Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
