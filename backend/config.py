"""
AEGIS-SUBTERRA — Surface Control Station Backend
Config: ports, CORS, gas thresholds, update intervals.

Edit these values as you calibrate real MQ-2/MQ-7/MQ-9 sensors.
"""

import os

# --- Server ---
HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", 5001))
DEBUG = os.environ.get("DEBUG", "true").lower() == "true"

# Set this to your Lovable/Bolt dev URL (and prod URL once deployed)
CORS_ORIGINS = os.environ.get(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173",
).split(",")

# --- Mock telemetry engine ---
TELEMETRY_TICK_SECONDS = 1.0

# --- Gas thresholds (ppm) — placeholder values, replace after real calibration ---
GAS_THRESHOLDS = {
    "mq7_co": {"warning": 50, "critical": 100},       # Carbon Monoxide
    "mq2_ch4": {"warning": 100, "critical": 200},      # Methane / Smoke
    "mq9_combustible": {"warning": 60, "critical": 120},  # Combustible gas
}

# --- Environment thresholds ---
TEMP_WARNING_C = 35.0
TEMP_CRITICAL_C = 45.0
HUMIDITY_WARNING_PCT = 85.0

# --- Structural thresholds ---
VIBRATION_WARNING = 0.35
VIBRATION_CRITICAL = 0.6
TILT_WARNING_DEG = 12.0
TILT_CRITICAL_DEG = 20.0

# --- Comms ---
LINK_TIMEOUT_SECONDS = 5  # if no real ESP32 POST within this window, rover marked OFFLINE
