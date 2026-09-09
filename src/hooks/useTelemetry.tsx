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

import { createTelemetrySource, SEED_ALERTS } from "@/services/api";
import type {
  AlertEvent,
  LogRow,
  RoverCommand,
  ScenarioId,
  TelemetryFrame,
} from "@/types/telemetry";
import { frameToLogRow } from "@/utils/format";

interface TelemetryContextValue {
  frame: TelemetryFrame | null;
  alerts: AlertEvent[];
  commands: RoverCommand[];
  log: LogRow[];
  scenario: ScenarioId;
  setScenario: (id: ScenarioId) => void;
  sessionActive: boolean;
  sessionStartedAt: number | null;
  sessionElapsed: number;
  startSession: () => void;
  stopSession: () => void;
  clearLog: () => void;
  sendCommand: (c: RoverCommand["command"]) => void;
  criticalCount: number;
  soundEnabled: boolean;
  toggleSound: () => void;
  acknowledgeAlerts: () => void;
  unreadAlerts: number;
}

const TelemetryContext = createContext<TelemetryContextValue | null>(null);

const MAX_LOG = 400;
const MAX_ALERTS = 120;

export function TelemetryProvider({ children }: { children: ReactNode }) {
  const sourceRef = useRef<ReturnType<typeof createTelemetrySource> | null>(null);
  if (sourceRef.current === null && typeof window !== "undefined") {
    sourceRef.current = createTelemetrySource();
  }

  const [frame, setFrame] = useState<TelemetryFrame | null>(null);
  const [alerts, setAlerts] = useState<AlertEvent[]>(SEED_ALERTS.slice().reverse());
  const [commands, setCommands] = useState<RoverCommand[]>([]);
  const [log, setLog] = useState<LogRow[]>([]);
  const [scenario, setScenarioState] = useState<ScenarioId>("normal");
  const [sessionActive, setSessionActive] = useState(true);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);

  const sessionActiveRef = useRef(sessionActive);
  sessionActiveRef.current = sessionActive;
  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;

  useEffect(() => {
    const src = sourceRef.current;
    if (!src) return;
    setSessionStartedAt((prev) => prev ?? Date.now());
    src.start();

    const offTel = src.subscribeTelemetry((f) => {
      setFrame(f);
      if (sessionActiveRef.current) {
        setLog((prev) => [frameToLogRow(f), ...prev].slice(0, MAX_LOG));
      }
    });

    const offAlerts = src.subscribeAlerts((a) => {
      setAlerts((prev) => [a, ...prev].slice(0, MAX_ALERTS));
      setUnreadAlerts((n) => n + 1);
      if (a.severity === "critical") setCriticalCount((n) => n + 1);
      if (soundRef.current && a.severity !== "info") beep(a.severity === "critical" ? 660 : 440);
    });

    const offCmd = src.subscribeCommands((c) => {
      setCommands((prev) => [c, ...prev].slice(0, 40));
    });

    return () => {
      offTel();
      offAlerts();
      offCmd();
      src.stop();
    };
  }, []);

  useEffect(() => {
    if (!sessionActive || !sessionStartedAt) return;
    const id = setInterval(() => setSessionElapsed(Date.now() - sessionStartedAt), 1000);
    setSessionElapsed(Date.now() - sessionStartedAt);
    return () => clearInterval(id);
  }, [sessionActive, sessionStartedAt]);

  const setScenario = useCallback((id: ScenarioId) => {
    setScenarioState(id);
    sourceRef.current?.setScenario(id);
  }, []);

  const startSession = useCallback(() => {
    setSessionActive(true);
    setSessionStartedAt(Date.now());
    sourceRef.current?.start();
  }, []);

  const stopSession = useCallback(() => {
    setSessionActive(false);
  }, []);

  const clearLog = useCallback(() => setLog([]), []);

  const sendCommand = useCallback((c: RoverCommand["command"]) => {
    void sourceRef.current?.sendCommand(c);
  }, []);

  const toggleSound = useCallback(() => setSoundEnabled((s) => !s), []);
  const acknowledgeAlerts = useCallback(() => setUnreadAlerts(0), []);

  const value = useMemo(
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
    }),
    [
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
    ],
  );

  return <TelemetryContext.Provider value={value}>{children}</TelemetryContext.Provider>;
}

export function useTelemetry() {
  const ctx = useContext(TelemetryContext);
  if (!ctx) throw new Error("useTelemetry must be used inside TelemetryProvider");
  return ctx;
}

/** Simulated alert tone (WebAudio) — opt-in via the sound toggle. */
function beep(freq: number) {
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    gain.gain.value = 0.03;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
    setTimeout(() => void ctx.close(), 400);
  } catch {
    /* audio unavailable — silent by design */
  }
}
