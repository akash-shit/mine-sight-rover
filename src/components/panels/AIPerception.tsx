import { motion } from "motion/react";

import { Panel } from "@/components/common/Panel";
import { Metric } from "@/components/common/Readout";
import { StatusPill } from "@/components/common/StatusPill";
import { useTelemetry } from "@/hooks/useTelemetry";

export function AIPerception({ className }: { className?: string }) {
  const { frame } = useTelemetry();
  if (!frame) return null;
  const v = frame.vision;

  return (
    <Panel
      index="08"
      title="AI Perception"
      subtitle={`${v.model} · OpenCV`}
      className={className}
      actions={<StatusPill status={v.online ? "nominal" : "offline"} label={v.online ? "INFERRING" : "IDLE"} />}
    >
      <div className="flex h-full flex-col gap-3">
        <div className="grid grid-cols-3 gap-2">
          <Metric label="Throughput" value={v.fps.toFixed(1)} unit="fps" />
          <Metric label="Inference" value={v.inferenceMs.toFixed(1)} unit="ms" />
          <Metric label="Detections" value={String(v.detections.length)} />
        </div>
        <div className="min-h-0 flex-1 space-y-2">
          <div className="label-chip text-muted-foreground">PER-OBJECT CONFIDENCE</div>
          {v.detections.length === 0 ? (
            <p className="text-xs text-muted-foreground">No objects in frame — tunnel section clear.</p>
          ) : (
            v.detections.map((d) => (
              <div key={d.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="label-chip text-foreground">{d.label}</span>
                  <span className="readout text-[11px] text-data">{(d.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted">
                  <motion.div
                    className="h-full bg-data"
                    animate={{ width: `${d.confidence * 100}%` }}
                    transition={{ duration: 0.6, ease: [0.2, 0.7, 0.3, 1] }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
        <p className="label-chip text-muted-foreground">
          MODEL YOLO11s · SURFACE SERVER INFERENCE · CLASSES: PERSON / FIRE / SMOKE / OBSTACLE
        </p>
      </div>
    </Panel>
  );
}
