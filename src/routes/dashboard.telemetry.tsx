import { createFileRoute } from "@tanstack/react-router";

import { ClimatePanel } from "@/components/panels/ClimatePanel";
import { GasMatrix } from "@/components/panels/GasMatrix";
import { StructuralPanel } from "@/components/panels/StructuralPanel";
import { SystemStrip } from "@/components/panels/SystemStrip";
import { TelemetryLog } from "@/components/panels/TelemetryLog";

export const Route = createFileRoute("/dashboard/telemetry")({
  head: () => ({
    meta: [
      { title: "Live Telemetry — AEGIS-SUBTERRA" },
      { name: "description", content: "One-hertz sensor stream from the rover: gas, climate, tilt and range readings." },
      { property: "og:title", content: "Live Telemetry — AEGIS-SUBTERRA" },
      { property: "og:description", content: "Continuous underground sensor telemetry with CSV export." },
    ],
  }),
  component: TelemetryView,
});

function TelemetryView() {
  return (
    <div className="space-y-3">
      <SystemStrip />
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <GasMatrix className="xl:col-span-8" />
        <ClimatePanel className="xl:col-span-4" />
        <StructuralPanel className="xl:col-span-4" />
        <TelemetryLog className="xl:col-span-8" rows={18} />
      </div>
    </div>
  );
}
