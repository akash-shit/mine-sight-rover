# Mine Sight

IMPORTANT BUILD INSTRUCTION:

Build ONLY the frontend application in this first phase.

Use:

React + TypeScript + Vite + Tailwind CSS + shadcn/ui + Lucide + Recharts + Framer Motion.

Do NOT create the Flask backend yet.

Do NOT attempt ESP32 communication yet.

Do NOT attempt real authentication.

Do NOT attempt real camera streaming.

Do NOT attempt real YOLO inference.

Use realistic MOCK DATA for all current functionality.

However, architect the frontend so that the mock data layer can later be replaced by my Flask REST/WebSocket APIs without changing the UI components.

The frontend must be fully functional as a standalone demo.

Priority order:

1. Visual quality

2. Dashboard UX

3. Component architecture

4. Mock telemetry engine

5. Demo Mode

6. Animations

7. Responsive behavior

8. API abstraction

Do not simplify the requested dashboard into a generic admin template.

Do not remove features from the specification to make implementation easier.

Do not replace the architecture with a simpler dashboard.

Before finishing, verify that:

- Landing page works

- Sign-in demo works

- Dashboard works

- Sidebar works

- Demo Mode works

- Mock telemetry updates every second

- Alerts react to scenarios

- Map animates

- AI detection visualization works

- Rover controls work visually

- CSV export works

- All navigation works

- No broken buttons

- No placeholder lorem ipsum

- No console errors

After implementation, provide a concise summary of the file structure and where the mock API layer is located.AEGIS-SUBTERRA — Master Build Prompt (Lovable / Bolt)

Copy everything below into Lovable or Bolt as your project prompt.

PROJECT IDENTITY

Build AEGIS-SUBTERRA — an AI-Powered Underground Mine Safety, Monitoring & Rescue System. This is a Smart India Hackathon 2026 prototype (Problem Statement 26039, Govt. of Jharkhand — Dept. of Higher & Technical Education) for a rover that explores hazardous underground coal mine tunnels so human rescuers don't have to.

Tagline: "SENSE THE HAZARD. MAP THE UNKNOWN. PROTECT THE RESCUER."

This must feel like a real mission-control product a mining company would actually deploy — not a hackathon toy, not a generic SaaS dashboard. Think: NASA mission control, autonomous robotics command centers, industrial SCADA, tactical emergency response consoles, aerospace software.

Never make it look like: a banking app, a crypto dashboard, a gaming HUD, a neon cyberpunk site, or a templated AI-startup landing page.

VISUAL DIRECTION (no literal color codes — interpret creatively)

Deep-space, near-black command-center backdrop

Layered dark panels that feel like physical instrument housing, not floating cards

One warm amber/signal-orange accent for rover activity and primary actions

One cool cyan/electric-blue accent for technical/data information

Red reserved strictly for danger states, green reserved strictly for healthy/nominal states

Crisp hairline borders, restrained glow, no heavy gradients, no glassmorphism overload

Angular, technical card geometry — not bubbly rounded SaaS cards

Monospace typography for every live number/telemetry value; a clean geometric sans for headings and UI chrome

Fine background grid, subtle scanlines, faint particle/dust drift for atmosphere — nothing distracting

Short-label vocabulary to use throughout the UI (two words each): LIVE TELEMETRY · AI VISION · GAS MATRIX · ROVER CONTROL · STRUCTURAL STATUS · TUNNEL MAP · HAZARD CENTER · MISSION LOG · SYSTEM HEALTH · LINK STATUS · AI PERCEPTION · SENSOR BUS · ROVER STATUS · CAMERA LINK · NETWORK HEALTH · THREAT LEVEL · MISSION TIMER · DATA EXPORT · DEMO MODE · SYSTEM READY

TECH STACK

React + TypeScript + Vite + Tailwind CSS + shadcn/ui (where useful) + Lucide icons + Recharts + Framer Motion + Canvas/SVG for the tunnel map.

Architecture must be mock-data-driven but backend-ready:

src/

  components/

  pages/

  layouts/

  hooks/

  services/

    api.ts

    mockData.ts

  types/

    telemetry.ts

  utils/

  animations/

No hardcoded sensor values inside components — everything flows through a centralized mock telemetry engine that updates every second, so swapping in a real Flask API later is a one-file change.

EXPERIENCE 1 — CINEMATIC LANDING PAGE

Crazy-cool, high-impact, first 5 seconds must land hard.

Boot intro (Framer Motion, fast, skippable):

Black screen

