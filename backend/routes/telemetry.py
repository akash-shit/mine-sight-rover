from flask import Blueprint, jsonify, request
import time

import state
from services import alert_engine

bp = Blueprint("telemetry", __name__)


@bp.get("/api/telemetry")
def get_telemetry():
    """Dashboard polls this every ~1s."""
    return jsonify(state.get_telemetry())


@bp.get("/api/telemetry/log")
def get_telemetry_log():
    limit = int(request.args.get("limit", 200))
    return jsonify(state.get_log(limit))


@bp.post("/api/telemetry")
def post_telemetry():
    """
    Real ESP32 posts sensor readings here (Phase 2+).

    Expected body (fields optional/partial updates allowed):
    {
      "gas": {"mq7": {"ppm": 42.7}, "mq2": {"ppm": 125}, "mq9": {"ppm": 18}},
      "environment": {"temperature": 29.4, "humidity": 67.2},
      "imu": {"roll": 2.4, "pitch": -1.2, "yaw": 73.5, "vibration": 0.08},
      "distance": {"front": 1.84},
      "rover": {"battery": 78}
    }
    """
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"status": "error", "message": "Invalid or missing JSON body"}), 400

    state.system_state["using_real_hardware"] = True
    state.system_state["last_esp32_seen"] = time.time()

    state.update_telemetry(data)
    alert_engine.evaluate(state.telemetry)

    return jsonify({"status": "ok"})
