import { Battery, Camera, Cpu, Radio, Truck, Waves } from "lucide-react";
import { motion } from "motion/react";

import { CountUp } from "@/components/common/Readout";
import { useTelemetry } from "@/hooks/useTelemetry";
import type { StatusLevel } from "@/types/telemetry";
import { statusDot, statusLabel, statusText } from "@/utils/format";
import { cn } from "@/lib/utils";

function Cell({
  icon: Icon,
  label,
  value,
  status,
  index,
}: {
  icon: typeof Truck;
  label: string;
  value: React.ReactNode;
  status: StatusLevel;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: [0.2, 0.7, 0.3, 1] }}
      className="panel flex items-center gap-3 rounded-sm px-3 py-2"
    >
      <Icon className={cn("h-4 w-4 shrink-0", statusText[status])} aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="label-chip truncate text-muted-foreground">{label}</div>
        <div className="readout truncate text-sm text-foreground">{value}</div>
      </div>
      <span className="flex items-center gap-1">
        <span className={cn("h-1.5 w-1.5 rounded-full animate-status-pulse", statusDot[status])} aria-hidden />
        <span className={cn("label-chip hidden xl:inline", statusText[status])}>{statusLabel[status]}</span>
      </span>
    </motion.div>
  );
}

export function SystemStrip() {
  const { frame } = useTelemetry();
  if (!frame) return null;
  const s = frame.system;
  const batteryStatus: StatusLevel = s.battery < 15 ? "critical" : s.battery < 35 ? "caution" : "nominal";

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
      <Cell icon={Truck} label="Rover Status" value={s.rover === "offline" ? "LINK LOST" : "EXPLORING"} status={s.rover} index={0} />
      <Cell icon={Camera} label="Camera Link" value={s.camera === "offline" ? "NO SIGNAL" : "STREAMING"} status={s.camera} index={1} />
      <Cell icon={Cpu} label="AI Engine" value={frame.vision.model} status={s.aiEngine} index={2} />
      <Cell
        icon={Waves}
        label="Sensor Bus"
        value={`${s.sensorsOnline}/${s.sensorsTotal} ONLINE`}
        status={s.sensorsOnline === s.sensorsTotal ? "nominal" : "caution"}
        index={3}
      />
      <Cell icon={Radio} label="Network Health" value={`${frame.link.latencyMs} MS`} status={s.network} index={4} />
      <Cell
        icon={Battery}
        label="Rover Battery"
        value={<><CountUp value={s.battery} /> %</>}
        status={batteryStatus}
        index={5}
      />
    </div>
  );
}
