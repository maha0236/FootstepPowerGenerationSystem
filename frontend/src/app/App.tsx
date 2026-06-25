import { useState, useEffect, useRef } from "react";
import Login from "./components/Login";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import { Zap, Activity, Cpu, Layers, ArrowDown, TrendingUp, Settings, Radio } from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────────

const hourlyPower = [
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

const weeklyEnergy = [
  { day: "Mon", kWh: 0.68 },
  { day: "Tue", kWh: 0.74 },
  { day: "Wed", kWh: 0.81 },
  { day: "Thu", kWh: 0.63 },
  { day: "Fri", kWh: 0.92 },
  { day: "Sat", kWh: 1.14 },
  { day: "Sun", kWh: 1.08 },
];

const efficiencyData = [
  { month: "Jan", efficiency: 71 },
  { month: "Feb", efficiency: 73 },
  { month: "Mar", efficiency: 76 },
  { month: "Apr", efficiency: 78 },
  { month: "May", efficiency: 82 },
  { month: "Jun", efficiency: 85 },
];

interface SystemComponent {
  id: string;
  label: string;
  type: string;
  count: number;
  voltage: string;
  status: string;
}

const components: SystemComponent[] = [
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

const workingSteps = [
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

const specs = [
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

// ── Animated counter hook ─────────────────────────────────────────────────────

function useCounter(target: number, duration = 1800) {
  const [value, setValue] = useState(target);
  const startValueRef = useRef(target);
  const targetRef = useRef(target);
  const raf = useRef<number>(0);

  useEffect(() => {
    const startValue = value;
    startValueRef.current = startValue;
    targetRef.current = target;
    const change = target - startValue;
    if (change === 0) return;

    const startTime = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(startValue + change * ease);
      setValue(currentVal);
      if (progress < 1) {
        raf.current = requestAnimationFrame(animate);
      }
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return value;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Badge({ label, active = true }: { label: string; active?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium tracking-widest uppercase ${
        active
          ? "bg-primary/10 text-primary border border-primary/30"
          : "bg-muted text-muted-foreground border border-border"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${active ? "bg-primary animate-pulse" : "bg-muted-foreground"}`}
      />
      {label}
    </span>
  );
}

function KpiCard({
  label,
  value,
  unit,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  unit: string;
  sub: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 flex flex-col gap-3 hover:border-primary/30 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-mono tracking-widest uppercase">{label}</span>
        <Icon className="w-4 h-4 text-primary opacity-70" />
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold font-mono text-foreground leading-none">{value}</span>
        <span className="text-primary font-mono text-sm mb-0.5">{unit}</span>
      </div>
      <span className="text-muted-foreground text-xs font-mono">{sub}</span>
    </div>
  );
}

function SectionHeading({ label, title }: { label: string; title: string }) {
  return (
    <div className="flex flex-col gap-2 mb-8">
      <span className="text-primary font-mono text-xs tracking-widest uppercase">{label}</span>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ fontFamily: "Rajdhani, sans-serif" }}>
        {title}
      </h2>
    </div>
  );
}

// ── Veranda Diagram SVG ───────────────────────────────────────────────────────

function VerandaDiagram() {
  const [hovered, setHovered] = useState<number | null>(null);

  const tiles = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <span className="text-muted-foreground text-xs font-mono tracking-widest uppercase">System Schematic — Walkway Cross-Section</span>
        <Badge label="Live" />
      </div>

      <svg viewBox="0 0 700 320" className="w-full h-auto" style={{ fontFamily: "JetBrains Mono, monospace" }}>
        {/* Ground */}
        <rect x="30" y="270" width="640" height="30" fill="#161d2a" rx="2" />
        <text x="350" y="290" textAnchor="middle" fill="#6b7a8f" fontSize="10">CONCRETE SUBSTRATE</text>

        {/* Conduit lines */}
        <line x1="350" y1="210" x2="350" y2="250" stroke="#a3ff47" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
        <line x1="350" y1="250" x2="580" y2="250" stroke="#a3ff47" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />

        {/* Tiles */}
        {tiles.map((i) => {
          const x = 38 + i * 53;
          const isActive = hovered === i;
          return (
            <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
              {/* Surface tile */}
              <rect x={x} y={60} width={46} height={18} rx="2"
                fill={isActive ? "#a3ff47" : "#1e2d20"}
                stroke={isActive ? "#a3ff47" : "#2e4a30"}
                strokeWidth="1"
                style={{ transition: "fill 0.15s" }}
              />
              {/* Rubber gasket */}
              <rect x={x + 2} y={78} width={42} height={4} fill="#1a2030" rx="1" />
              {/* PZT element */}
              <rect x={x + 4} y={82} width={38} height={28} rx="2"
                fill={isActive ? "rgba(163,255,71,0.15)" : "rgba(163,255,71,0.05)"}
                stroke={isActive ? "#a3ff47" : "rgba(163,255,71,0.25)"}
                strokeWidth={isActive ? 1.5 : 1}
                style={{ transition: "all 0.15s" }}
              />
              <text x={x + 23} y={101} textAnchor="middle" fill={isActive ? "#a3ff47" : "#4a6a4e"} fontSize="8" fontWeight="600">
                PZT
              </text>
              {/* Base plate */}
              <rect x={x} y={110} width={46} height={8} rx="1" fill="#111620" stroke="#1e2d30" strokeWidth="1" />
              {/* Connector wire */}
              <line x1={x + 23} y1={118} x2={x + 23} y2={138} stroke={isActive ? "#a3ff47" : "#2a3a2e"} strokeWidth="1.5" style={{ transition: "stroke 0.15s" }} />
              {/* Label */}
              <text x={x + 23} y={55} textAnchor="middle" fill="#4a5a50" fontSize="7.5">
                T{String(i + 1).padStart(2, "0")}
              </text>
              {/* Pulse dot */}
              {isActive && (
                <circle cx={x + 23} cy={96} r="3" fill="#a3ff47" opacity="0.8" />
              )}
            </g>
          );
        })}

        {/* Bus rail */}
        <rect x="38" y="138" width="620" height="10" rx="2" fill="#161d2a" stroke="rgba(163,255,71,0.2)" strokeWidth="1" />
        <text x="350" y="148" textAnchor="middle" fill="#4a6a4e" fontSize="8">AC BUS RAIL — 12 ELEMENT GROUPS</text>

        {/* Rectifier box */}
        <rect x="540" y="158" width="100" height="38" rx="4" fill="#111620" stroke="rgba(163,255,71,0.3)" strokeWidth="1.5" />
        <text x="590" y="173" textAnchor="middle" fill="#a3ff47" fontSize="8" fontWeight="600">RECTIFIER</text>
        <text x="590" y="186" textAnchor="middle" fill="#6b7a8f" fontSize="7">Full-Bridge × 12</text>

        {/* Buck converter box */}
        <rect x="540" y="205" width="100" height="38" rx="4" fill="#111620" stroke="rgba(163,255,71,0.3)" strokeWidth="1.5" />
        <text x="590" y="220" textAnchor="middle" fill="#a3ff47" fontSize="8" fontWeight="600">BUCK REG.</text>
        <text x="590" y="233" textAnchor="middle" fill="#6b7a8f" fontSize="7">LM2596 × 6</text>

        {/* Battery box */}
        <rect x="415" y="190" width="100" height="50" rx="4" fill="#111620" stroke="rgba(163,255,71,0.4)" strokeWidth="1.5" />
        <text x="465" y="210" textAnchor="middle" fill="#a3ff47" fontSize="8" fontWeight="600">Li-Ion PACK</text>
        <text x="465" y="222" textAnchor="middle" fill="#6b7a8f" fontSize="7">12 V / 20 Ah</text>
        <text x="465" y="234" textAnchor="middle" fill="#6b7a8f" fontSize="7">240 Wh total</text>

        {/* MCU box */}
        <rect x="415" y="150" width="100" height="34" rx="4" fill="#111620" stroke="rgba(163,255,71,0.25)" strokeWidth="1.5" />
        <text x="465" y="166" textAnchor="middle" fill="#a3ff47" fontSize="8" fontWeight="600">MCU</text>
        <text x="465" y="178" textAnchor="middle" fill="#6b7a8f" fontSize="7">Arduino Mega</text>

        {/* Arrows */}
        <line x1="540" y1="177" x2="515" y2="177" stroke="#a3ff47" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.5" />
        <line x1="515" y1="177" x2="515" y2="215" stroke="#a3ff47" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.5" />
        <line x1="515" y1="215" x2="540" y2="215" stroke="#a3ff47" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.5" />
        <polygon points="540,212 534,215 540,218" fill="#a3ff47" opacity="0.5" />
        <line x1="540" y1="224" x2="515" y2="224" stroke="#a3ff47" strokeWidth="1" strokeDasharray="4 2" opacity="0.35" />
        <line x1="515" y1="224" x2="515" y2="205" stroke="#a3ff47" strokeWidth="1" strokeDasharray="4 2" opacity="0.35" />
        <line x1="415" y1="205" x2="380" y2="205" stroke="#a3ff47" strokeWidth="1" strokeDasharray="4 2" opacity="0.35" />

        {/* Arrow from bus to rectifier */}
        <line x1="350" y1="148" x2="350" y2="170" stroke="#a3ff47" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
        <line x1="350" y1="170" x2="540" y2="170" stroke="#a3ff47" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
        <polygon points="540,167 534,170 540,173" fill="#a3ff47" opacity="0.4" />

        {/* Arrow from rectifier to battery */}
        <line x1="540" y1="228" x2="515" y2="228" stroke="#a3ff47" strokeWidth="1.5" opacity="0.5" />
        <line x1="515" y1="228" x2="515" y2="215" stroke="#a3ff47" strokeWidth="1.5" opacity="0.5" />
        <line x1="515" y1="215" x2="465" y2="215" stroke="#a3ff47" strokeWidth="1.5" opacity="0.5" />
        <polygon points="465,212 459,215 465,218" fill="#a3ff47" opacity="0.6" />

        {/* Labels */}
        <text x="38" y="50" fill="#6b7a8f" fontSize="9" fontWeight="500">← 12 000 mm walkway →</text>
        <text x="38" y="38" fill="#4a5a50" fontSize="8">SURFACE TILES (Aluminium 6061-T6)</text>
      </svg>

      <p className="text-muted-foreground text-xs font-mono mt-3 text-center">
        Hover over tiles to inspect individual PZT sensor elements
      </p>
    </div>
  );
}

// ── Tooltip for recharts ──────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded px-3 py-2 text-xs font-mono shadow-xl">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? "#a3ff47" }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value} {unit ?? ""}
        </p>
      ))}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("jwt_token"));
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem("user") || "null"));
  const [activeTab, setActiveTab] = useState<"power" | "energy" | "efficiency">("power");
  const [workingStepsData, setWorkingStepsData] = useState(workingSteps);
  const [specsData, setSpecsData] = useState(specs);
  const [telemetry, setTelemetry] = useState<any>(null);

  const handleLoginSuccess = (newToken: string, newUser: { id: string; name: string; email: string }) => {
    localStorage.setItem("jwt_token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (!token) return;
    fetch("/api/system-data")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load static system data");
        return res.json();
      })
      .then((data) => {
        if (data.workingSteps) setWorkingStepsData(data.workingSteps);
        if (data.specs) setSpecsData(data.specs);
      })
      .catch((err) => {
        console.warn("Could not load static system data from API, using default mock fallback:", err);
      });
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const fetchTelemetry = () => {
      fetch("/api/telemetry")
        .then((res) => {
          if (!res.ok) throw new Error("Telemetry API error");
          return res.json();
        })
        .then((data) => {
          setTelemetry(data);
        })
        .catch((err) => {
          console.error("Error fetching telemetry:", err);
        });
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 2000);
    return () => clearInterval(interval);
  }, [token]);

  const liveSteps = telemetry?.totalSteps ?? 14820;
  const liveWh = telemetry?.totalWh ?? 763;
  const livePeak = telemetry?.peakWatts ?? 44;
  const liveBatterySoc = telemetry?.batterySoc ?? 74;
  const liveActiveSensors = telemetry?.activeSensors ?? 48;
  const liveAvgPowerPerStep = telemetry?.avgPowerPerStep ?? 8.4;
  const liveDailyStorage = telemetry?.dailyStorage ?? 0.76;

  const totalSteps = useCounter(liveSteps);
  const totalWh = useCounter(liveWh);
  const peakWatts = useCounter(livePeak);

  const currentHourlyPower = telemetry?.hourlyPower ?? hourlyPower;
  const currentWeeklyEnergy = telemetry?.weeklyEnergy ?? weeklyEnergy;
  const currentEfficiencyData = telemetry?.efficiencyData ?? efficiencyData;
  const currentComponents: SystemComponent[] = telemetry?.components ?? components;

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* ── Header ── */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">Engineering Project</p>
              <h1
                className="text-base font-bold leading-none text-foreground tracking-wide"
                style={{ fontFamily: "Rajdhani, sans-serif" }}
              >
                Footstep Power Generation System
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge label="System Online" />
            {user && (
              <span className="text-primary text-xs font-mono hidden md:block">
                OP: {user.name.toUpperCase()}
              </span>
            )}
            <span className="text-muted-foreground text-xs font-mono hidden sm:block">
              Node: VERANDA-01
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-destructive/10 border border-destructive/30 hover:bg-destructive/20 text-destructive text-[10px] font-mono uppercase tracking-widest rounded transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% -10%, rgba(163,255,71,0.08) 0%, transparent 70%)",
          }}
        />
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <span className="w-6 h-px bg-primary" />
              <span className="text-primary font-mono text-xs tracking-widest uppercase">Renewable Energy Research</span>
            </div>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight"
              style={{ fontFamily: "Rajdhani, sans-serif" }}
            >
              Harvesting Energy<br />
              <span className="text-primary">Step by Step</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-md text-[15px]">
              Piezoelectric sensors embedded beneath a 14.4 m² veranda walkway capture mechanical energy from
              human footsteps and convert it to regulated DC electricity — powering perimeter lighting and IoT
              monitoring nodes with zero grid dependence.
            </p>
            <div className="flex flex-wrap gap-3">
              {["PZT-5H Ceramic", "IP67 Rated", "MQTT Telemetry", "BMS Protected"].map((tag) => (
                <span key={tag} className="text-xs font-mono text-muted-foreground border border-border rounded px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Hero stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 bg-card border border-primary/20 rounded-lg p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-mono tracking-widest uppercase">Today's Energy Yield</p>
                <p className="text-4xl font-bold font-mono text-primary mt-1">{totalWh}<span className="text-xl text-muted-foreground ml-1">Wh</span></p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-5">
              <p className="text-muted-foreground text-xs font-mono mb-2">Steps Logged</p>
              <p className="text-2xl font-bold font-mono">{totalSteps.toLocaleString()}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-5">
              <p className="text-muted-foreground text-xs font-mono mb-2">Peak Output</p>
              <p className="text-2xl font-bold font-mono">{peakWatts} <span className="text-primary text-base">W</span></p>
            </div>
            <div className="bg-card border border-border rounded-lg p-5">
              <p className="text-muted-foreground text-xs font-mono mb-2">System Efficiency</p>
              <p className="text-2xl font-bold font-mono">85 <span className="text-primary text-base">%</span></p>
            </div>
            <div className="bg-card border border-border rounded-lg p-5">
              <p className="text-muted-foreground text-xs font-mono mb-2">Sensor Tiles</p>
              <p className="text-2xl font-bold font-mono">48 <span className="text-muted-foreground text-sm">PZT</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live KPI row ── */}
      <section className="border-b border-border bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="Avg. Power / Step" value={liveAvgPowerPerStep.toFixed(1)} unit="W" sub="700 N avg. force, 75 kg adult" icon={Zap} />
          <KpiCard label="Daily Storage" value={liveDailyStorage.toFixed(2)} unit="kWh" sub="per average occupancy day" icon={TrendingUp} />
          <KpiCard label="Battery SOC" value={liveBatterySoc} unit="%" sub="12 V / 20 Ah Li-Ion pack" icon={Cpu} />
          <KpiCard label="Active Sensors" value={liveActiveSensors} unit="/ 48" sub="All elements nominal" icon={Radio} />
        </div>
      </section>

      {/* ── System Diagram ── */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <SectionHeading label="§ 01 — Architecture" title="Walkway Schematic & Signal Flow" />
          <VerandaDiagram />
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <SectionHeading label="§ 02 — Operating Principle" title="Six-Stage Energy Conversion" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {workingStepsData.map((step) => (
              <div
                key={step.num}
                className="bg-card border border-border rounded-lg p-6 flex flex-col gap-4 hover:border-primary/30 transition-colors duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-primary font-mono text-sm font-bold">{step.num}</span>
                  <div className="flex-1 h-px bg-border group-hover:bg-primary/20 transition-colors" />
                  <ArrowDown className="w-3 h-3 text-primary opacity-40" />
                </div>
                <h3
                  className="text-lg font-bold tracking-wide"
                  style={{ fontFamily: "Rajdhani, sans-serif" }}
                >
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Charts ── */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <SectionHeading label="§ 03 — Performance Data" title="Real-Time Monitoring & Analytics" />

          {/* Tab selector */}
          <div className="flex gap-1 mb-8 bg-card border border-border rounded-lg p-1 w-fit">
            {(["power", "energy", "efficiency"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2 rounded text-xs font-mono tracking-widest uppercase transition-all duration-200 ${
                  activeTab === t
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            {activeTab === "power" && (
              <>
                <p className="text-muted-foreground text-xs font-mono tracking-widest uppercase mb-6">
                  Instantaneous Power Output — Watts (W) by Hour of Day
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={currentHourlyPower}>
                    <defs>
                      <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a3ff47" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#a3ff47" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(163,255,71,0.07)" />
                    <XAxis dataKey="time" tick={{ fill: "#6b7a8f", fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6b7a8f", fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip unit="W" />} />
                    <Area type="monotone" dataKey="watts" name="Power" stroke="#a3ff47" strokeWidth={2} fill="url(#powerGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </>
            )}
            {activeTab === "energy" && (
              <>
                <p className="text-muted-foreground text-xs font-mono tracking-widest uppercase mb-6">
                  Daily Energy Yield — Kilowatt-hours (kWh) This Week
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={currentWeeklyEnergy}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(163,255,71,0.07)" />
                    <XAxis dataKey="day" tick={{ fill: "#6b7a8f", fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6b7a8f", fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip unit="kWh" />} />
                    <Bar dataKey="kWh" name="Energy" fill="#a3ff47" radius={[3, 3, 0, 0]} opacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
            {activeTab === "efficiency" && (
              <>
                <p className="text-muted-foreground text-xs font-mono tracking-widest uppercase mb-6">
                  Overall System Efficiency (%) — 6-Month Trend
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={currentEfficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(163,255,71,0.07)" />
                    <XAxis dataKey="month" tick={{ fill: "#6b7a8f", fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[65, 90]} tick={{ fill: "#6b7a8f", fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip unit="%" />} />
                    <Line type="monotone" dataKey="efficiency" name="Efficiency" stroke="#a3ff47" strokeWidth={2.5} dot={{ fill: "#a3ff47", r: 4, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Component Table ── */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <SectionHeading label="§ 04 — Component Manifest" title="Bill of Materials & Status" />
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    {["ID", "Component", "Type / Model", "Qty", "Voltage", "Status"].map((h) => (
                      <th key={h} className="text-left text-xs font-mono tracking-widest uppercase text-muted-foreground px-5 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentComponents.map((c, i) => (
                    <tr
                      key={c.id}
                      className={`border-b border-border hover:bg-secondary/30 transition-colors ${i % 2 === 0 ? "" : "bg-secondary/10"}`}
                    >
                      <td className="px-5 py-3 font-mono text-xs text-primary">{c.id}</td>
                      <td className="px-5 py-3 font-medium text-foreground">{c.label}</td>
                      <td className="px-5 py-3 text-muted-foreground font-mono text-xs">{c.type}</td>
                      <td className="px-5 py-3 font-mono text-xs">{c.count}</td>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{c.voltage}</td>
                      <td className="px-5 py-3">
                        <Badge label={c.status} active={c.status === "ACTIVE"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── Technical Specifications ── */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <SectionHeading label="§ 05 — Technical Specifications" title="System Parameters & Design Values" />
          <div className="grid md:grid-cols-2 gap-4">
            {specsData.map(([param, value]) => (
              <div key={param} className="bg-card border border-border rounded-lg px-5 py-4 flex items-start justify-between gap-4 hover:border-primary/20 transition-colors">
                <span className="text-muted-foreground text-sm">{param}</span>
                <span className="font-mono text-sm text-foreground text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Applications ── */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <SectionHeading label="§ 06 — Applications & Impact" title="Where the Power Goes" />
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: Zap,
                title: "Veranda Lighting",
                desc: "12 × 5 W LED strips powered continuously from battery storage. Estimated 8 h runtime per night from daily harvest.",
                kWh: "0.48 kWh / night",
              },
              {
                icon: Cpu,
                title: "IoT Sensor Network",
                desc: "6 × ESP32 perimeter sensors, 2 × soil moisture probes, 1 × weather station — all running on the harvested 5 V rail.",
                kWh: "0.12 kWh / day",
              },
              {
                icon: Settings,
                title: "Monitoring Dashboard",
                desc: "Raspberry Pi 4B hosting this real-time telemetry stack, powered from the 12 V bus. Zero-grid-dependency operation.",
                kWh: "0.10 kWh / day",
              },
            ].map((app) => (
              <div key={app.title} className="bg-card border border-border rounded-lg p-6 flex flex-col gap-4 hover:border-primary/30 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <app.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1" style={{ fontFamily: "Rajdhani, sans-serif" }}>{app.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{app.desc}</p>
                </div>
                <div className="mt-auto pt-3 border-t border-border">
                  <span className="text-primary font-mono text-xs">{app.kWh}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Zap className="w-3 h-3 text-primary" />
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              Footstep Power Generation System &mdash; Engineering Design Report
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs font-mono text-muted-foreground">
            <span>Node: VERANDA-01</span>
            <span>Firmware: v2.4.1</span>
            <span>© 2025 Research Team</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
