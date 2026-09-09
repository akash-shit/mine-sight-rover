import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, OctagonX } from "lucide-react";

import { Panel } from "@/components/common/Panel";
import { useTelemetry } from "@/hooks/useTelemetry";
import { clockTime } from "@/utils/format";
import type { RoverCommand } from "@/types/telemetry";
import { cn } from "@/lib/utils";

const KEYS: Record<string, RoverCommand["command"]> = {
  w: "FORWARD",
  a: "LEFT",
  s: "BACKWARD",
  d: "RIGHT",
  " ": "STOP",
};

export function RoverControl({ className }: { className?: string }) {
  const { sendCommand, commands, frame } = useTelemetry();
  const [active, setActive] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);

  const fire = useCallback(
    (cmd: RoverCommand["command"]) => {
      sendCommand(cmd);
      setActive(cmd);
      setTimeout(() => setActive(null), 220);
      if (cmd === "STOP") {
        setFlash(true);
        setTimeout(() => setFlash(false), 700);
      }
    },
    [sendCommand],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      const cmd = KEYS[e.key.toLowerCase()];
      if (!cmd) return;
      e.preventDefault();
      fire(cmd);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fire]);

  const last = commands[0];
  const linkDown = frame?.link.online === false;

  const btn = (cmd: RoverCommand["command"], Icon: typeof ArrowUp, key: string, area: string) => (
    <motion.button
      type="button"
      key={cmd}
      style={{ gridArea: area }}
      onClick={() => fire(cmd)}
      whileTap={{ scale: 0.94 }}
      aria-label={`${cmd} (key ${key.toUpperCase()})`}
      className={cn(
        "panel-raised relative flex h-full min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-sm transition-colors",
        "hover:border-signal/60 hover:bg-signal/10",
        active === cmd && "border-signal bg-signal/20 glow-signal",
      )}
    >
      <Icon className="h-4 w-4 text-signal" aria-hidden />
      <span className="label-chip text-muted-foreground">{key.toUpperCase()}</span>
    </motion.button>
  );

  return (
    <Panel
      index="05"
      title="Rover Control"
      subtitle="manual override"
      className={className}
      actions={
        <span className="label-chip border border-hairline px-1.5 py-1 text-muted-foreground">WASD · SPACE = STOP</span>
      }
    >
      <div className="relative flex h-full flex-col gap-3">
        <AnimatePresence>
          {flash ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 z-10 border border-danger bg-danger/15"
              aria-hidden
            />
          ) : null}
        </AnimatePresence>

        <div
          className="grid gap-2"
          style={{
            gridTemplateAreas: `". up ." "left stop right" ". down ."`,
            gridTemplateColumns: "1fr 1fr 1fr",
          }}
        >
          {btn("FORWARD", ArrowUp, "w", "up")}
          {btn("LEFT", ArrowLeft, "a", "left")}
          <motion.button
            type="button"
            style={{ gridArea: "stop" }}
            onClick={() => fire("STOP")}
            whileTap={{ scale: 0.94 }}
            aria-label="Emergency stop (Spacebar)"
            className={cn(
              "relative flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-sm border border-danger/70 bg-danger/15 transition-colors hover:bg-danger/25",
              active === "STOP" && "glow-danger",
            )}
          >
            <OctagonX className="h-5 w-5 text-danger" aria-hidden />
            <span className="label-chip text-danger">STOP</span>
          </motion.button>
          {btn("RIGHT", ArrowRight, "d", "right")}
          {btn("BACKWARD", ArrowDown, "s", "down")}
        </div>

        <div className="flex items-center justify-between">
          <span className="label-chip text-muted-foreground">LAST COMMAND</span>
          <span className="readout text-xs text-foreground">
            {last ? `${last.command} · ${clockTime(last.timestamp)}` : "— AWAITING INPUT"}
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto border border-hairline bg-background/60 p-2">
          <div className="label-chip mb-1 text-muted-foreground">COMMAND FEED</div>
          {commands.length === 0 ? (
            <p className="readout text-[11px] text-muted-foreground">No commands issued this session.</p>
          ) : (
            <ul className="space-y-1">
              {commands.slice(0, 8).map((c) => (
                <motion.li
                  key={c.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="readout flex items-center justify-between text-[11px]"
                >
                  <span className="text-muted-foreground">{clockTime(c.timestamp)}</span>
                  <span className="text-foreground">{c.command}</span>
                  <span className={c.ack ? "text-nominal" : "text-danger"}>{c.ack ? "ACK" : "NO ACK"}</span>
                </motion.li>
              ))}
            </ul>
          )}
        </div>

        {linkDown ? (
          <p className="label-chip border border-danger/50 bg-danger/10 px-2 py-1 text-danger">
            LINK DEGRADED — COMMANDS MAY NOT ACKNOWLEDGE
          </p>
        ) : null}
      </div>
    </Panel>
  );
}
