"""
Central threshold engine — converts raw telemetry into severity-classified
alerts. Nothing about gas/temp/structural thresholds should live in the
frontend; it all comes from here so the dashboard just renders what the
backend decides.
"""

import time
import config
import state


def _status_for(value, warning, critical):
    if value >= critical:
        return "CRITICAL"
    if value >= warning:
        return "WARNING"
    return "NORMAL"


def _make_alert(severity, category, message, value=None):
    return {
        "id": f"{int(time.time() * 1000)}-{category}",
        "timestamp": state.now_iso(),
        "severity": severity,   # INFO | WARNING | CRITICAL
        "category": category,   # GAS | ENVIRONMENT | STRUCTURAL | AI | COMMS | ROVER
        "message": message,
        "value": value,
    }


def evaluate(telemetry: dict):
    """Run all threshold checks against the latest telemetry snapshot.
    Pushes any new WARNING/CRITICAL alerts into state.alerts.
    Returns the (possibly updated) telemetry dict with per-sensor status set.
    """

    # --- Gas ---
    gas_map = {
        "mq7": ("mq7_co", "CO (MQ-7)"),
        "mq2": ("mq2_ch4", "Methane/Smoke (MQ-2)"),
        "mq9": ("mq9_combustible", "Combustible Gas (MQ-9)"),
    }
    for sensor_key, (threshold_key, label) in gas_map.items():
        reading = telemetry["gas"][sensor_key]
        th = config.GAS_THRESHOLDS[threshold_key]
        status = _status_for(reading["ppm"], th["warning"], th["critical"])
        reading["status"] = status
        if status in ("WARNING", "CRITICAL"):
            state.push_alert(_make_alert(
                status, "GAS",
                f"{label} at {reading['ppm']:.1f} ppm",
                reading["ppm"],
            ))

    # --- Environment ---
    temp = telemetry["environment"]["temperature"]
    if temp >= config.TEMP_CRITICAL_C:
        state.push_alert(_make_alert("CRITICAL", "ENVIRONMENT", f"Temperature critical at {temp:.1f}°C", temp))
    elif temp >= config.TEMP_WARNING_C:
        state.push_alert(_make_alert("WARNING", "ENVIRONMENT", f"Temperature elevated at {temp:.1f}°C", temp))

    # --- Structural ---
    vib = telemetry["imu"]["vibration"]
    tilt = max(abs(telemetry["imu"]["roll"]), abs(telemetry["imu"]["pitch"]))
    if vib >= config.VIBRATION_CRITICAL or tilt >= config.TILT_CRITICAL_DEG:
        state.push_alert(_make_alert("CRITICAL", "STRUCTURAL", "Structural instability detected", vib))
    elif vib >= config.VIBRATION_WARNING or tilt >= config.TILT_WARNING_DEG:
        state.push_alert(_make_alert("WARNING", "STRUCTURAL", "Elevated vibration/tilt", vib))

    # --- AI / person detection (informational, not a hazard) ---
    if telemetry["ai"]["person_detected"]:
        state.push_alert(_make_alert(
            "INFO", "AI",
            f"Person detected ({telemetry['ai']['person_count']})",
        ))

    # --- Communication ---
    if telemetry["communication"]["packet_pct"] < 60:
        state.push_alert(_make_alert("CRITICAL", "COMMS", "Communication link degraded"))

    return telemetry
