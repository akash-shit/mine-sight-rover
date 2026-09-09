import { motion } from "motion/react";
import { Wifi } from "lucide-react";

import { Panel } from "@/components/common/Panel";
import { Metric } from "@/components/common/Readout";
import { StatusPill } from "@/components/common/StatusPill";
import { useTelemetry } from "@/hooks/useTelemetry";
import { cn } from "@/lib/utils";

const MESH = ["Surface", "Node 3", "Node 2", "Node 1", "Rover"];

export function LinkPanel({ className }: { className?: string }) {
  const { frame } = useTelemetry();
  if (!frame) return null;
  const l = frame.link;
  const bars = l.online ? (l.rssi > -55 ? 4 : l.rssi > -65 ? 3 : 2) : 1;

  return (
    <Panel
      index="09"
      title="Link Status"
      subtitle="Wi-Fi telemetry uplink"
      className={className}
      actions={<StatusPill status={l.online ? "nominal" : "critical"} label={l.online ? "LINKED" : "DEGRADED"} />}
    >
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-center gap-3">
          <Wifi className={cn("h-5 w-5", l.online ? "text-nominal" : "text-danger")} aria-hidden />
          <div className="flex items-end gap-1" aria-hidden>
            {[1, 2, 3, 4].map((b) => (
              <motion.span
                key={b}
                animate={{ opacity: b <= bars ? [0.55, 1, 0.55] : 0.18 }}
                transition={{ duration: 1.6, repeat: Infinity, delay: b * 0.12 }}
                className={cn("w-1.5", l.online ? "bg-nominal" : "bg-danger")}
                style={{ height: 6 + b * 5 }}
              />
            ))}
          </div>
          <span className="label-chip text-muted-foreground">{l.ssid}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Metric label="RSSI" value={String(l.rssi)} unit="dBm" />
          <Metric label="Latency" value={String(l.latencyMs)} unit="ms" />
          <Metric label="Packet Loss" value={l.packetLoss.toFixed(1)} unit="%" />
        </div>

        <div className="border border-hairline bg-background/60 p-2">
          <div className="label-chip mb-2 flex items-center justify-between text-muted-foreground">
            <span>FUTURE COMMUNICATION ARCHITECTURE</span>
            <span className="border border-caution/50 px-1.5 py-0.5 text-caution">PLANNED — NOT ACTIVE</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto">
            {MESH.map((node, i) => (
              <div key={node} className="flex items-center gap-1">
                <span className="label-chip whitespace-nowrap border border-dashed border-hairline px-1.5 py-1 text-muted-foreground">
                  {node}
                </span>
                {i < MESH.length - 1 ? <span className="h-px w-4 bg-hairline" aria-hidden /> : null}
              </div>
            ))}
          </div>
          <p className="label-chip mt-2 text-muted-foreground">ESP-NOW MESH RELAY CHAIN · PHASE 2 DESIGN</p>
        </div>
      </div>
    </Panel>
  );
}
