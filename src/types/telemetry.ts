/**
 * AEGIS-SUBTERRA shared domain types.
 * These types are the contract between the UI and the data layer.
 * When the Flask REST/WebSocket backend lands, only src/services/* changes.
 */

export type StatusLevel = "nominal" | "caution" | "critical" | "offline";

export type ScenarioId =
  | "normal"
  | "gas-leak"
  | "trapped-worker"
  | "fire-smoke"
  | "structural"
  | "comms-loss";

export interface GasReading {
  id: "mq7" | "mq2" | "mq9";
  sensor: string;
  label: string;
  value: number;
  unit: string;
  warn: number;
  critical: number;
  status: StatusLevel;
  history: number[];
}

export interface ClimateReading {
  temperature: number;
  humidity: number;
  temperatureTrend: number;
  humidityTrend: number;
}

export interface StructuralReading {
  roll: number;
  pitch: number;
  clearance: number;
  vibration: number[];
  status: StatusLevel;
}

export interface Detection {
  id: string;
  label: "Person" | "Fire" | "Smoke" | "Obstacle";
  confidence: number;
  /** normalized 0..1 box within the frame */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface VisionState {
  model: "YOLO11s";
  fps: number;
  inferenceMs: number;
  latencyMs: number;
  resolution: string;
  cameraId: string;
  online: boolean;
  detections: Detection[];
}

export interface MapPoint {
  x: number;
  y: number;
}

export interface MapMarker extends MapPoint {
  id: string;
  kind: "obstacle" | "hazard" | "worker";
  label: string;
}

export interface ScanRay {
  angle: number;
  distance: number;
}

export interface MapState {
  rover: MapPoint;
  heading: number;
  trail: MapPoint[];
  boundaries: MapPoint[][];
  markers: MapMarker[];
  rays: ScanRay[];
  sweepAngle: number;
}

export interface LinkState {
  rssi: number;
  latencyMs: number;
  packetLoss: number;
  ssid: string;
  online: boolean;
}

export interface SystemState {
  rover: StatusLevel;
  camera: StatusLevel;
  aiEngine: StatusLevel;
  sensorsOnline: number;
  sensorsTotal: number;
  network: StatusLevel;
  battery: number;
  threatLevel: StatusLevel;
}

export interface AlertEvent {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  detail: string;
  source: string;
  timestamp: number;
}

export interface RoverCommand {
  id: string;
  command: "FORWARD" | "BACKWARD" | "LEFT" | "RIGHT" | "STOP";
  timestamp: number;
  ack: boolean;
}

export interface TelemetryFrame {
  t: number;
  gases: GasReading[];
  climate: ClimateReading;
  structural: StructuralReading;
  vision: VisionState;
  map: MapState;
  link: LinkState;
  system: SystemState;
  scenario: ScenarioId;
}

/** One flattened row of the live telemetry log / CSV export. */
export interface LogRow {
  time: string;
  mq7: number;
  mq2: number;
  mq9: number;
  temp: number;
  humidity: number;
  roll: number;
  pitch: number;
  distance: number;
  status: string;
}
