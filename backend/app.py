"""
AEGIS-SUBTERRA — Surface Control Station Backend

Run:
    pip install -r requirements.txt
    python app.py

Then point your frontend's VITE_API_BASE_URL (or equivalent) at
http://localhost:5000

Endpoints (see routes/ for details):
    GET  /api/telemetry
    POST /api/telemetry            (real ESP32 -> backend)
    GET  /api/telemetry/log
    GET  /api/rover/status
    POST /api/rover/command
    GET  /api/alerts
    GET  /api/ai/detections
    GET  /api/mapping
    POST /api/mapping/scan         (real ESP32 -> backend)
    GET  /api/system/status
    GET  /api/demo/scenario
    POST /api/demo/scenario        (judge-facing demo control)
"""

from flask import Flask, jsonify
from flask_cors import CORS

import config
from services import mock_engine
from routes import telemetry, rover, alerts, ai, mapping, system


def create_app():
    app = Flask(__name__)
    CORS(app, origins=config.CORS_ORIGINS, supports_credentials=True)

    app.register_blueprint(telemetry.bp)
    app.register_blueprint(rover.bp)
    app.register_blueprint(alerts.bp)
    app.register_blueprint(ai.bp)
    app.register_blueprint(mapping.bp)
    app.register_blueprint(system.bp)

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "aegis-subterra-backend"})

    return app


app = create_app()

if __name__ == "__main__":
    mock_engine.start()  # begin generating live mock telemetry immediately
    app.run(host=config.HOST, port=config.PORT, debug=config.DEBUG, use_reloader=False)
