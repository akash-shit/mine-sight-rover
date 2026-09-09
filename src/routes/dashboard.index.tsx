import { createFileRoute } from "@tanstack/react-router";

import { AIPerception } from "@/components/panels/AIPerception";
import { ClimatePanel } from "@/components/panels/ClimatePanel";
import { DemoMode } from "@/components/panels/DemoMode";
import { GasMatrix } from "@/components/panels/GasMatrix";
import { LinkPanel } from "@/components/panels/LinkPanel";
import { NextGenPanel } from "@/components/panels/NextGenPanel";
import { RoverControl } from "@/components/panels/RoverControl";
import { SecurityStrip } from "@/components/panels/SecurityStrip";
import { StructuralPanel } from "@/components/panels/StructuralPanel";
import { SystemStrip } from "@/components/panels/SystemStrip";
import { TelemetryLog } from "@/components/panels/TelemetryLog";
import { ThreatCenter } from "@/components/panels/ThreatCenter";
import { TunnelMapPanel } from "@/components/panels/TunnelMapPanel";
import { VisionPanel } from "@/components/panels/VisionPanel";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Command — AEGIS-SUBTERRA Control Station" },
      { name: "description", content: "Full mine rescue command console: vision, gas matrix, mapping and rover control." },
      { property: "og:title", content: "Command — AEGIS-SUBTERRA Control Station" },
      { property: "og:description", content: "Live mission control for underground rover operations." },
    ],
  }),
  component: CommandView,
});

function CommandView() {
  return (
    <div className="space-y-3">
      <SystemStrip />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <VisionPanel className="xl:col-span-7" />
        <GasMatrix className="xl:col-span-5" />

        <ClimatePanel className="xl:col-span-3" />
        <StructuralPanel className="xl:col-span-4" />
        <RoverControl className="xl:col-span-5" />

        <TunnelMapPanel className="xl:col-span-7" />
        <ThreatCenter className="xl:col-span-5" />

        <AIPerception className="xl:col-span-4" />
        <LinkPanel className="xl:col-span-4" />
        <DemoMode className="xl:col-span-4" />

        <TelemetryLog className="xl:col-span-7" />
        <NextGenPanel className="xl:col-span-5" />
      </div>

      <SecurityStrip />
    </div>
  );
}
