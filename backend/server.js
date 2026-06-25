import dns from 'node:dns';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import { 
  workingSteps, 
  specs, 
  hourlyPower, 
  weeklyEnergy, 
  efficiencyData, 
  components 
} from './data.js';

dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/footstep_power';
mongoose.connect(MONGO_URI)
  .then(() => console.log('[DB] Connected to MongoDB successfully'))
  .catch(err => console.error('[DB] Connection error:', err));

app.use('/api/auth', authRouter);

// Simulation State
let totalSteps = 14820;
let totalWh = 763;
let batterySoc = 74.0;
let activeSensors = 48;
let peakWatts = 44;

// Periodic Simulation Update Loop
setInterval(() => {
  // Simulate new footsteps logging (1 to 3 steps every 2 seconds)
  const newSteps = Math.floor(Math.random() * 3) + 1;
  totalSteps += newSteps;

  // Each step produces roughly 0.04 to 0.08 Wh
  const energyGenerated = newSteps * (0.04 + Math.random() * 0.04);
  totalWh = parseFloat((totalWh + energyGenerated).toFixed(1));

  // Battery State of Charge (SOC) charges slowly
  if (batterySoc < 100) {
    batterySoc = parseFloat((batterySoc + energyGenerated * 0.005).toFixed(2));
  } else {
    batterySoc = 74.0; // Reset for demonstration purposes when it reaches 100%
  }

  // Peak output fluctuates slightly
  peakWatts = Math.floor(38 + Math.random() * 11);

  // Active sensors occasionally experience a transient state change
  if (Math.random() > 0.95) {
    activeSensors = activeSensors === 48 ? 47 : 48;
  }

  // Update hourly power logs: add steps to the last hour's slot
  if (hourlyPower.length > 0) {
    const lastHour = hourlyPower[hourlyPower.length - 1];
    lastHour.steps += newSteps;
    // Calculate average watts from the steps
    lastHour.watts = parseFloat((lastHour.watts + energyGenerated * 12).toFixed(1));
  }
}, 2000);

// API Routes
app.get('/api/system-data', (req, res) => {
  res.json({ workingSteps, specs });
});

app.get('/api/telemetry', (req, res) => {
  // Update battery pack and piezo status in components array dynamically
  const currentComponents = components.map(c => {
    if (c.id === 'BAT-01') {
      return {
        ...c,
        status: batterySoc >= 95 ? 'ACTIVE' : 'CHARGING',
        voltage: `12 V / ${Math.round(batterySoc)}% SOC`
      };
    }
    if (c.id === 'PZT-01') {
      return {
        ...c,
        status: activeSensors === 48 ? 'ACTIVE' : 'DEGRADED',
        voltage: activeSensors === 48 ? '120–180 V' : '110–170 V'
      };
    }
    return c;
  });

  const avgPowerPerStep = 8.0 + Math.random() * 0.8;
  const dailyStorage = totalWh / 1000;

  res.json({
    totalSteps,
    totalWh,
    peakWatts,
    batterySoc: Math.round(batterySoc),
    activeSensors,
    avgPowerPerStep,
    dailyStorage,
    components: currentComponents,
    hourlyPower,
    weeklyEnergy,
    efficiencyData
  });
});

app.listen(PORT, () => {
  console.log(`[Server] Telemetry backend server running at http://localhost:${PORT}`);
});
