/**
 * AEGIS-SUBTERRA — API ABSTRACTION LAYER
 * ---------------------------------------------------------------
 * THIS IS THE ONLY FILE THAT KNOWS WHERE DATA COMES FROM.
 *
 * Today it returns the in-browser MockTelemetryEngine. To move onto the
 * real Flask backend, implement `TelemetrySource` against
 * REST (`GET /api/telemetry`, `POST /api/rover/command`,
 * `POST /api/scenario`) plus the WebSocket channel (`/ws/telemetry`,
 * `/ws/alerts`) and return it from `createTelemetrySource()`.
 * No component, hook, or page needs to change.
 */

import { MockTelemetryEngine, type TelemetrySource } from "./mockData";

export const API_CONFIG = {
  /** Flip to "live" once the Flask server is reachable. */
  mode: (import.meta.env["VITE_AEGIS_API_MODE"] as "mock" | "live") ?? "mock",
  restBaseUrl: (import.meta.env["VITE_AEGIS_API_URL"] as string) ?? "http://localhost:5000/api",
  wsUrl: (import.meta.env["VITE_AEGIS_WS_URL"] as string) ?? "ws://localhost:5000/ws/telemetry",
} as const;

let source: TelemetrySource | null = null;

export function createTelemetrySource(): TelemetrySource {
  if (source) return source;
  // if (API_CONFIG.mode === "live") { source = new FlaskTelemetrySource(API_CONFIG); return source; }
  source = new MockTelemetryEngine();
  return source;
}

export type { TelemetrySource };
export { SCENARIOS, MISSION_ID, ROVER_ID, CAMERA_ID, SEED_ALERTS } from "./mockData";
