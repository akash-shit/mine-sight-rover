/**
 * AEGIS-SUBTERRA — Live backend API service
 *
 * Drop this in as src/services/api.ts, replacing (or sitting alongside)
 * mockData.ts. Every function signature here matches what your
 * mockData.ts functions currently return, so components don't need to
 * change — only the import.
 *
 * Set VITE_API_BASE_URL in your .env (see .env.example) to point at the
 * Flask backend, e.g. http://localhost:5000
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status} on ${path}`);
  }
  return res.json() as Promise<T>;
}

// ---- Types (trim/extend to match your existing types/telemetry.ts) ----

export interface GasReading {
  ppm: number;
  status: "NORMAL" | "WARNING" | "CRITICAL";
}

export interface TelemetryData {
  timestamp: string;
  gas: { mq7: GasReading; mq2: GasReading; mq9: GasReading };
  environment: { temperature: number; humidity: number };
  imu: { roll: number; pitch: number; yaw: number; vibration: number };
  distance: { front: number; left: number; right: number };
  rover: { x: number; y: number; battery: number; online: boolean; heading: number };
  camera: { online: boolean; fps: number; latency_ms: number };
  ai: { person_detected: boolean; person_count: number; detections: any[] };
  communication: { mode: string; rssi_dbm: number; latency_ms: number; packet_pct: number };
}

export interface RoverStatus {
  online: boolean;
  battery: number;
  camera: boolean;
  position: { x: number; y: number; heading: number };
  mode: string;
  last_command: string;
  last_command_at: string | null;
  last_seen: string;
}

export interface Alert {
  id: string;
  timestamp: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  category: string;
  message: string;
  value?: number;
}

export interface AIDetections {
  model: string;
  status: string;
  fps: number;
  inference_ms: number;
  detections: { class: string; confidence: number }[];
  person_detected: boolean;
  person_count: number;
}

export interface MapData {
  rover: { x: number; y: number; heading: number };
  path: { x: number; y: number }[];
  scan_points: { angle: number; distance: number; x: number; y: number }[];
  obstacles: any[];
  hazards: any[];
}

export interface SystemStatus {
  rover_online: boolean;
  camera_streaming: boolean;
  ai_engine: string;
  sensors_online: number;
  sensors_total: number;
  network: string;
  battery: number;
  using_real_hardware: boolean;
  demo_scenario: string;
}

export type RoverCommand = "FORWARD" | "BACKWARD" | "LEFT" | "RIGHT" | "STOP";

export type DemoScenario =
  | "NORMAL"
  | "GAS_LEAK"
  | "TRAPPED_WORKER"
  | "FIRE_SMOKE"
  | "STRUCTURAL_INSTABILITY"
  | "COMMUNICATION_LOSS";

// ---- API functions (match your mockData.ts function names) ----

export const getTelemetry = () => apiFetch<TelemetryData>("/api/telemetry");

export const getTelemetryLog = (limit = 200) =>
  apiFetch<TelemetryData[]>(`/api/telemetry/log?limit=${limit}`);

export const getRoverStatus = () => apiFetch<RoverStatus>("/api/rover/status");

export const sendRoverCommand = (command: RoverCommand) =>
  apiFetch<{ status: string; acknowledged: string }>("/api/rover/command", {
    method: "POST",
    body: JSON.stringify({ command }),
  });

export const getAlerts = (limit = 50) => apiFetch<Alert[]>(`/api/alerts?limit=${limit}`);

export const getAIDetections = () => apiFetch<AIDetections>("/api/ai/detections");

export const getMapData = () => apiFetch<MapData>("/api/mapping");

export const getSystemStatus = () => apiFetch<SystemStatus>("/api/system/status");

export const setDemoScenario = (scenario: DemoScenario) =>
  apiFetch<{ status: string; scenario: string }>("/api/demo/scenario", {
    method: "POST",
    body: JSON.stringify({ scenario }),
  });

export const getDemoScenario = () =>
  apiFetch<{ scenario: DemoScenario; options: DemoScenario[] }>("/api/demo/scenario");
