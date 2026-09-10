from flask import Blueprint, jsonify, request
import math

import state

bp = Blueprint("mapping", __name__)


@bp.get("/api/mapping")
def get_map():
    return jsonify({
        "rover": {
            "x": state.telemetry["rover"]["x"],
            "y": state.telemetry["rover"]["y"],
            "heading": state.telemetry["rover"]["heading"],
        },
        "path": state.map_state["path"],
        "scan_points": state.map_state["scan_points"],
        "obstacles": state.map_state["obstacles"],
        "hazards": state.map_state["hazards"],
    })


@bp.post("/api/mapping/scan")
def post_scan():
    """
    Real ESP32 posts one servo+HC-SR04 reading at a time here (Phase 8+).
    Body: { "angle": 72, "distance": 1.84 }
    Backend converts polar -> cartesian relative to current rover position.
    """
    data = request.get_json(force=True, silent=True) or {}
    angle = data.get("angle")
    distance = data.get("distance")
    if angle is None or distance is None:
        return jsonify({"status": "error", "message": "angle and distance required"}), 400

    rover = state.telemetry["rover"]
    rad = math.radians(angle)
    x = round(rover["x"] + distance * math.cos(rad), 2)
    y = round(rover["y"] + distance * math.sin(rad), 2)

    point = {"angle": angle, "distance": distance, "x": x, "y": y}
    state.map_state["scan_points"].append(point)
    state.map_state["scan_points"] = state.map_state["scan_points"][-300:]

    return jsonify({"status": "ok", "point": point})
