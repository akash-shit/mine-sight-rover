/**
 * AEGIS-SUBTERRA — MOCK TELEMETRY ENGINE
 * ---------------------------------------------------------------
 * The single source of every live number in the UI. No component
 * ever hardcodes a sensor value; they all read frames emitted here.
 *
 * Emits one TelemetryFrame per second plus alert events, exactly as the
 * future Flask WebSocket channel will. Swap this for the real transport
 * in src/services/api.ts without touching a single component.
 */

import type {
  AlertEvent,
  Detection,
  GasReading,
  MapMarker,
  MapPoint,
  RoverCommand,
  ScanRay,
  ScenarioId,
  StatusLevel,
  TelemetryFrame,
} from "@/types/telemetry";

export const SCENARIOS: {
  id: ScenarioId;
  name: string;
  blurb: string;
}[] = [
  { id: "normal", name: "Normal Exploration", blurb: "Nominal sweep of tunnel section B-4" },
  { id: "gas-leak", name: "Gas Leak", blurb: "CO + methane threshold breach" },
  { id: "trapped-worker", name: "Trapped Worker", blurb: "Human detected behind debris" },
  { id: "fire-smoke", name: "Fire / Smoke", blurb: "Combustion signature + heat spike" },
  { id: "structural", name: "Structural Instability", blurb: "Roof vibration, tilt anomaly" },
  { id: "comms-loss", name: "Communication Loss", blurb: "Wi-Fi link degradation" },
];

export const MISSION_ID = "MSN-2026-0439";
export const ROVER_ID = "AEG-R1";
export const CAMERA_ID = "CAM-01";

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const round = (v: number, d = 1) => Number(v.toFixed(d));

type GasSpec = {
  id: GasReading["id"];
  sensor: string;
  label: string;
  unit: string;
  warn: number;
  critical: number;
  base: number;
};

const GAS_SPECS: GasSpec[] = [
  { id: "mq7", sensor: "MQ-7", label: "Carbon Monoxide", unit: "ppm", warn: 35, critical: 80, base: 12 },
  { id: "mq2", sensor: "MQ-2", label: "Methane / Smoke", unit: "ppm", warn: 900, critical: 1800, base: 420 },
  { id: "mq9", sensor: "MQ-9", label: "Combustible Gas", unit: "ppm", warn: 700, critical: 1400, base: 300 },
];

/** Scenario multipliers applied to the baseline random walk. */
const SCENARIO_GAS_TARGET: Record<ScenarioId, Record<GasReading["id"], number>> = {
  normal: { mq7: 12, mq2: 420, mq9: 300 },
  "gas-leak": { mq7: 96, mq2: 2100, mq9: 820 },
  "trapped-worker": { mq7: 41, mq2: 640, mq9: 380 },
  "fire-smoke": { mq7: 132, mq2: 1950, mq9: 1620 },
  structural: { mq7: 26, mq2: 700, mq9: 420 },
  "comms-loss": { mq7: 18, mq2: 480, mq9: 320 },
};

const gasStatus = (spec: GasSpec, value: number): StatusLevel =>
  value >= spec.critical ? "critical" : value >= spec.warn ? "caution" : "nominal";

const TUNNEL_BOUNDARIES: MapPoint[][] = [
  [
    { x: 8, y: 62 },
    { x: 30, y: 60 },
    { x: 48, y: 44 },
    { x: 70, y: 42 },
    { x: 88, y: 26 },
  ],
  [
    { x: 8, y: 82 },
    { x: 32, y: 80 },
    { x: 52, y: 64 },
    { x: 72, y: 62 },
    { x: 92, y: 46 },
  ],
  [
    { x: 52, y: 64 },
    { x: 56, y: 88 },
    { x: 78, y: 92 },
  ],
];

const BASE_MARKERS: MapMarker[] = [
  { id: "m1", kind: "obstacle", x: 34, y: 72, label: "Collapsed support" },
  { id: "m2", kind: "obstacle", x: 63, y: 55, label: "Debris field" },
];

