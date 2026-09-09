import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, Bell, BellOff, Info, ShieldAlert } from "lucide-react";

import { Panel } from "@/components/common/Panel";
import { useTelemetry } from "@/hooks/useTelemetry";
import { clockTime } from "@/utils/format";
import { cn } from "@/lib/utils";

const severityIcon = { info: Info, warning: AlertTriangle, critical: ShieldAlert } as const;
const severityTone = {
  info: "text-data border-data/40 bg-data/10",
  warning: "text-caution border-caution/50 bg-caution/10",
  critical: "text-danger border-danger/60 bg-danger/10",
} as const;

export function ThreatCenter({ className, limit = 40 }: { className?: string; limit?: number }) {
  const { alerts, soundEnabled, toggleSound, unreadAlerts, acknowledgeAlerts } = useTelemetry();

  return (
    <Panel
      index="07"
      title="Hazard Center"
      subtitle="threat & event feed"
      className={className}
      bodyClassName="p-0"
      actions={
        <>
          {unreadAlerts > 0 ? (
            <button
              type="button"
              onClick={acknowledgeAlerts}
              className="label-chip border border-danger/60 bg-danger/15 px-1.5 py-1 text-danger"
            >
              {unreadAlerts} NEW — ACK
            </button>
          ) : null}
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundEnabled}
            aria-label="Toggle simulated alert tone"
            className={cn(
              "label-chip flex items-center gap-1 border px-1.5 py-1",
              soundEnabled ? "border-signal/60 text-signal" : "border-hairline text-muted-foreground",
            )}
          >
            {soundEnabled ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
            TONE {soundEnabled ? "ON" : "OFF"}
          </button>
        </>
      }
    >
      <ul className="max-h-[320px] min-h-[180px] divide-y divide-hairline/60 overflow-y-auto">
        <AnimatePresence initial={false}>
          {alerts.slice(0, limit).map((a) => {
            const Icon = severityIcon[a.severity];
            return (
              <motion.li
                key={a.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.2, 0.7, 0.3, 1] }}
                className="flex gap-2 px-3 py-2"
              >
                <span className={cn("label-chip flex h-fit items-center gap-1 border px-1.5 py-1", severityTone[a.severity])}>
                  <Icon className="h-3 w-3" aria-hidden />
                  {a.severity.toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="label-chip truncate text-foreground">{a.title}</p>
                    <span className="readout shrink-0 text-[10px] text-muted-foreground">{clockTime(a.timestamp)}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.detail}</p>
                  <p className="label-chip mt-1 text-signal/70">{a.source}</p>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </Panel>
  );
}
