"""
Single source of truth for live system state.

Everything (mock engine, real ESP32 ingestion, routes) reads/writes through
this module so there is exactly one place that owns "current telemetry".

Thread-safe via a simple RLock — fine for a Flask dev server / small
prototype. If you move to gunicorn with multiple workers later, replace
this with Redis.
"""

import threading
import time
from collections import deque

_lock = threading.RLock()

# ---- Live telemetry snapshot (matches the frontend's TelemetryData type) ----
telemetry = {
    "timestamp": None,
    "gas": {
        "mq7": {"raw": 0, "ppm": 42.7, "status": "NORMAL"},
        "mq2": {"raw": 0, "ppm": 125.0, "status": "WARNING"},
        "mq9": {"raw": 0, "ppm": 18.0, "status": "NORMAL"},
    },
    "environment": {"temperature": 28.4, "humidity": 67.0},
    "imu": {"roll": 2.4, "pitch": -1.2, "yaw": 73.0, "vibration": 0.08},
    "distance": {"front": 1.84, "left": 2.10, "right": 1.95},
    "rover": {"x": 12.4, "y": 8.7, "battery": 78, "online": True, "heading": 73},
    "camera": {"online": True, "fps": 24.5, "latency_ms": 83},
    "ai": {"person_detected": False, "person_count": 0, "detections": []},
    "communication": {"mode": "wifi", "rssi_dbm": -61, "latency_ms": 82, "packet_pct": 98.7},
}

# ---- Alerts (most recent first) ----
alerts = deque(maxlen=200)

# ---- Rolling telemetry log for CSV export / table ----
telemetry_log = deque(maxlen=1800)  # ~30 min at 1Hz

# ---- Tunnel map points ----
map_state = {
    "path": [{"x": 12.4, "y": 8.7}],
    "scan_points": [],   # [{angle, distance, x, y}]
    "obstacles": [],
    "hazards": [],
}

# ---- Rover control ----
rover_command_state = {
    "last_command": "STOP",
    "last_command_at": None,
    "mode": "MANUAL",
}

# ---- System / demo ----
system_state = {
    "demo_scenario": "NORMAL",
    "last_esp32_seen": None,   # set when a real POST /api/telemetry arrives
    "using_real_hardware": False,
}


def now_iso():
    return time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime())


def with_lock(fn):
    def wrapper(*args, **kwargs):
        with _lock:
            return fn(*args, **kwargs)
    return wrapper


@with_lock
def get_telemetry():
    return dict(telemetry)


@with_lock
def update_telemetry(patch: dict):
    """Shallow-merge a patch into telemetry (per top-level key)."""
    for key, value in patch.items():
        if isinstance(value, dict) and isinstance(telemetry.get(key), dict):
            telemetry[key].update(value)
        else:
            telemetry[key] = value
    telemetry["timestamp"] = now_iso()
    telemetry_log.append(dict(telemetry))


@with_lock
def push_alert(alert: dict):
    alerts.appendleft(alert)


@with_lock
def get_alerts(limit=50):
    return list(alerts)[:limit]


@with_lock
def get_log(limit=200):
    return list(telemetry_log)[-limit:]


@with_lock
def clear_log():
    telemetry_log.clear()
