import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Flame, Radio, User, Wind, Box } from "lucide-react";

import { Panel } from "@/components/common/Panel";
import { TunnelFeed } from "@/components/visuals/TunnelFeed";
import { useTelemetry } from "@/hooks/useTelemetry";
import type { Detection } from "@/types/telemetry";
import { cn } from "@/lib/utils";

type View = "normal" | "ai" | "thermal";

const detectionIcon = {
  Person: User,
  Fire: Flame,
  Smoke: Wind,
  Obstacle: Box,
} as const;

const detectionTone: Record<Detection["label"], string> = {
  Person: "text-data",
  Fire: "text-danger",
  Smoke: "text-caution",
  Obstacle: "text-signal",
};

const boxColor: Record<Detection["label"], string> = {
  Person: "var(--data)",
  Fire: "var(--danger)",
  Smoke: "var(--caution)",
  Obstacle: "var(--signal)",
};

function Corner({ style }: { style: React.CSSProperties }) {
  return <span className="absolute h-3 w-3 border-current" style={style} aria-hidden />;
}

export function VisionPanel({ className }: { className?: string }) {
  const { frame } = useTelemetry();
  const [view, setView] = useState<View>("ai");
  if (!frame) return null;
  const v = frame.vision;

  return (
    <Panel
      index="01"
      title="Live AI Vision"
      subtitle={`${v.cameraId} · ${v.model}`}
      className={className}
      bodyClassName="p-2"
      actions={
        <div className="flex items-center gap-1" role="group" aria-label="Camera view mode">
          {(["normal", "ai", "thermal"] as View[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              aria-pressed={view === mode}
              className={cn(
                "label-chip border px-2 py-1 transition-colors",
                view === mode
                  ? "border-signal/60 bg-signal/15 text-signal"
                  : "border-hairline text-muted-foreground hover:border-signal/40 hover:text-foreground",
              )}
            >
              {mode === "thermal" ? "Thermal (sim)" : mode}
            </button>
          ))}
        </div>
      }
    >
      <div className="relative aspect-video w-full overflow-hidden border border-hairline bg-background">
        <TunnelFeed scenario={frame.scenario} thermal={view === "thermal"} offline={!v.online} />

        {/* detection overlay */}
        <AnimatePresence>
          {view === "ai" && v.online
            ? v.detections.map((d) => {
                const Icon = detectionIcon[d.label];
                return (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      left: `${d.x * 100}%`,
                      top: `${d.y * 100}%`,
                      width: `${d.w * 100}%`,
                      height: `${d.h * 100}%`,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.2, 0.7, 0.3, 1] }}
                    className={cn("absolute", detectionTone[d.label])}
                    style={{ borderColor: boxColor[d.label] }}
                  >
                    <span
                      className="absolute inset-0 border"
                      style={{ borderColor: boxColor[d.label], opacity: 0.55 }}
                      aria-hidden
                    />
                    <Corner style={{ top: -1, left: -1, borderTopWidth: 2, borderLeftWidth: 2 }} />
                    <Corner style={{ top: -1, right: -1, borderTopWidth: 2, borderRightWidth: 2 }} />
                    <Corner style={{ bottom: -1, left: -1, borderBottomWidth: 2, borderLeftWidth: 2 }} />
                    <Corner style={{ bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2 }} />
                    <span
                      className="label-chip absolute -top-5 left-0 flex items-center gap-1 whitespace-nowrap border px-1.5 py-0.5"
                      style={{ borderColor: boxColor[d.label], color: boxColor[d.label], background: "var(--background)" }}
                    >
                      <Icon className="h-3 w-3" aria-hidden />
                      {d.label} {(d.confidence * 100).toFixed(0)}%
                    </span>
                  </motion.div>
                );
              })
            : null}
        </AnimatePresence>

        {/* HUD */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-2">
          <span className="label-chip flex items-center gap-1.5 border border-danger/50 bg-background/80 px-1.5 py-1 text-danger">
            <span className="h-1.5 w-1.5 rounded-full bg-danger animate-status-pulse" aria-hidden />
            {v.online ? "LIVE" : "NO SIGNAL"}
          </span>
          <span className="readout border border-hairline bg-background/80 px-1.5 py-1 text-[10px] text-data">
            {v.fps.toFixed(1)} FPS · {v.latencyMs} MS
          </span>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between p-2">
          <span className="label-chip border border-hairline bg-background/80 px-1.5 py-1 text-muted-foreground">
            {v.cameraId} · ESP32-CAM · {v.resolution}
          </span>
          {view === "thermal" ? (
            <span className="label-chip flex items-center gap-1 border border-caution/60 bg-background/85 px-1.5 py-1 text-caution">
              <Radio className="h-3 w-3" aria-hidden /> Simulated false-color — no thermal hardware
            </span>
          ) : (
            <span className="label-chip border border-hairline bg-background/80 px-1.5 py-1 text-muted-foreground">
              {v.detections.length} OBJECTS TRACKED
            </span>
          )}
        </div>
      </div>
    </Panel>
  );
}