const DETECTION_POOL: Record<ScenarioId, Omit<Detection, "id">[]> = {
  normal: [{ label: "Obstacle", confidence: 0.81, x: 0.58, y: 0.52, w: 0.24, h: 0.3 }],
  "gas-leak": [
    { label: "Obstacle", confidence: 0.77, x: 0.12, y: 0.48, w: 0.22, h: 0.32 },
    { label: "Smoke", confidence: 0.68, x: 0.5, y: 0.18, w: 0.36, h: 0.34 },
  ],
  "trapped-worker": [
    { label: "Person", confidence: 0.94, x: 0.4, y: 0.34, w: 0.2, h: 0.46 },
    { label: "Obstacle", confidence: 0.83, x: 0.06, y: 0.55, w: 0.26, h: 0.3 },
  ],
  "fire-smoke": [
    { label: "Fire", confidence: 0.91, x: 0.55, y: 0.42, w: 0.26, h: 0.34 },
    { label: "Smoke", confidence: 0.86, x: 0.28, y: 0.12, w: 0.44, h: 0.36 },
  ],
  structural: [
    { label: "Obstacle", confidence: 0.88, x: 0.3, y: 0.3, w: 0.4, h: 0.42 },
  ],
  "comms-loss": [],
};

export interface TelemetrySource {
  /** Subscribe to the 1 Hz telemetry stream. Returns an unsubscribe fn. */
  subscribeTelemetry(cb: (frame: TelemetryFrame) => void): () => void;
  /** Subscribe to alert/threat events. Returns an unsubscribe fn. */
  subscribeAlerts(cb: (alert: AlertEvent) => void): () => void;
  /** Subscribe to rover command acknowledgements. Returns an unsubscribe fn. */
  subscribeCommands(cb: (command: RoverCommand) => void): () => void;
  getFrame(): TelemetryFrame;
  setScenario(scenario: ScenarioId): void;
  getScenario(): ScenarioId;
  sendCommand(command: RoverCommand["command"]): Promise<RoverCommand>;
  start(): void;
  stop(): void;
  isRunning(): boolean;
}

export class MockTelemetryEngine implements TelemetrySource {
  private timer: ReturnType<typeof setInterval> | null = null;
  private running = false;
  private scenario: ScenarioId = "normal";
  private tick = 0;

  private gasValues: Record<GasReading["id"], number> = { mq7: 12, mq2: 420, mq9: 300 };
  private gasHistory: Record<GasReading["id"], number[]> = { mq7: [], mq2: [], mq9: [] };
  private temperature = 26.4;
  private humidity = 61;
  private prevTemperature = 26.4;
  private prevHumidity = 61;
  private roll = 1.2;
  private pitch = -0.8;
  private clearance = 148;
  private vibration: number[] = Array.from({ length: 64 }, () => 0);
  private battery = 87;
  private trail: MapPoint[] = [{ x: 12, y: 71 }];
  private roverPos: MapPoint = { x: 12, y: 71 };
  private heading = 12;
  private sweepAngle = 0;
  private lastAlertKey: Record<string, number> = {};

  private telemetrySubs = new Set<(f: TelemetryFrame) => void>();
  private alertSubs = new Set<(a: AlertEvent) => void>();
  private commandSubs = new Set<(c: RoverCommand) => void>();

  private frame: TelemetryFrame = this.build();

  // ---------- lifecycle ----------

  start() {
    if (this.timer) return;
    this.running = true;
    this.timer = setInterval(() => this.step(), 1000);
    this.step();
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.running = false;
  }

  isRunning() {
    return this.running;
  }

  // ---------- subscriptions ----------

  subscribeTelemetry(cb: (f: TelemetryFrame) => void) {
    this.telemetrySubs.add(cb);
    cb(this.frame);
    return () => this.telemetrySubs.delete(cb);
  }

  subscribeAlerts(cb: (a: AlertEvent) => void) {
    this.alertSubs.add(cb);
    return () => this.alertSubs.delete(cb);
  }

  subscribeCommands(cb: (c: RoverCommand) => void) {
    this.commandSubs.add(cb);
    return () => this.commandSubs.delete(cb);
  }

  getFrame() {
    return this.frame;
  }

  getScenario() {
    return this.scenario;
  }