Logo mark fade-in

Thin scanning line sweep

"INITIALIZING SYSTEM..." typewriter text

Subsystem indicators activate one by one

Snap to "LINK ESTABLISHED"

Hero fades in

Hero section:

Title: AEGIS-SUBTERRA

Subtitle: AI-Powered Underground Mine Safety, Monitoring & Rescue System

Supporting line: real-time sensing, AI vision, structural monitoring, remote robotic intervention

Large abstract hero visual — dark tunnel depth, animated rover silhouette with pulsing orange lights, sweeping sensor scan lines, drifting dust particles, faint comms waves — built in SVG/CSS, not stock photography

Primary CTA: ENTER CONTROL STATION

Secondary CTA: EXPLORE SYSTEM

"How AEGIS Works" scroll section: Animated vertical flow diagram, nodes light up sequentially on scroll: Underground Mine → Mine Rover → Multi-Sensor Acquisition → Wireless Telemetry → Surface Server → AI + Mapping → Alert Engine → Control Station → Rescue Operator

Tech stack strip: Compact icon cards — not overwhelming — for the real hardware/software: ESP32, ESP32-CAM, MQ-2, MQ-7, MQ-9, DHT22, MPU6050, HC-SR04, Python, Flask, YOLO11s, OpenCV, SQLite.

Feature labels (short chips): Real-Time Sensing · AI Vision · Structural Monitoring · 2D Mapping · Remote Control · Hazard Alerting

Micro-interactions everywhere: hover glow, scroll-triggered reveals, count-up numbers, magnetic buttons — smooth, technically elegant, never bouncy or cartoonish.

EXPERIENCE 2 — DUMMY SIGN-IN (DEMO ONLY)

Premium command-center login screen. Dark tunnel backdrop, animated grid, faint rover silhouette, moving scan line.

Card fields:

OPERATOR ID (placeholder: RESCUE-OPS-01)

ACCESS CODE (masked)

ROLE selector (default: RESCUE COMMANDER)

Button: AUTHENTICATE & ENTER

Live status strip under the card: NETWORK ONLINE · SENSOR LINK READY · AI ENGINE READY

Footer: AUTHORIZED PERSONNEL ONLY — AEGIS-SUBTERRA CONTROL SYSTEM

No real auth — clicking Authenticate plays a short access-granted animation and drops straight into the dashboard boot sequence.

EXPERIENCE 3 — COMMAND CENTER DASHBOARD

Desktop-first, 1440×900 target, 12-column grid, minimal scrolling, responsive down to tablet (stacked panels) and mobile (video → alerts → telemetry → map → controls, in that order).

Boot sequence on entry (1–2 sec, skippable): Checklist ticking off: Sensor Bus, Camera Link, AI Engine, Telemetry, Mapping, Alert Engine → SYSTEM READY → dashboard reveals.

Header: Logo + "MINE RESCUE COMMAND" · session time, mission ID, rover ID (center) · live system status pulse (right) — dynamically flips to a danger state styling when a critical alert is active.

System overview strip (compact live cards, animated number transitions): Rover · Camera · AI Engine · Sensors (x/8 online) · Network · Battery %

01 / Live AI Vision (largest panel): Dummy mine-tunnel feed, animated YOLO-style bounding boxes with corner brackets + confidence %, labels for Person / Fire / Smoke / Obstacle, FPS + latency overlay, view toggles: Normal / AI / Thermal (thermal clearly labeled as a simulated false-color view, never claimed as real thermal hardware). Bottom overlay: live indicator, cam ID, resolution.

02 / Gas Threat Matrix: Three sensor cards — MQ-7 (CO), MQ-2 (Methane/Smoke), MQ-9 (Combustible Gas) — each with icon, live reading, unit, status (Normal/Warning/Critical), and a mini trend graph. Threshold breach triggers a pulsing border, slight scale-up, and increments a global alert counter — restrained, not flashy.

03 / Environment & Climate: Elegant circular gauges for Temperature and Humidity, each with a tiny trend arrow.

04 / Structural Integrity: Live vibration waveform (dummy accelerometer data), Roll, Pitch, Clearance readouts, overall status: Stable / Caution / Unstable (unstable = red pulse).

05 / Rover Manual Override: 3×3 directional control pad (Forward / Left / Stop / Right / Backward), STOP visually dominant, keyboard shortcuts (WASD + Spacebar for emergency stop), live command feed and last-command timestamp, subtle press feedback and an emergency-stop confirmation flash.

