import { useId } from "react";
import type { StatusLevel } from "@/types/telemetry";

const strokeFor: Record<StatusLevel, string> = {
  nominal: "var(--nominal)",
  caution: "var(--caution)",
  critical: "var(--danger)",
  offline: "var(--muted-foreground)",
};

export function Sparkline({
  data,
  status = "nominal",
  height = 36,
}: {
  data: number[];
  status?: StatusLevel;
  height?: number;
}) {
  const id = useId();
  const points = data.length > 1 ? data : [0, 0];
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const stroke = strokeFor[status];

  const path = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 100 - ((v - min) / span) * 92 - 4;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ height }}
      className="w-full"
      role="img"
      aria-label="Recent trend"
    >
      <defs>
        <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L100,100 L0,100 Z`} fill={`url(#fill-${id})`} />
      <path d={path} fill="none" stroke={stroke} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
