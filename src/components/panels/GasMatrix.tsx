import { motion } from "motion/react";
import { CloudFog, Flame, Wind } from "lucide-react";

import { Panel } from "@/components/common/Panel";
import { CountUp } from "@/components/common/Readout";
import { Sparkline } from "@/components/common/Sparkline";
import { StatusPill } from "@/components/common/StatusPill";
import { useTelemetry } from "@/hooks/useTelemetry";
import type { GasReading } from "@/types/telemetry";
import { statusText } from "@/utils/format";
import { cn } from "@/lib/utils";

const icons = { mq7: Wind, mq2: CloudFog, mq9: Flame } as const;

function GasCard({ gas }: { gas: GasReading }) {
  const Icon = icons[gas.id];
  const critical = gas.status === "critical";
  return (
    <motion.article
      animate={critical ? { scale: [1, 1.015, 1] } : { scale: 1 }}
      transition={critical ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
      className={cn(
        "panel-raised flex flex-col gap-2 rounded-sm p-3",
        gas.status === "caution" && "border-caution/60",
        critical && "border-danger/70 glow-danger",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", statusText[gas.status])} aria-hidden />
          <div>
            <div className="label-chip text-foreground">{gas.sensor}</div>
            <div className="label-chip text-muted-foreground">{gas.label}</div>
          </div>
        </div>
        <StatusPill status={gas.status} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className={cn("readout text-2xl leading-none", statusText[gas.status])}>
          <CountUp value={gas.value} decimals={1} />
        </span>
        <span className="label-chip text-muted-foreground">{gas.unit}</span>
      </div>
      <Sparkline data={gas.history} status={gas.status} height={34} />
      <div className="label-chip flex justify-between text-muted-foreground">
        <span>WARN {gas.warn}</span>
        <span>CRIT {gas.critical}</span>
      </div>
    </motion.article>
  );
}

export function GasMatrix({ className }: { className?: string }) {
  const { frame, criticalCount } = useTelemetry();
  if (!frame) return null;
  return (
    <Panel
      index="02"
      title="Gas Matrix"
      subtitle="MQ-7 · MQ-2 · MQ-9"
      className={className}
      actions={
        <span className="label-chip border border-hairline px-1.5 py-1 text-muted-foreground">
          BREACHES {criticalCount}
        </span>
      }
    >
      <div className="grid gap-2 sm:grid-cols-3">
        {frame.gases.map((g) => (
          <GasCard key={g.id} gas={g} />
        ))}
      </div>
    </Panel>
  );
}
