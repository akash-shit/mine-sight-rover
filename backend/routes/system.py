from flask import Blueprint, jsonify, request
import time

import state
import config
from services import mock_engine

bp = Blueprint("system", __name__)


@bp.get("/api/system/status")
def system_status():
    t = state.telemetry
    hardware_live = False
    if state.system_state["last_esp32_seen"]:
        hardware_live = (time.time() - state.system_state["last_esp32_seen"]) < config.LINK_TIMEOUT_SECONDS

    return jsonify({
        "rover_online": t["rover"]["online"],
        "camera_streaming": t["camera"]["online"],
        "ai_engine": "ACTIVE",
        "sensors_online": 8,
        "sensors_total": 8,
        "network": "STABLE" if t["communication"]["packet_pct"] > 80 else "DEGRADED",
        "battery": t["rover"]["battery"],
        "using_real_hardware": hardware_live,
        "demo_scenario": state.system_state["demo_scenario"],
    })


@bp.get("/api/demo/scenario")
def get_scenario():
    return jsonify({"scenario": state.system_state["demo_scenario"],
                     "options": list(mock_engine.SCENARIOS.keys())})


@bp.post("/api/demo/scenario")
def set_scenario():
    """
    Judge-facing demo control.
    Body: { "scenario": "GAS_LEAK" }
    One of: NORMAL, GAS_LEAK, TRAPPED_WORKER, FIRE_SMOKE,
            STRUCTURAL_INSTABILITY, COMMUNICATION_LOSS
    """
    data = request.get_json(force=True, silent=True) or {}
    scenario = data.get("scenario", "NORMAL")
    try:
        mock_engine.set_scenario(scenario)
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    return jsonify({"status": "ok", "scenario": state.system_state["demo_scenario"]})
