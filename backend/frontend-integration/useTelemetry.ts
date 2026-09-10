/**
 * AEGIS-SUBTERRA — live telemetry polling hook
 *
 * Drop this in as src/hooks/useTelemetry.ts.
 * Swap useState<mockData> for this hook in your dashboard's top-level
 * component (or wherever mock data is currently generated) and every
 * panel fed from it will start showing real backend data automatically.
 *
 * Usage:
 *   const { telemetry, alerts, mapData, systemStatus, loading, error } = useTelemetry();
 */

import { useEffect, useRef, useState } from "react";
import {
  getTelemetry,
  getAlerts,
  getMapData,
  getSystemStatus,
  TelemetryData,
  Alert,
  MapData,
  SystemStatus,
} from "../services/api";

const POLL_INTERVAL_MS = 1000;

export function useTelemetry() {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const [t, a, m, s] = await Promise.all([
          getTelemetry(),
          getAlerts(50),
          getMapData(),
          getSystemStatus(),
        ]);
        if (cancelled) return;
        setTelemetry(t);
        setAlerts(a);
        setMapData(m);
        setSystemStatus(s);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    poll(); // immediate first fetch
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { telemetry, alerts, mapData, systemStatus, loading, error };
}
