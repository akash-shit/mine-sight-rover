import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { CountUp } from "./Readout";
import { cn } from "@/lib/utils";

export function Gauge({
  label,
  value,
  min,
  max,
  unit,
  decimals = 1,
  trend = 0,
  tone = "data",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  decimals?: number;
  trend?: number;
  tone?: "data" | "signal" | "danger";
}) {
  const pct = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const r = 42;
  const c = 2 * Math.PI * r;
  const arc = c * 0.75;
  const stroke =
    tone === "danger" ? "var(--danger)" : tone === "signal" ? "var(--signal)" : "var(--data)";
  const TrendIcon = trend > 0.05 ? ArrowUpRight : trend < -0.05 ? ArrowDownRight : ArrowRight;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-[110px] w-[110px]">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-[135deg]">
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="var(--hairline)"
            strokeWidth="6"
            strokeDasharray={`${arc} ${c}`}
            strokeLinecap="butt"
          />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth="6"
            strokeDasharray={`${arc * pct} ${c}`}
            strokeLinecap="butt"
            style={{ transition: "stroke-dasharray 700ms cubic-bezier(0.2,0.7,0.3,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="readout text-2xl leading-none text-foreground">
            <CountUp value={value} decimals={decimals} />
          </span>
          <span className="label-chip mt-1 text-muted-foreground">{unit}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="label-chip text-muted-foreground">{label}</span>
        <TrendIcon
          className={cn(
            "h-3 w-3",
            trend > 0.05 ? "text-caution" : trend < -0.05 ? "text-data" : "text-muted-foreground",
          )}
          aria-hidden
        />
        <span className="readout text-[10px] text-muted-foreground">
          {trend > 0 ? "+" : ""}
          {trend.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
