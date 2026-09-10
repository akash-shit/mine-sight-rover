from flask import Blueprint, jsonify, request

import state

bp = Blueprint("alerts", __name__)


@bp.get("/api/alerts")
def get_alerts():
    limit = int(request.args.get("limit", 50))
    return jsonify(state.get_alerts(limit))
