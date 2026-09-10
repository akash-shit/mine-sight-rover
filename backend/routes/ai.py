from flask import Blueprint, jsonify

import state

bp = Blueprint("ai", __name__)


@bp.get("/api/ai/detections")
def get_detections():
    t = state.telemetry
    return jsonify({
        "model": "YOLO11s",
        "status": "ACTIVE" if t["camera"]["online"] else "OFFLINE",
        "fps": t["camera"]["fps"],
        "inference_ms": 31,
        "detections": t["ai"]["detections"],
        "person_detected": t["ai"]["person_detected"],
        "person_count": t["ai"]["person_count"],
    })
