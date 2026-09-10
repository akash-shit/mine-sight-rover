from flask import Blueprint, jsonify, request

import state

bp = Blueprint("rover", __name__)

VALID_COMMANDS = {"FORWARD", "BACKWARD", "LEFT", "RIGHT", "STOP"}


@bp.get("/api/rover/status")
def rover_status():
    t = state.telemetry
    return jsonify({
        "online": t["rover"]["online"],
        "battery": t["rover"]["battery"],
        "camera": t["camera"]["online"],
        "position": {"x": t["rover"]["x"], "y": t["rover"]["y"], "heading": t["rover"]["heading"]},
        "mode": state.rover_command_state["mode"],
        "last_command": state.rover_command_state["last_command"],
        "last_command_at": state.rover_command_state["last_command_at"],
        "last_seen": state.now_iso(),
    })


@bp.post("/api/rover/command")
def rover_command():
    """
    Browser -> Flask -> (later) ESP32.

    Body: { "command": "FORWARD" | "BACKWARD" | "LEFT" | "RIGHT" | "STOP" }

    Phase 1/2 (no ESP32 yet): just records the command so the dashboard's
    manual-override panel updates and shows an acknowledgement.

    Phase 3 (real rover): forward this to the ESP32 over HTTP/serial here
    — see the TODO below.
    """
    data = request.get_json(force=True, silent=True) or {}
    command = str(data.get("command", "")).upper()

    if command not in VALID_COMMANDS:
        return jsonify({"status": "error", "message": f"Invalid command: {command}"}), 400

    state.rover_command_state["last_command"] = command
    state.rover_command_state["last_command_at"] = state.now_iso()

    # TODO (Phase 3): forward to real ESP32, e.g.
    # requests.post(f"http://{ESP32_IP}/command", json={"command": command}, timeout=1)

    return jsonify({"status": "ok", "acknowledged": command})
