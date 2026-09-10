import type {
  AlertEvent,
  ClimateReading,
  Detection,
  GasReading,
  LinkState,
  LogRow,
  MapMarker,
  MapState,
  ScenarioId,
  StatusLevel,
  StructuralReading,
  SystemState,
  TelemetryFrame,
  VisionState,
} from "@/types/telemetry";

export const MISSION_ID = "MSN-2026-0439";
export const ROVER_ID = "AEG-R1";
export const CAMERA_ID = "CAM-01";

export const SCENARIOS: { id: ScenarioId; name: string; blurb: string }[] = [
  { id: "normal", name: "Normal Exploration", blurb: "Nominal sweep of tunnel section B-4" },
  { id: "gas-leak", name: "Gas Leak", blurb: "CO + methane threshold breach" },
  { id: "trapped-worker", name: "Trapped Worker", blurb: "Human detected behind debris" },
  { id: "fire-smoke", name: "Fire / Smoke", blurb: "Combustion signature + heat spike" },
  { id: "structural", name: "Structural Instability", blurb: "Roof vibration, tilt anomaly" },
  { id: "comms-loss", name: "Communication Loss", blurb: "Wi-Fi link degradation" },
];

export type DemoScenario =
  | "NORMAL"
  | "GAS_LEAK"
  | "TRAPPED_WORKER"
  | "FIRE_SMOKE"
  | "STRUCTURAL_INSTABILITY"
  | "COMMUNICATION_LOSS";