  setScenario(scenario: ScenarioId) {
    if (scenario === this.scenario) return;
    this.scenario = scenario;
    const meta = SCENARIOS.find((s) => s.id === scenario)!;
    this.emitAlert({
      severity: scenario === "normal" ? "info" : scenario === "comms-loss" ? "warning" : "critical",
      title: `SCENARIO ENGAGED — ${meta.name.toUpperCase()}`,
      detail: meta.blurb,
      source: "DEMO MODE",
    });
    if (scenario === "trapped-worker") {
      this.emitAlert({
        severity: "critical",
        title: "HUMAN SIGNATURE DETECTED",
        detail: "YOLO11s person class at 94% confidence, 6.2 m ahead",
        source: "AI VISION",
      });
    }
    if (scenario === "structural") {
      this.emitAlert({
        severity: "critical",
        title: "ROOF INSTABILITY SUSPECTED",
        detail: "MPU6050 vibration amplitude beyond safe envelope",
        source: "MPU6050",
      });
    }
    if (scenario === "comms-loss") {
      this.emitAlert({
        severity: "warning",
        title: "TELEMETRY LINK DEGRADED",
        detail: "Wi-Fi RSSI collapse, packet loss climbing",
        source: "LINK STATUS",
      });
    }
    this.step();
  }

  async sendCommand(command: RoverCommand["command"]): Promise<RoverCommand> {
    const cmd: RoverCommand = {
      id: `cmd-${Date.now()}-${Math.round(Math.random() * 1e4)}`,
      command,
      timestamp: Date.now(),
      ack: this.scenario !== "comms-loss",
    };
    if (command === "STOP") {
      this.emitAlert({
        severity: "warning",
        title: "EMERGENCY STOP ENGAGED",
        detail: "Operator halted all rover drive output",
        source: "ROVER CONTROL",
      });
    }
    this.commandSubs.forEach((cb) => cb(cmd));
    return cmd;
  }

  // ---------- simulation ----------

  private step() {
    this.tick += 1;
    const s = this.scenario;

    // gases drift toward the scenario target
    for (const spec of GAS_SPECS) {
      const target = SCENARIO_GAS_TARGET[s][spec.id];
      const current = this.gasValues[spec.id];
      const next = clamp(
        current + (target - current) * 0.28 + rand(-1, 1) * (spec.base * 0.05),
        0,
        spec.critical * 2.2,
      );
      this.gasValues[spec.id] = next;
      const hist = this.gasHistory[spec.id];
      hist.push(round(next, 1));
      if (hist.length > 40) hist.shift();

      const status = gasStatus(spec, next);
      if (status === "critical") {
        this.throttledAlert(`gas-${spec.id}`, {
          severity: "critical",
          title: `${spec.sensor} CRITICAL — ${spec.label.toUpperCase()}`,
          detail: `${round(next, 1)} ${spec.unit} exceeds critical threshold of ${spec.critical} ${spec.unit}`,
          source: `${spec.sensor}/SENSOR BUS`,
        });
      } else if (status === "caution") {
        this.throttledAlert(`gas-warn-${spec.id}`, {
          severity: "warning",
          title: `${spec.sensor} THRESHOLD EXCEEDED`,
          detail: `${round(next, 1)} ${spec.unit} above warning threshold of ${spec.warn} ${spec.unit}`,
          source: `${spec.sensor}/SENSOR BUS`,
        });
      }
    }

    // climate
    this.prevTemperature = this.temperature;
    this.prevHumidity = this.humidity;
    const tempTarget = s === "fire-smoke" ? 61 : s === "gas-leak" ? 33 : 26.5;
    const humTarget = s === "fire-smoke" ? 32 : s === "gas-leak" ? 68 : 61;
    this.temperature = clamp(this.temperature + (tempTarget - this.temperature) * 0.22 + rand(-0.3, 0.3), 5, 95);
    this.humidity = clamp(this.humidity + (humTarget - this.humidity) * 0.22 + rand(-0.6, 0.6), 5, 99);
    if (this.temperature > 55) {
      this.throttledAlert("temp", {
        severity: "critical",
        title: "HEAT SIGNATURE CRITICAL",
        detail: `DHT22 reads ${round(this.temperature)}°C — probable combustion source`,
        source: "DHT22",
      });
    }

    // structural
    const unstable = s === "structural";
    const amp = unstable ? 1 : 0.16;
    this.vibration = Array.from({ length: 64 }, (_, i) => {
      const base = Math.sin((this.tick * 0.6 + i * 0.35)) * amp * 0.5;
      const noise = rand(-amp, amp) * 0.5;
      return round(clamp(base + noise, -1, 1), 3);
    });
    this.roll = clamp(this.roll + (unstable ? rand(-3.5, 3.5) : rand(-0.4, 0.4)), -22, 22);
    this.pitch = clamp(this.pitch + (unstable ? rand(-3, 3) : rand(-0.35, 0.35)), -18, 18);
    this.clearance = clamp(this.clearance + rand(-9, 9) - (unstable ? 4 : 0), 18, 260);
    if (this.clearance < 40) {
      this.throttledAlert("clearance", {
        severity: "warning",
        title: "OBSTACLE PROXIMITY",
        detail: `HC-SR04 clearance ${round(this.clearance)} cm ahead of rover`,
        source: "HC-SR04",
      });
    }

    // rover motion along tunnel
    if (s !== "comms-loss") {
      const speed = 0.55;
      this.heading = 12 + Math.sin(this.tick * 0.08) * 16;
      const rad = (this.heading * Math.PI) / 180;
      const nx = clamp(this.roverPos.x + Math.cos(rad) * speed, 8, 90);
      const ny = clamp(this.roverPos.y - Math.sin(rad) * speed * 0.7, 26, 90);
      if (nx >= 89.5) {
        this.roverPos = { x: 12, y: 71 };
        this.trail = [{ x: 12, y: 71 }];
      } else {
        this.roverPos = { x: nx, y: ny };
        this.trail = [...this.trail.slice(-260), this.roverPos];
      }
    }
    this.sweepAngle = (this.sweepAngle + 9) % 360;

    // battery
    this.battery = clamp(this.battery - 0.02, 6, 100);
    if (this.battery < 15) {
      this.throttledAlert("battery", {
        severity: "warning",
        title: "ROVER BATTERY LOW",
        detail: `${round(this.battery)}% remaining — plan recovery`,
        source: "ROVER STATUS",
      });
    }

    this.frame = this.build();
    this.telemetrySubs.forEach((cb) => cb(this.frame));
  }

