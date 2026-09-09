import { motion } from "motion/react";
import { Activity, Flame, Radio, ShieldAlert, User, Waves } from "lucide-react";
import { toast } from "sonner";

import { Panel } from "@/components/common/Panel";
import { useTelemetry } from "@/hooks/useTelemetry";
import { SCENARIOS } from "@/services/api";
import type { ScenarioId } from "@/types/telemetry";
import { cn } from "@/lib/utils";

const icons: Record<ScenarioId, typeof Activity> = {
  normal: Activity,
  "gas-leak": Waves,
  "trapped-worker": User,
  "fire-smoke": Flame,
  structural: ShieldAlert,
  "comms-loss": Radio,
};

export function DemoMode({ className }: { className?: string }) {
  const { scenario, setScenario } = useTelemetry();

  return (
    <Panel
      index="00"
      title="Demo Mode"
      subtitle="scenario injection"
      className={className}
      actions={<span className="label-chip border border-signal/50 bg-signal/10 px-1.5 py-1 text-signal">SIMULATION</span>}
    >
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {SCENARIOS.map((s) => {
          const Icon = icons[s.id];
          const active = scenario === s.id;
          return (
            <motion.button
              key={s.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              aria-pressed={active}
              onClick={() => {
                setScenario(s.id);
                toast(`Scenario: ${s.name}`, { description: s.blurb });
              }}
              className={cn(
                "panel-raised flex items-start gap-2 rounded-sm p-2.5 text-left transition-colors",
                active ? "border-signal bg-signal/15 glow-signal" : "hover:border-signal/50 hover:bg-signal/5",
              )}
            >
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", active ? "text-signal" : "text-muted-foreground")} aria-hidden />
              <span className="min-w-0">
                <span className={cn("label-chip block", active ? "text-signal" : "text-foreground")}>{s.name}</span>
                <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">{s.blurb}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
      <p className="label-chip mt-2 text-muted-foreground">
        Scenarios drive every panel at once — gas, vision, map, structure, link and alerts.
      </p>
    </Panel>
  );
}
