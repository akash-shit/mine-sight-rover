# AEGIS-SUBTERRA — Backend + Frontend Integration

This is a working Flask backend (tested — server boots, mock telemetry ticks
every second, all endpoints respond) matching the architecture we planned:
ESP32 does edge sensing/control, Flask is the central AI + telemetry +
alert server, frontend polls REST endpoints.

## 1. Run the backend

```bash
cd mine-rescue-backend
pip install -r requirements.txt
python app.py
```

Server starts on `http://localhost:5000` and immediately begins generating
realistic mock telemetry once per second — gas readings, temperature,
IMU/vibration, rover position, camera FPS, comms stats — all through one
shared state store (`state.py`), so it behaves exactly like a real ESP32
feed will later.

Quick check:
```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/telemetry
```

## 2. Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/telemetry` | Current sensor snapshot — dashboard polls this every ~1s |
| POST | `/api/telemetry` | Real ESP32 posts readings here (Phase 2+) |
| GET | `/api/telemetry/log?limit=200` | Rolling log for the telemetry table / CSV export |
| GET | `/api/rover/status` | Rover online/battery/position/last command |
| POST | `/api/rover/command` | `{"command":"FORWARD"}` — from the manual override panel |
| GET | `/api/alerts?limit=50` | Threat & Event Center feed |
| GET | `/api/ai/detections` | YOLO11s-style detection payload |
| GET | `/api/mapping` | Tunnel map: rover position, path, scan points |
| POST | `/api/mapping/scan` | Real ESP32 posts one HC-SR04+servo reading (Phase 8+) |
| GET | `/api/system/status` | Header/system-overview strip data |
| GET / POST | `/api/demo/scenario` | **Judge-facing demo control** — see below |

## 3. Demo Mode (this is the important one for SIH)

```bash
curl -X POST http://localhost:5000/api/demo/scenario \
  -H "Content-Type: application/json" \
  -d '{"scenario":"GAS_LEAK"}'
```

Options: `NORMAL`, `GAS_LEAK`, `TRAPPED_WORKER`, `FIRE_SMOKE`,
`STRUCTURAL_INSTABILITY`, `COMMUNICATION_LOSS`.

The mock engine biases its random walk toward that scenario's signature
values over a couple of seconds, so gas panels, alerts, structural status,
and AI detections all shift together — wire a "Demo Mode" control in the
dashboard to call this endpoint directly so judges can trigger it live.

## 4. Connecting your existing frontend (Cursor)

You already have the frontend built with a `mockData.ts` / `api.ts`
service boundary (per the original master prompt). To wire it to this
backend:

1. Copy `frontend-integration/api.ts` into your project as
   `src/services/api.ts` (it re-implements the same function names your
   mock service already exposes — `getTelemetry`, `getRoverStatus`,
   `sendRoverCommand`, `getAlerts`, `getAIDetections`, `getMapData`, plus
   new `getSystemStatus` / `setDemoScenario`).
2. Copy `frontend-integration/useTelemetry.ts` into
   `src/hooks/useTelemetry.ts`.
3. Copy `frontend-integration/.env.example` to `.env` in your frontend
   root and adjust `VITE_API_BASE_URL` if needed.
4. In your dashboard's top-level component, replace the mock-data
   generator/state with `const { telemetry, alerts, mapData, systemStatus } = useTelemetry();`
   and pass those down to the panels — the shapes match what your mock
   engine was already producing.
5. Make sure `flask-cors` origins in `config.py` include your dev server
   URL (defaults already cover Vite's `localhost:5173`).

### Prompt you can paste into Cursor to do steps 1–4 automatically

```
I have an existing React/TypeScript dashboard (built from a Lovable/Bolt
master prompt) currently running on mock data via src/services/mockData.ts.
I've added a real Flask backend with a matching API — see
frontend-integration/api.ts and frontend-integration/useTelemetry.ts in
this repo for the exact function signatures and types.

Please:
1. Replace src/services/api.ts with the provided api.ts (adjust import
   paths/types to match my existing types/telemetry.ts if they differ).
2. Add src/hooks/useTelemetry.ts from the provided file.
3. Find wherever the dashboard currently pulls from mockData.ts (likely
   the top-level Dashboard/CommandCenter component) and swap it for the
   useTelemetry() hook, keeping all existing component props/shapes
   intact so no visual changes are needed.
4. Wire the "Demo Mode" panel's scenario buttons to call setDemoScenario()
   from api.ts instead of any local mock scenario logic.
5. Add a .env with VITE_API_BASE_URL=http://localhost:5000 if one doesn't
   exist.
Do not change any visual/animation code — only the data layer.
```

## 5. Phase roadmap (matches the plan we froze earlier)

- **Phase 1 (done here):** Flask skeleton + mock telemetry + all API
  contracts, dashboard fully functional on simulated data.
- **Phase 2:** Point real ESP32 `POST /api/telemetry` at this server —
  `state.system_state["using_real_hardware"]` flips automatically and the
  mock engine steps aside.
- **Phase 3:** Forward `/api/rover/command` to the ESP32 (TODO already
  marked in `routes/rover.py`).
- **Phase 4–5:** Wire ESP32-CAM stream + YOLO11s into `routes/ai.py` in
  place of the mock detections.
- **Phase 6–7:** Thresholds already centralized in `config.py` /
  `services/alert_engine.py` — recalibrate `GAS_THRESHOLDS` once you have
  real MQ-2/MQ-7/MQ-9 ppm curves.
- **Phase 8–9:** Real HC-SR04 scans replace the simulated points in
  `routes/mapping.py` / `services/mock_engine.py`.
- **Phase 11:** Communication panel already reads `communication.mode` —
  add an `esp_now` mode when the relay mesh is real.

## 6. Notes

- State is in-memory (`state.py`) — fine for a prototype/demo. If you add
  SQLite for post-mission logging/export, write to it inside
  `state.update_telemetry()` and `push_alert()`.
- Dev server only (`app.run(debug=...)`) — don't deploy this as-is; use
  gunicorn behind a reverse proxy for anything beyond the demo.
