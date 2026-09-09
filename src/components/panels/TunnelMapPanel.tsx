import { Panel } from "@/components/common/Panel";
import { TunnelMapCanvas } from "@/components/visuals/TunnelMapCanvas";
import { useTelemetry } from "@/hooks/useTelemetry";
import { cn } from "@/lib/utils";

export function TunnelMapPanel({ className, tall }: { className?: string; tall?: boolean }) {
  const { frame } = useTelemetry();
  if (!frame) return null;
  const m = frame.map;
  const nearest = m.rays.length ? Math.min(...m.rays.map((r) => r.distance)) : 0;
  const nearestRay = m.rays.find((r) => r.distance === nearest);

  return (
    <Panel
      index="06"
      title="Tunnel Map"
      subtitle="2D ultrasonic / pseudo-LiDAR"
      className={className}
      bodyClassName="p-2"
      actions={
        <span className="readout text-[10px] text-data">
          X {m.rover.x.toFixed(1)} · Y {m.rover.y.toFixed(1)} · HDG {m.heading.toFixed(0)}°
        </span>
      }
    >
      <div className={cn("relative w-full border border-hairline bg-background", tall ? "h-[520px]" : "h-[300px]")}>
        <TunnelMapCanvas map={m} />
        <div className="pointer-events-none absolute left-2 top-2 space-y-1">
          <span className="label-chip block border border-hairline bg-background/85 px-1.5 py-1 text-muted-foreground">
            HC-SR04 RANGE RETURNS · NOT SLAM
          </span>
        </div>
        <div className="pointer-events-none absolute bottom-2 left-2 flex flex-wrap gap-1.5">
          <span className="label-chip border border-signal/50 bg-background/85 px-1.5 py-1 text-signal">ROVER</span>
          <span className="label-chip border border-hairline bg-background/85 px-1.5 py-1 text-muted-foreground">OBSTACLE</span>
          <span className="label-chip border border-danger/50 bg-background/85 px-1.5 py-1 text-danger">HAZARD</span>
          <span className="label-chip border border-nominal/50 bg-background/85 px-1.5 py-1 text-nominal">WORKER</span>
        </div>
        <div className="pointer-events-none absolute bottom-2 right-2 readout border border-hairline bg-background/85 px-1.5 py-1 text-[10px] text-data">
          NEAREST RETURN {nearest ? `${nearest} CM @ ${nearestRay?.angle ?? 0}°` : "—"}
        </div>
        <div className="pointer-events-none absolute right-2 top-2 readout border border-hairline bg-background/85 px-1.5 py-1 text-[10px] text-muted-foreground">
          EXPLORED NODES {m.trail.length}
        </div>
      </div>
    </Panel>
  );
}