  private throttledAlert(key: string, alert: Omit<AlertEvent, "id" | "timestamp">, everyMs = 9000) {
    const now = Date.now();
    if (this.lastAlertKey[key] && now - this.lastAlertKey[key] < everyMs) return;
    this.lastAlertKey[key] = now;
    this.emitAlert(alert);
  }

  private emitAlert(alert: Omit<AlertEvent, "id" | "timestamp">) {
    const full: AlertEvent = {
      ...alert,
      id: `alt-${Date.now()}-${Math.round(Math.random() * 1e5)}`,
      timestamp: Date.now(),
    };
    this.alertSubs.forEach((cb) => cb(full));
  }

  private buildDetections(): Detection[] {
    const pool = DETECTION_POOL[this.scenario];
    const jitter = (v: number) => clamp(v + rand(-0.012, 0.012), 0, 0.96);
    return pool.map((d, i) => ({
      ...d,
      id: `det-${this.scenario}-${i}`,
      x: jitter(d.x),
      y: jitter(d.y),
      confidence: clamp(d.confidence + rand(-0.03, 0.03), 0.4, 0.99),
    }));
  }

  private buildRays(): ScanRay[] {
    return Array.from({ length: 24 }, (_, i) => {
      const angle = -60 + i * 5;
      const base = 120 + Math.sin((angle + this.tick * 4) * 0.06) * 60;
      return { angle, distance: round(clamp(base + rand(-18, 18), 20, 240)) };
    });
  }

