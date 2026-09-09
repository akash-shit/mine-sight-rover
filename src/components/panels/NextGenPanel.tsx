import { motion } from "motion/react";
import { Bot, Network, Thermometer, Users } from "lucide-react";

import { Panel } from "@/components/common/Panel";

const CAPABILITIES = [
  {
    icon: Network,
    title: "ESP-NOW Mesh",
    pitch: "Relay nodes extend telemetry beyond Wi-Fi range deep into the shaft.",
    status: "Phase 2",
  },
  {
    icon: Thermometer,
    title: "MLX90640 True Thermal",
    pitch: "Real thermal array replaces today's simulated false-color view.",
    status: "Planned",
  },
  {
    icon: Bot,
    title: "Autonomous Navigation",
    pitch: "Onboard path planning from ultrasonic returns, operator supervised.",
    status: "Research",
  },
  {
    icon: Users,
    title: "Multi-Rover Swarm",
    pitch: "Coordinated sweep of parallel galleries with shared map fusion.",
    status: "Research",
  },
] as const;

export function NextGenPanel({ className }: { className?: string }) {
  return (
    <Panel index="10" title="Next-Gen Capabilities" subtitle="roadmap — not implemented" className={className}>
      <div className="grid gap-2 sm:grid-cols-2">
        {CAPABILITIES.map((c, i) => (
          <motion.article
            key={c.title}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className="panel-raised flex gap-3 rounded-sm p-3"
          >
            <c.icon className="h-4 w-4 shrink-0 text-data" aria-hidden />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="label-chip text-foreground">{c.title}</h3>
                <span className="label-chip border border-caution/50 px-1.5 py-0.5 text-caution">{c.status}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{c.pitch}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </Panel>
  );
}