export type RoverCommand = "FORWARD" | "BACKWARD" | "LEFT" | "RIGHT" | "STOP";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:5000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options,
  });

  if (!res.ok) {
    let message = `API error ${res.status} on ${path}`;
    try {
      const payload = (await res.json()) as { message?: string };
      if (payload.message) {
        message = payload.message;
      }
    } catch {
      // ignore JSON parsing failures and keep the default status message
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export interface TelemetryPayload {
  timestamp: string | null;
  gas: {
    mq7: { raw?: number; ppm: number; status: "NORMAL" | "WARNING" | "CRITICAL" };
    mq2: { raw?: number; ppm: number; status: "NORMAL" | "WARNING" | "CRITICAL" };
    mq9: { raw?: number; ppm: number; status: "NORMAL" | "WARNING" | "CRITICAL" };
  };
  environment: { temperature: number; humidity: number };
  imu: { roll: number; pitch: number; yaw: number; vibration: number };
  distance: { front: number; left: number; right: number };
  rover: { x: number; y: number; battery: number; online: boolean; heading: number };
  camera: { online: boolean; fps: number; latency_ms: number };
  ai: {
    person_detected: boolean;
    person_count: number;
    detections: Array<{ class?: string; confidence?: number; x?: number; y?: number; w?: number; h?: number }>;
  };
  communication: { mode: string; rssi_dbm: number; latency_ms: number; packet_pct: number };
}

export interface RoverStatusPayload {
  online: boolean;
  battery: number;
  camera: boolean;
  position: { x: number; y: number; heading: number };
  mode: string;
  last_command: string;
  last_command_at: string | null;
  last_seen: string;
}

export interface AlertPayload {
  id: string;
  timestamp: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  category: string;
  message: string;
}

export interface AIDetectionsPayload {
  model: string;
  status: string;
  fps: number;
  inference_ms: number;
  detections: Array<{ class?: string; confidence?: number; x?: number; y?: number; w?: number; h?: number }>;
  person_detected: boolean;
  person_count: number;
}

export interface MapPayload {
  rover: { x: number; y: number; heading: number };
  path: Array<{ x: number; y: number }>;
  scan_points: Array<{ angle: number; distance: number; x: number; y: number }>;
  obstacles: Array<{ x: number; y: number; label?: string }>;
  hazards: Array<{ x: number; y: number; label?: string }>;
}

export interface SystemStatusPayload {
  rover_online: boolean;
  camera_streaming: boolean;
  ai_engine: string;
  sensors_online: number;
  sensors_total: number;
  network: string;
  battery: number;
  using_real_hardware: boolean;
  demo_scenario: DemoScenario;
}

export interface DemoScenarioPayload {
  scenario: DemoScenario;
  options: DemoScenario[];
}

export interface TelemetryLogPayload extends TelemetryPayload {
  timestamp: string;
}

export const getTelemetry = () => apiFetch<TelemetryPayload>("/api/telemetry");
export const getTelemetryLog = (limit = 200) => apiFetch<TelemetryLogPayload[]>(`/api/telemetry/log?limit=${limit}`);
export const getRoverStatus = () => apiFetch<RoverStatusPayload>("/api/rover/status");
export const sendRoverCommand = (command: RoverCommand) =>
  apiFetch<{ status: string; acknowledged: string }>("/api/rover/command", {
    method: "POST",
    body: JSON.stringify({ command }),
  });
export const getAlerts = (limit = 50) => apiFetch<AlertPayload[]>(`/api/alerts?limit=${limit}`);
export const getAIDetections = () => apiFetch<AIDetectionsPayload>("/api/ai/detections");
export const getMapData = () => apiFetch<MapPayload>("/api/mapping");
export const getSystemStatus = () => apiFetch<SystemStatusPayload>("/api/system/status");
export const setDemoScenario = (scenario: DemoScenario) =>
  apiFetch<{ status: string; scenario: DemoScenario }>("/api/demo/scenario", {
    method: "POST",
    body: JSON.stringify({ scenario }),
  });
export const getDemoScenario = () => apiFetch<DemoScenarioPayload>("/api/demo/scenario");

export const SEED_ALERTS: AlertEvent[] = [];

const gasSpecs = [
  { id: "mq7", sensor: "MQ-7", label: "Carbon Monoxide", unit: "ppm", warn: 35, critical: 80 },
  { id: "mq2", sensor: "MQ-2", label: "Methane / Smoke", unit: "ppm", warn: 900, critical: 1800 },
  { id: "mq9", sensor: "MQ-9", label: "Combustible Gas", unit: "ppm", warn: 700, critical: 1400 },
] as const;

const scenarioMap: Record<DemoScenario, ScenarioId> = {
  NORMAL: "normal",
  GAS_LEAK: "gas-leak",
  TRAPPED_WORKER: "trapped-worker",
  FIRE_SMOKE: "fire-smoke",
  STRUCTURAL_INSTABILITY: "structural",
  COMMUNICATION_LOSS: "comms-loss",
};

const parseTimestamp = (value: string | null | undefined) => {
  if (!value) return Date.now();
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Date.now();
};

const toStatusLevel = (status: string | null | undefined): StatusLevel => {
  switch (status?.toUpperCase()) {
    case "CRITICAL":
      return "critical";
    case "WARNING":
      return "caution";
    case "NORMAL":
    default:
      return "nominal";
  }
};

const normalizeGas = (
  gasPayload: TelemetryPayload["gas"][keyof TelemetryPayload["gas"]],
  previousFrame: TelemetryFrame | null,
  id: "mq7" | "mq2" | "mq9",
): GasReading => {
  const spec = gasSpecs.find((s) => s.id === id)!;
  const status = toStatusLevel(gasPayload.status);
  const value = Number(gasPayload.ppm ?? 0);
  const prev = previousFrame?.gases.find((g) => g.id === id);

  return {
    id,
    sensor: spec.sensor,
    label: spec.label,
    value,
    unit: spec.unit,
    warn: spec.warn,
    critical: spec.critical,
    status,
    history: prev ? [...prev.history, value].slice(-40) : [value],
  };
};

const normalizeDetections = (detections: AIDetectionsPayload["detections"]): Detection[] =>
  detections.map((item, index) => {
    const label = (() => {
      const className = (item.class ?? "Obstacle").toLowerCase();
      if (className.includes("person")) return "Person";
      if (className.includes("fire")) return "Fire";
      if (className.includes("smoke")) return "Smoke";
      return "Obstacle";
    })();

    return {
      id: `det-${index}`,
      label,
      confidence: Number(item.confidence ?? 0.5),
      x: Number(item.x ?? 0.5),
      y: Number(item.y ?? 0.5),
      w: Number(item.w ?? 0.2),
      h: Number(item.h ?? 0.2),
    };
  });

const normalizeMarkers = (map: MapPayload, ai: TelemetryPayload["ai"]): MapMarker[] => {
  const markers: MapMarker[] = [
    ...map.obstacles.map((point, index) => ({
      id: `obstacle-${index}`,
      kind: "obstacle" as const,
      x: point.x,
      y: point.y,
      label: point.label ?? "Obstacle",
    })),
    ...map.hazards.map((point, index) => ({
      id: `hazard-${index}`,
      kind: "hazard" as const,
      x: point.x,
      y: point.y,
      label: point.label ?? "Hazard",
    })),
  ];

  if (ai.person_detected) {
    markers.push({
      id: "worker-detected",
      kind: "worker",
      x: map.rover.x + 7,
      y: map.rover.y - 5,
      label: "Worker detected",
    });
  }

  return markers;
};

const normalizeMapState = (map: MapPayload, ai: TelemetryPayload["ai"]): MapState => ({
  rover: { x: map.rover.x, y: map.rover.y },
  heading: map.rover.heading,
  trail: map.path,
  boundaries: [],
  markers: normalizeMarkers(map, ai),
  rays: map.scan_points.map((point) => ({ angle: point.angle, distance: point.distance })),
  sweepAngle: 0,
});

const normalizeLinkState = (telemetry: TelemetryPayload): LinkState => ({
  rssi: telemetry.communication.rssi_dbm,
  latencyMs: telemetry.communication.latency_ms,
  packetLoss: Math.max(0, 100 - telemetry.communication.packet_pct),
  ssid: telemetry.communication.mode.toUpperCase(),
  online: telemetry.communication.packet_pct > 30,
});

const normalizeVisionState = (telemetry: TelemetryPayload, systemStatus: SystemStatusPayload): VisionState => ({
  model: "YOLO11s",
  fps: telemetry.camera.fps,
  inferenceMs: telemetry.camera.latency_ms,
  latencyMs: telemetry.camera.latency_ms,
  resolution: "640 × 480",
  cameraId: CAMERA_ID,
  online: telemetry.camera.online && systemStatus.camera_streaming,
  detections: normalizeDetections(telemetry.ai.detections),
});

const normalizeClimate = (telemetry: TelemetryPayload, previousFrame: TelemetryFrame | null): ClimateReading => {
  const tempTrend = previousFrame ? telemetry.environment.temperature - previousFrame.climate.temperature : 0;
  const humidityTrend = previousFrame ? telemetry.environment.humidity - previousFrame.climate.humidity : 0;

  return {
    temperature: telemetry.environment.temperature,
    humidity: telemetry.environment.humidity,
    temperatureTrend: Number(tempTrend.toFixed(2)),
    humidityTrend: Number(humidityTrend.toFixed(2)),
  };
};

const normalizeStructural = (telemetry: TelemetryPayload): StructuralReading => ({
  roll: telemetry.imu.roll,
  pitch: telemetry.imu.pitch,
  clearance: Math.round(telemetry.distance.front * 100),
  vibration: Array.from({ length: 64 }, (_, index) => {
    const base = Math.sin(index * 0.35 + telemetry.imu.yaw * 0.02) * telemetry.imu.vibration;
    return Number(Math.max(-1, Math.min(1, base)).toFixed(3));
  }),
  status: telemetry.imu.vibration > 0.25 ? "caution" : "nominal",
});

const normalizeSystemState = (
  telemetry: TelemetryPayload,
  systemStatus: SystemStatusPayload,
  gasReadings: GasReading[],
): SystemState => {
  const worstGas = gasReadings.reduce<StatusLevel>((acc, gas) => {
    if (gas.status === "critical") return "critical";
    if (gas.status === "caution" && acc !== "critical") return "caution";
    return acc;
  }, "nominal");

  const networkStatus: StatusLevel =
    systemStatus.network === "STABLE" ? "nominal" : systemStatus.network === "DEGRADED" ? "caution" : "critical";

  return {
    rover: telemetry.rover.online ? "nominal" : "offline",
    camera: telemetry.camera.online && systemStatus.camera_streaming ? "nominal" : "offline",
    aiEngine: systemStatus.ai_engine === "ACTIVE" ? "nominal" : "caution",
    sensorsOnline: systemStatus.sensors_online,
    sensorsTotal: systemStatus.sensors_total,
    network: networkStatus,
    battery: systemStatus.battery,
    threatLevel: worstGas === "critical" || networkStatus === "critical" ? "critical" : worstGas === "caution" ? "caution" : "nominal",
  };
};

export function normalizeTelemetryFrame(
  telemetry: TelemetryPayload,
  mapData: MapPayload,
  systemStatus: SystemStatusPayload,
  previousFrame: TelemetryFrame | null,
): TelemetryFrame {
  const gasReadings = gasSpecs.map((spec) => normalizeGas(telemetry.gas[spec.id], previousFrame, spec.id));

  return {
    t: parseTimestamp(telemetry.timestamp),
    scenario: scenarioMap[systemStatus.demo_scenario],
    gases: gasReadings,
    climate: normalizeClimate(telemetry, previousFrame),
    structural: normalizeStructural(telemetry),
    vision: normalizeVisionState(telemetry, systemStatus),
    map: normalizeMapState(mapData, telemetry.ai),
    link: normalizeLinkState(telemetry),
    system: normalizeSystemState(telemetry, systemStatus, gasReadings),
  };
}

export function normalizeAlerts(alerts: AlertPayload[]): AlertEvent[] {
  return alerts.map((alert) => ({
    id: alert.id,
    severity: alert.severity.toLowerCase() as AlertEvent["severity"],
    title: alert.category,
    detail: alert.message,
    source: alert.category,
    timestamp: parseTimestamp(alert.timestamp),
  }));
}

export function normalizeLogRows(logRows: TelemetryLogPayload[]): LogRow[] {
  return logRows.map((row) => ({
    time: new Date(parseTimestamp(row.timestamp)).toLocaleTimeString("en-GB", { hour12: false }),
    mq7: Number(row.gas.mq7.ppm),
    mq2: Number(row.gas.mq2.ppm),
    mq9: Number(row.gas.mq9.ppm),
    temp: Number(row.environment.temperature),
    humidity: Number(row.environment.humidity),
    roll: Number(row.imu.roll),
    pitch: Number(row.imu.pitch),
    distance: Math.round(row.distance.front * 100),
    status: normalizeStatusLabel(row.gas),
  }));
}

function normalizeStatusLabel(gas: TelemetryPayload["gas"]): LogRow["status"] {
  const statuses = [gas.mq7.status, gas.mq2.status, gas.mq9.status];
  if (statuses.includes("CRITICAL")) return "CRITICAL";
  if (statuses.includes("WARNING")) return "WARNING";
  return "NORMAL";
}