  private build(): TelemetryFrame {
    const s = this.scenario;
    const commsDown = s === "comms-loss";

    const gases: GasReading[] = GAS_SPECS.map((spec) => {
      const value = round(this.gasValues[spec.id], 1);
      return {
        id: spec.id,
        sensor: spec.sensor,
        label: spec.label,
        value,
        unit: spec.unit,
        warn: spec.warn,
        critical: spec.critical,
        status: gasStatus(spec, value),
        history: [...this.gasHistory[spec.id]],
      };
    });

    const structuralStatus: StatusLevel =
      s === "structural" ? "critical" : Math.abs(this.roll) > 8 || Math.abs(this.pitch) > 7 ? "caution" : "nominal";

    const worstGas = gases.reduce<StatusLevel>((acc, g) => {
      if (g.status === "critical" || acc === "critical") return "critical";
      if (g.status === "caution") return "caution";
      return acc;
    }, "nominal");

    const threatLevel: StatusLevel =
      worstGas === "critical" || structuralStatus === "critical" || s === "fire-smoke" || s === "trapped-worker"
        ? "critical"
        : worstGas === "caution" || commsDown
          ? "caution"
          : "nominal";

    const markers: MapMarker[] = [...BASE_MARKERS];
    if (s === "trapped-worker") {
      markers.push({ id: "w1", kind: "worker", x: this.roverPos.x + 7, y: this.roverPos.y - 5, label: "Worker detected" });
    }
    if (s === "gas-leak") {
      markers.push({ id: "h1", kind: "hazard", x: this.roverPos.x + 5, y: this.roverPos.y + 4, label: "Gas plume" });
    }
    if (s === "fire-smoke") {
      markers.push({ id: "h2", kind: "hazard", x: this.roverPos.x + 6, y: this.roverPos.y - 3, label: "Fire source" });
    }
    if (s === "structural") {
      markers.push({ id: "h3", kind: "hazard", x: this.roverPos.x + 3, y: this.roverPos.y - 6, label: "Roof fracture" });
    }

    return {
      t: Date.now(),
      scenario: s,
      gases,
      climate: {
        temperature: round(this.temperature, 1),
        humidity: round(this.humidity, 1),
        temperatureTrend: round(this.temperature - this.prevTemperature, 2),
        humidityTrend: round(this.humidity - this.prevHumidity, 2),
      },
      structural: {
        roll: round(this.roll, 2),
        pitch: round(this.pitch, 2),
        clearance: round(this.clearance, 0),
        vibration: this.vibration,
        status: structuralStatus,
      },
      vision: {
        model: "YOLO11s",
        fps: commsDown ? 0 : round(rand(21, 27), 1),
        inferenceMs: commsDown ? 0 : round(rand(28, 44), 1),
        latencyMs: commsDown ? 0 : round(rand(70, 140), 0),
        resolution: "640 × 480",
        cameraId: CAMERA_ID,
        online: !commsDown,
        detections: commsDown ? [] : this.buildDetections(),
      },
      map: {
        rover: this.roverPos,
        heading: round(this.heading, 1),
        trail: this.trail,
        boundaries: TUNNEL_BOUNDARIES,
        markers,
        rays: commsDown ? [] : this.buildRays(),
        sweepAngle: this.sweepAngle,
      },
      link: {
        rssi: commsDown ? round(rand(-94, -86)) : round(rand(-62, -48)),
        latencyMs: commsDown ? round(rand(680, 1400)) : round(rand(38, 96)),
        packetLoss: commsDown ? round(rand(28, 62), 1) : round(rand(0, 1.6), 1),
        ssid: "AEGIS-SURFACE-AP",
        online: !commsDown,
      },
      system: {
        rover: commsDown ? "offline" : s === "structural" ? "caution" : "nominal",
        camera: commsDown ? "offline" : "nominal",
        aiEngine: commsDown ? "caution" : "nominal",
        sensorsOnline: commsDown ? 5 : 8,
        sensorsTotal: 8,
        network: commsDown ? "critical" : "nominal",
        battery: round(this.battery, 0),
        threatLevel,
      },
    };
  }
}

/** Seed rows so the mission log is never empty on first paint. */
export const SEED_ALERTS: AlertEvent[] = [
  {
    id: "seed-3",
    severity: "info",
    title: "MISSION SESSION OPENED",
    detail: `${MISSION_ID} — rover ${ROVER_ID} deployed to tunnel section B-4`,
    source: "MISSION LOG",
    timestamp: Date.now() - 42000,
  },
  {
    id: "seed-2",
    severity: "info",
    title: "SENSOR BUS CALIBRATED",
    detail: "MQ-2 / MQ-7 / MQ-9 warm-up complete, DHT22 and MPU6050 nominal",
    source: "SENSOR BUS",
    timestamp: Date.now() - 28000,
  },
  {
    id: "seed-1",
    severity: "info",
    title: "AI ENGINE ONLINE",
    detail: "YOLO11s weights loaded on surface server, stream bound to CAM-01",
    source: "AI PERCEPTION",
    timestamp: Date.now() - 12000,
  },
];
