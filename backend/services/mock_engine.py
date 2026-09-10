"""
Mock telemetry engine.

Runs in a background thread and updates state.telemetry once per second
with realistic random-walk values, so the dashboard has something live to
render before real ESP32 hardware is connected.

Also implements DEMO MODE: judges can flip a scenario (via
POST /api/demo/scenario) and this engine will bias its random walk toward
that scenario's signature values, so the whole dashboard reacts visibly.

IMPORTANT: once real ESP32 telemetry starts arriving at
POST /api/telemetry, this engine should be paused (see system_state
["using_real_hardware"]) so it doesn't fight with real data. That switch
is already wired below.
"""

import math
import random
import threading
import time

import config
import state
from services import alert_engine

_running = False


def _clamp(v, lo, hi):
    return max(lo, min(hi, v))


def _walk(value, step, lo, hi):
    value += random.uniform(-step, step)
    return round(_clamp(value, lo, hi), 2)


SCENARIOS = {
    "NORMAL": {},
    "GAS_LEAK": {"mq2_bias": 180, "mq7_bias": 70},
    "TRAPPED_WORKER": {"person": True},
    "FIRE_SMOKE": {"mq2_bias": 220, "temp_bias": 48, "person": False, "fire": True},
    "STRUCTURAL_INSTABILITY": {"vibration_bias": 0.55, "tilt_bias": 18},
    "COMMUNICATION_LOSS": {"packet_bias": 35, "rssi_bias": -95},
}


def _tick():
    t = state.telemetry
    scenario = SCENARIOS.get(state.system_state["demo_scenario"], {})

    # Gas
    mq7_target = scenario.get("mq7_bias", 42)
    mq2_target = scenario.get("mq2_bias", 125)
    mq9_target = scenario.get("mq9_bias", 18)
    t["gas"]["mq7"]["ppm"] = _walk(t["gas"]["mq7"]["ppm"], 3, 0, mq7_target + 15)
    t["gas"]["mq2"]["ppm"] = _walk(t["gas"]["mq2"]["ppm"], 6, 0, mq2_target + 25)
    t["gas"]["mq9"]["ppm"] = _walk(t["gas"]["mq9"]["ppm"], 2, 0, mq9_target + 10)

    # Drift each toward its scenario target a little each tick
    for key, target in (("mq7", mq7_target), ("mq2", mq2_target), ("mq9", mq9_target)):
        current = t["gas"][key]["ppm"]
        t["gas"][key]["ppm"] = round(current + (target - current) * 0.05, 2)

    # Environment
    temp_target = scenario.get("temp_bias", 28.4)
    t["environment"]["temperature"] = round(
        t["environment"]["temperature"] + (temp_target - t["environment"]["temperature"]) * 0.05
        + random.uniform(-0.15, 0.15), 2
    )
    t["environment"]["humidity"] = _walk(t["environment"]["humidity"], 0.8, 30, 95)

    # IMU / structural
    vib_target = scenario.get("vibration_bias", 0.08)
    tilt_target = scenario.get("tilt_bias", 2.0)
    t["imu"]["vibration"] = round(
        t["imu"]["vibration"] + (vib_target - t["imu"]["vibration"]) * 0.1
        + random.uniform(-0.02, 0.02), 3
    )
    t["imu"]["roll"] = round(_clamp(t["imu"]["roll"] + (tilt_target - t["imu"]["roll"]) * 0.1
                                     + random.uniform(-0.3, 0.3), -30, 30), 2)
    t["imu"]["pitch"] = round(_clamp(t["imu"]["pitch"] + random.uniform(-0.3, 0.3), -30, 30), 2)
    t["imu"]["yaw"] = round((t["imu"]["yaw"] + random.uniform(-2, 2)) % 360, 1)

    # Distance / rover movement
    heading_rad = math.radians(t["imu"]["yaw"])
    t["rover"]["x"] = round(t["rover"]["x"] + math.cos(heading_rad) * 0.05, 2)
    t["rover"]["y"] = round(t["rover"]["y"] + math.sin(heading_rad) * 0.05, 2)
    t["rover"]["heading"] = round(t["imu"]["yaw"])
    t["rover"]["battery"] = round(_clamp(t["rover"]["battery"] - random.uniform(0, 0.02), 0, 100), 1)
    t["distance"]["front"] = _walk(t["distance"]["front"], 0.1, 0.3, 3.0)

    # Camera / AI
    t["camera"]["fps"] = round(_clamp(t["camera"]["fps"] + random.uniform(-0.5, 0.5), 18, 30), 1)
    t["camera"]["latency_ms"] = round(_clamp(t["camera"]["latency_ms"] + random.uniform(-3, 3), 40, 150))

    if scenario.get("person"):
        t["ai"]["person_detected"] = True
        t["ai"]["person_count"] = 1
        t["ai"]["detections"] = [{"class": "person", "confidence": round(random.uniform(0.85, 0.97), 2)}]
    elif scenario.get("fire"):
        t["ai"]["person_detected"] = False
        t["ai"]["person_count"] = 0
        t["ai"]["detections"] = [{"class": "fire", "confidence": round(random.uniform(0.75, 0.92), 2)}]
    else:
        t["ai"]["person_detected"] = False
        t["ai"]["person_count"] = 0
        t["ai"]["detections"] = []

    # Communication
    packet_target = scenario.get("packet_bias", 98.7)
    rssi_target = scenario.get("rssi_bias", -61)
    t["communication"]["packet_pct"] = round(
        t["communication"]["packet_pct"] + (packet_target - t["communication"]["packet_pct"]) * 0.1, 1
    )
    t["communication"]["rssi_dbm"] = round(
        t["communication"]["rssi_dbm"] + (rssi_target - t["communication"]["rssi_dbm"]) * 0.1
    )
    t["communication"]["latency_ms"] = round(_clamp(
        t["communication"]["latency_ms"] + random.uniform(-4, 4), 20, 300
    ))

    # Occasionally add a mapping scan point (simulated ultrasonic sweep)
    angle = random.uniform(0, 180)
    distance = round(random.uniform(0.5, 3.0), 2)
    rad = math.radians(angle)
    scan_x = round(t["rover"]["x"] + distance * math.cos(rad), 2)
    scan_y = round(t["rover"]["y"] + distance * math.sin(rad), 2)
    state.map_state["scan_points"].append(
        {"angle": round(angle), "distance": distance, "x": scan_x, "y": scan_y}
    )
    state.map_state["scan_points"] = state.map_state["scan_points"][-120:]
    state.map_state["path"].append({"x": t["rover"]["x"], "y": t["rover"]["y"]})
    state.map_state["path"] = state.map_state["path"][-300:]

    state.update_telemetry(t)
    alert_engine.evaluate(state.telemetry)


def _loop():
    global _running
    while _running:
        # If real ESP32 hardware has taken over, skip mock ticks.
        if not state.system_state["using_real_hardware"]:
            _tick()
        time.sleep(config.TELEMETRY_TICK_SECONDS)


def start():
    global _running
    if _running:
        return
    _running = True
    thread = threading.Thread(target=_loop, daemon=True)
    thread.start()


def stop():
    global _running
    _running = False


def set_scenario(name: str):
    name = name.upper()
    if name not in SCENARIOS:
        raise ValueError(f"Unknown scenario: {name}")
    state.system_state["demo_scenario"] = name
