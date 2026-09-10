import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  getAlerts,
  getMapData,
  getSystemStatus,
  getTelemetry,
  getTelemetryLog,
  normalizeAlerts,
  normalizeLogRows,
  normalizeTelemetryFrame,
  sendRoverCommand,
  setDemoScenario,
  type DemoScenario,
  type RoverCommand,
} from "@/services/api";
import type {
  AlertEvent,
  LogRow,
  RoverCommand as RoverCommandType,
  ScenarioId,
  TelemetryFrame,
} from "@/types/telemetry";

interface TelemetryContextValue {
  frame: TelemetryFrame | null;
  alerts: AlertEvent[];
  commands: RoverCommandType[];
  log: LogRow[];
  scenario: ScenarioId;
  setScenario: (id: ScenarioId) => void;
  sessionActive: boolean;
  sessionStartedAt: number | null;
  sessionElapsed: number;
  startSession: () => void;
  stopSession: () => void;
  clearLog: () => void;
  sendCommand: (c: RoverCommandType["command"]) => void;
  criticalCount: number;
  soundEnabled: boolean;
  toggleSound: () => void;
  acknowledgeAlerts: () => void;
  unreadAlerts: number;
  loading: boolean;
  error: string | null;
}

const TelemetryContext = createContext<TelemetryContextValue | null>(null);

const POLL_INTERVAL_MS = 1000;
const MAX_LOG = 400;
const MAX_ALERTS = 120;
const MAX_COMMANDS = 40;

const demoScenarioMap: Record<ScenarioId, DemoScenario> = {
  normal: "NORMAL",
  "gas-leak": "GAS_LEAK",
  "trapped-worker": "TRAPPED_WORKER",
  "fire-smoke": "FIRE_SMOKE",
  structural: "STRUCTURAL_INSTABILITY",
  "comms-loss": "COMMUNICATION_LOSS",
};

export function TelemetryProvider({ children }: { children: ReactNode }) {
  const [frame, setFrame] = useState<TelemetryFrame | null>(null);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [commands, setCommands] = useState<RoverCommandType[]>([]);
  const [log, setLog] = useState<LogRow[]>([]);
  const [scenario, setScenarioState] = useState<ScenarioId>("normal");
  const [sessionActive, setSessionActive] = useState(true);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const previousFrameRef = useRef<TelemetryFrame | null>(null);
  const previousAlertsRef = useRef<AlertEvent[]>([]);

  const refresh = useCallback(async () => {
    try {
      const [telemetry, alertsPayload, mapData, systemStatus, logRows] = await Promise.all([
        getTelemetry(),
        getAlerts(50),
        getMapData(),
        getSystemStatus(),
        getTelemetryLog(200),
      ]);

      const nextFrame = normalizeTelemetryFrame(telemetry, mapData, systemStatus, previousFrameRef.current);
      previousFrameRef.current = nextFrame;

      const nextAlerts = normalizeAlerts(alertsPayload).slice(0, MAX_ALERTS);
      const newAlertCount = nextAlerts.filter((alert) => !previousAlertsRef.current.some((prev) => prev.id === alert.id)).length;
      previousAlertsRef.current = nextAlerts;

      setFrame(nextFrame);
      setScenarioState(nextFrame.scenario);
      setAlerts(nextAlerts);
      setUnreadAlerts((current) => current + newAlertCount);

      const nextLog = normalizeLogRows(logRows).slice(0, MAX_LOG);
      setLog((current) => (sessionActive ? nextLog : current));
      setLoading(false);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setLoading(false);
    }
  }, [sessionActive]);

  useEffect(() => {
    if (!sessionStartedAt) setSessionStartedAt(Date.now());

    void refresh();
    const intervalId = window.setInterval(() => {
      void refresh();
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [refresh, sessionStartedAt]);

  useEffect(() => {
    if (!sessionActive || !sessionStartedAt) return;

    const updateTimer = () => setSessionElapsed(Date.now() - sessionStartedAt);
    updateTimer();
    const intervalId = window.setInterval(updateTimer, 1000);

    return () => window.clearInterval(intervalId);
  }, [sessionActive, sessionStartedAt]);

  const setScenario = useCallback(async (id: ScenarioId) => {
    const payload = demoScenarioMap[id];
    if (!payload) return;

    try {
      await setDemoScenario(payload);
      setScenarioState(id);
    } catch {
      // leave the existing state unchanged if the backend call fails
    }
  }, []);

  const startSession = useCallback(() => {
    setSessionActive(true);
    setSessionStartedAt(Date.now());
  }, []);

  const stopSession = useCallback(() => {
    setSessionActive(false);
  }, []);

  const clearLog = useCallback(() => setLog([]), []);

  const sendCommand = useCallback(async (command: RoverCommandType["command"]) => {
    try {
      await sendRoverCommand(command);
      const timestamp = Date.now();
      setCommands((current) => [{ id: `cmd-${timestamp}`, command, timestamp, ack: true }, ...current].slice(0, MAX_COMMANDS));
    } catch {
      // keep the UI responsive even if the command API is unavailable
    }
  }, []);

  const toggleSound = useCallback(() => setSoundEnabled((current) => !current), []);
  const acknowledgeAlerts = useCallback(() => setUnreadAlerts(0), []);

  const criticalCount = useMemo(() => frame?.gases.filter((gas) => gas.status === "critical").length ?? 0, [frame]);

  const value = useMemo<TelemetryContextValue>(
    () => ({
      frame,
      alerts,
      commands,
      log,
      scenario,
      setScenario,
      sessionActive,
      sessionStartedAt,
      sessionElapsed,
      startSession,
      stopSession,
      clearLog,
      sendCommand,
      criticalCount,
      soundEnabled,
      toggleSound,
      acknowledgeAlerts,
      unreadAlerts,
      loading,
      error,
    }),
    [alerts, clearLog, commands, criticalCount, error, frame, loading, log, scenario, sendCommand, sessionActive, sessionStartedAt, sessionElapsed, setScenario, soundEnabled, startSession, stopSession, toggleSound, acknowledgeAlerts, unreadAlerts],
  );

  return <TelemetryContext.Provider value={value}>{children}</TelemetryContext.Provider>;
}

export function useTelemetry() {
  const ctx = useContext(TelemetryContext);
  if (!ctx) {
    throw new Error("useTelemetry must be used inside TelemetryProvider");
  }

  return ctx;
}