06 / 2D Ultrasonic Tunnel Map (flagship visual feature): Large Canvas/SVG tactical map on a dark grid — animated orange rover marker, explored path trail, tunnel boundaries, obstacle and hazard markers, worker detection pins, animated radar-sweep scan, live ultrasonic scan rays with angle/distance readout, coordinates + heading readout. Map expands and path draws as the rover "moves." Label it 2D Ultrasonic Mapping / Pseudo-LiDAR Tunnel Map — never "SLAM" or "Acoustic SLAM."

07 / Threat & Event Center: Scrolling alert feed — severity badge, icon, timestamp, description, per-sensor detail (e.g. MQ-7/CO threshold exceeded). Critical events trigger a subtle screen-edge pulse and a notification badge — never a full-screen flash. Optional simulated sound toggle.

08 / AI Perception: Model name (YOLO11s), status, FPS, live detection count, per-object confidence bars, inference time.

09 / Communication Link: Current Wi-Fi connection stats (RSSI, latency, packet %) with animated signal visualization, plus a clearly-labeled Future Communication Architecture mini topology diagram for the ESP-NOW mesh relay chain (Surface → Node 3 → Node 2 → Node 1 → Rover) — never implied as currently active.

10 / Next-Gen Capabilities: Forward-looking innovation cards, each with icon, one-line pitch, and a status badge (Planned / Phase 2 / Research): ESP-NOW Mesh, MLX90640 True Thermal, Autonomous Navigation, and optionally Multi-Rover Swarm.

11 / Live Telemetry Log: Scrollable monospace table appending a new row every second — Time, MQ-7, MQ-2, MQ-9, Temp, Humidity, Roll, Pitch, Distance, Status.

Session & data controls: Start Session · Stop Session · Export CSV · Clear Log, with a running session timer.

Sidebar: Collapsible, icon-led navigation — Command, Overview, Live Vision, Telemetry, Tunnel Map, Hazards, AI Analysis, Mission Log, System — with rover ID and status pinned at the bottom.

Security strip: Small visual-only panel showing Control Access: Authenticated, Session ID, Role, Connection: Encrypted (demo only — no real cryptographic claims).

THE DEMO-DAY SUPERPOWER — DEMO MODE

This is the single most important feature for judges. Add a Demo Mode control panel with one-click scenario triggers that instantly ripple through the entire dashboard (gas values, map, AI detections, alerts, system status, rover state, camera feed, structural readouts):

Normal Mine Exploration

Gas Leak

Trapped Worker

Fire / Smoke

Structural Instability

Communication Loss

Judges should be able to watch the whole system react live, on command.

MOTION & MICRO-INTERACTIONS

Framer Motion throughout: smooth page/panel transitions, animated number count-ups, hover glow, button-press feedback, radar sweep, live status pulses, moving map markers, animated detection boxes, sliding-in notifications, severity-based alert animation, chart motion, signal-strength animation, connection pulse, loading skeletons, command-acknowledgement flicker.

Keep it technically elegant — no bouncing, no cartoon easing, no infinite distracting loops. Performance-conscious: transform/opacity-based animation, Canvas for the map, memoized components, no heavy particle systems.

HONESTY GUARDRAILS (do not violate — matters for technical credibility with judges)

AI model is YOLO11s — never call it RT-DETR

Mapping is 2D Ultrasonic / Pseudo-LiDAR — never call it SLAM or Acoustic SLAM

Thermal view is a simulated false-color overlay — always labeled as simulation, never claimed as real thermal hardware

Current comms is Wi-Fi only — ESP-NOW mesh is future/planned, always labeled as such

Autonomous navigation is not implemented — label as planned/research only

Only reference the actual hardware set: ESP32, ESP32-CAM, MQ-2, MQ-7, MQ-9, DHT22, MPU6050, HC-SR04 — invent nothing

ACCESSIBILITY & POLISH

Readable contrast throughout, visible keyboard focus states, semantic buttons, ARIA labels where relevant. Never rely on color alone for status — pair every critical/warning/success state with an icon and a text label.

FINAL DIRECTION

Cinematic. Industrial. Futuristic. Technical. Minimal. Precise. High-contrast. Mission-critical. Premium. Professional.

Build this as one polished, cohesive product — not a set of disconnected screens — using dummy data everywhere for now, but structured so a real Flask + ESP32 backend can be plugged in later without rewriting the UI.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://mine-sight-rover.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/24c3954e-3e38-4d36-b9bc-d57d139ebd85).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
