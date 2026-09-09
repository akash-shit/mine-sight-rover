import { Panel } from "@/components/common/Panel";
import { Gauge } from "@/components/common/Gauge";
import { useTelemetry } from "@/hooks/useTelemetry";

export function ClimatePanel({ className }: { className?: string }) {
  const { frame } = useTelemetry();
  if (!frame) return null;
  const c = frame.climate;
  return (
    <Panel index="03" title="Environment" subtitle="DHT22 climate" className={className}>
      <div className="flex items-center justify-around gap-2 py-1">
        <Gauge
          label="Temperature"
          value={c.temperature}
          min={0}
          max={80}
          unit="°C"
          trend={c.temperatureTrend}
          tone={c.temperature > 45 ? "danger" : "signal"}
        />
        <Gauge label="Humidity" value={c.humidity} min={0} max={100} unit="%RH" trend={c.humidityTrend} tone="data" />
      </div>
    </Panel>
  );
}
