import { AlertTriangle, CheckCircle2, CircleSlash, ShieldAlert } from "lucide-react";
import type { StatusLevel } from "@/types/telemetry";
import { statusLabel, statusText } from "@/utils/format";
import { cn } from "@/lib/utils";

const icons = {
  nominal: CheckCircle2,
  caution: AlertTriangle,
  critical: ShieldAlert,
  offline: CircleSlash,
} as const;

/** Status is never conveyed by color alone — icon + text label always present. */
export function StatusPill({
  status,
  label,
  className,
}: {
  status: StatusLevel;
  label?: string;
  className?: string;
}) {
  const Icon = icons[status];
  return (
    <span
      className={cn(
        "label-chip inline-flex items-center gap-1 border px-1.5 py-1",
        status === "nominal" && "border-nominal/40 bg-nominal/10",
        status === "caution" && "border-caution/50 bg-caution/10",
        status === "critical" && "border-danger/60 bg-danger/10",
        status === "offline" && "border-border bg-muted/40",
        statusText[status],
        className,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {label ?? statusLabel[status]}
    </span>
  );
}
