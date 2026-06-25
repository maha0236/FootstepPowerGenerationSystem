export const hourlyPower = [
  { time: "06:00", watts: 2.1, steps: 84 },
  { time: "07:00", watts: 18.4, steps: 736 },
  { time: "08:00", watts: 41.2, steps: 1648 },
  { time: "09:00", watts: 36.7, steps: 1468 },
  { time: "10:00", watts: 22.3, steps: 892 },
  { time: "11:00", watts: 19.8, steps: 792 },
  { time: "12:00", watts: 31.5, steps: 1260 },
  { time: "13:00", watts: 29.1, steps: 1164 },
  { time: "14:00", watts: 24.6, steps: 984 },
  { time: "15:00", watts: 20.4, steps: 816 },
  { time: "16:00", watts: 27.9, steps: 1116 },
  { time: "17:00", watts: 44.8, steps: 1792 },
  { time: "18:00", watts: 38.2, steps: 1528 },
  { time: "19:00", watts: 15.6, steps: 624 },
  { time: "20:00", watts: 8.3, steps: 332 },
];

export const weeklyEnergy = [
  { day: "Mon", kWh: 0.68 },
  { day: "Tue", kWh: 0.74 },
  { day: "Wed", kWh: 0.81 },
  { day: "Thu", kWh: 0.63 },
  { day: "Fri", kWh: 0.92 },
  { day: "Sat", kWh: 1.14 },
  { day: "Sun", kWh: 1.08 },
];

export const efficiencyData = [
  { month: "Jan", efficiency: 71 },
  { month: "Feb", efficiency: 73 },
  { month: "Mar", efficiency: 76 },
  { month: "Apr", efficiency: 78 },
  { month: "May", efficiency: 82 },
  { month: "Jun", efficiency: 85 },
];

export const components = [
  {
    id: "PZT-01",
    label: "Piezoelectric Stack",
    type: "PZT-5H Ceramic",
    count: 48,
    voltage: "120–180 V",
    status: "ACTIVE",
  },
  {
    id: "RCT-01",
    label: "Rectifier Circuit",
    type: "Full-Bridge (MBRF20100CT)",
    count: 12,
    voltage: "DC 120 V",
    status: "ACTIVE",
  },
  {
    id: "CAP-01",
    label: "Storage Capacitor Bank",
    type: "Electrolytic 4700µF",
    count: 24,
    voltage: "200 V rated",
    status: "ACTIVE",
  },
  {
    id: "REG-01",
    label: "DC-DC Buck Converter",
    type: "LM2596 (5V out)",
    count: 6,
    voltage: "5 V regulated",
    status: "ACTIVE",
  },
  {
    id: "BAT-01",
    label: "Li-Ion Battery Pack",
    type: "18650 × 12 cell",
    count: 2,
    voltage: "12 V / 20 Ah",
    status: "CHARGING",
  },
  {
    id: "MCU-01",
    label: "Monitoring MCU",
    type: "Arduino Mega 2560",
    count: 1,
    voltage: "5 V logic",
    status: "ACTIVE",
  },
];

export const workingSteps = [
  {
    num: "01",
    title: "Mechanical Excitation",
    body: "Each human footstep applies 500–800 N of vertical force to the walkway surface. Aluminium force-distribution plates channel this load uniformly across the piezoelectric element array below.",
  },
  {
    num: "02",
    title: "Piezoelectric Conversion",
    body: "PZT-5H lead zirconate titanate stacks deform under compression, generating an open-circuit voltage of 120–180 V AC through the direct piezoelectric effect (d₃₃ = 593 pC/N).",
  },
  {
    num: "03",
    title: "AC Rectification",
    body: "Full-bridge rectifier modules convert the raw AC pulse to unipolar DC. A smoothing capacitor bank reduces ripple to below 5% before downstream regulation.",
  },
  {
    num: "04",
    title: "Voltage Regulation",
    body: "Buck converters step the 120 V DC bus down to a stable 5 V / 12 V rail. Regulation efficiency exceeds 87% across the full load range, feeding the battery charge controller.",
  },
  {
    num: "05",
    title: "Energy Storage",
    body: "Regulated energy is stored in 12-cell Li-Ion packs (20 Ah total). A BMS monitors cell balance, temperature, and state-of-charge in real time, protecting against over-voltage and thermal runaway.",
  },
  {
    num: "06",
    title: "Load Dispatch",
    body: "Stored energy powers veranda lighting, perimeter sensors, and IoT nodes. The Arduino MCU logs every step event, tracks cumulative energy, and transmits telemetry via MQTT over WiFi.",
  },
];

export const specs = [
  ["Walkway Dimensions", "12 m × 1.2 m (14.4 m² active area)"],
  ["Sensor Tiles", "48 × PZT-5H stacks, 200 mm × 200 mm each"],
  ["Open-Circuit Voltage", "120 – 180 V AC per element"],
  ["Peak Power per Step", "≈ 8.4 W (at 700 N, 75 kg adult)"],
  ["Daily Step Count (avg)", "14 800 steps / day"],
  ["Daily Energy Yield", "0.76 kWh / day (avg)"],
  ["System Efficiency", "85 % (rectification + regulation)"],
  ["Storage Capacity", "240 Wh (12 V × 20 Ah)"],
  ["Charge Controller", "MPPT-style adaptive algorithm"],
  ["Communication Protocol", "MQTT over IEEE 802.11n (2.4 GHz)"],
  ["Enclosure Rating", "IP67 — dust-tight, submersion-resistant"],
  ["Estimated Lifespan", "≥ 20 years (200 M cycle rating)"],
];
