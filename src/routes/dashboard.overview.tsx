import { createFileRoute } from "@tanstack/react-router";

import { ClimatePanel } from "@/components/panels/ClimatePanel";
import { DemoMode } from "@/components/panels/DemoMode";
import { GasMatrix } from "@/components/panels/GasMatrix";
import { SecurityStrip } from "@/components/panels/SecurityStrip";
import { StructuralPanel } from "@/components/panels/StructuralPanel";
import { SystemStrip } from "@/components/panels/SystemStrip";
import { ThreatCenter } from "@/components/panels/ThreatCenter";

export const Route = createFileRoute("/dashboard/overview")({
  head: () => ({
    meta: [
      { title: "Mission Overview — AEGIS-SUBTERRA" },
      { name: "description", content: "Condensed status view of rover, sensors, climate and active hazards." },
      { property: "og:title", content: "Mission Overview — AEGIS-SUBTERRA" },
      { property: "og:description", content: "Condensed mine rescue mission status at a glance." },
    ],
  }),
  component: OverviewView,
});

function OverviewView() {
  return (
    <div className="space-y-3">
      <SystemStrip />
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <GasMatrix className="xl:col-span-7" />
        <ClimatePanel className="xl:col-span-5" />
        <StructuralPanel className="xl:col-span-5" />
        <ThreatCenter className="xl:col-span-7" />
        <DemoMode className="xl:col-span-12" />
      </div>
      <SecurityStrip />
    </div>
  );
}
