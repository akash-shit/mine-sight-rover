import { motion } from "motion/react";

import { Panel } from "@/components/common/Panel";
import { Metric } from "@/components/common/Readout";
import { StatusPill } from "@/components/common/StatusPill";
import { useTelemetry } from "@/hooks/useTelemetry";

export function StructuralPanel({ className }: { className?: string }) {
  const { frame } = useTelemetry();
  if (!frame) return null;
  const st = frame.structural;
  const stroke =
    st.status === "critical" ? "var(--danger)" : st.status === "caution" ? "var(--caution)" : "var(--nominal)";

  const path = st.vibration
    .map((v, i) => `${i === 0 ? "M" : "L"}${((i / (st.vibration.length - 1)) * 100).toFixed(2)},${(50 - v * 44).toFixed(2)}`)
    .join(" ");

  const label = st.status === "critical" ? "UNSTABLE" : st.status === "caution" ? "CAUTION" : "STABLE";

  return (
    <Panel
      index="04"
      title="Structural Status"
      subtitle="MPU6050 · HC-SR04"
      className={className}
      tone={st.status === "critical" ? "danger" : "default"}
      actions={<StatusPill status={st.status} label={label} />}
    >
      <div className="flex h-full flex-col gap-3">
        <motion.div
          animate={st.status === "critical" ? { opacity: [1, 0.72, 1] } : { opacity: 1 }}
          transition={{ duration: 1.4, repeat: st.status === "critical" ? Infinity : 0 }}
          className="relative h-[86px] w-full border border-hairline bg-background grid-field-fine"
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full" role="img" aria-label="Vibration waveform">
            <line x1="0" y1="50" x2="100" y2="50" stroke="var(--hairline)" strokeWidth="0.5" />
            <path d={path} fill="none" stroke={stroke} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
          </svg>
          <span className="label-chip absolute left-2 top-2 text-muted-foreground">VIBRATION</span>
        </motion.div>
        <div className="grid grid-cols-3 gap-2">
          <Metric label="Roll" value={`${st.roll.toFixed(2)}°`} />
          <Metric label="Pitch" value={`${st.pitch.toFixed(2)}°`} />
          <Metric label="Clearance" value={`${st.clearance}`} unit="cm" />
        </div>
      </div>
    </Panel>
  );
}
