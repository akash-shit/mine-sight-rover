import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Smoothly counts to the incoming value — used for every live number. */
export function CountUp({
  value,
  decimals = 0,
  className,
  duration = 600,
}: {
  value: number;
  decimals?: number;
  className?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (value - from) * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      fromRef.current = value;
    };
  }, [value, duration]);

  return <span className={cn("readout", className)}>{display.toFixed(decimals)}</span>;
}

export function Metric({
  label,
  value,
  unit,
  className,
  valueClassName,
}: {
  label: string;
  value: string;
  unit?: string;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="label-chip text-muted-foreground">{label}</span>
      <span className={cn("readout text-lg leading-none text-foreground", valueClassName)}>
        {value}
        {unit ? <span className="ml-1 text-[0.6em] text-muted-foreground">{unit}</span> : null}
      </span>
    </div>
  );
}
