import { createFileRoute } from "@tanstack/react-router";

import { AIPerception } from "@/components/panels/AIPerception";
import { DemoMode } from "@/components/panels/DemoMode";
import { VisionPanel } from "@/components/panels/VisionPanel";

export const Route = createFileRoute("/dashboard/vision")({
  head: () => ({
    meta: [
      { title: "Live Vision — AEGIS-SUBTERRA" },
      { name: "description", content: "ESP32-CAM tunnel feed with YOLO11s detection overlay and simulated thermal view." },
      { property: "og:title", content: "Live Vision — AEGIS-SUBTERRA" },
      { property: "og:description", content: "AI vision feed from the underground rover." },
    ],
  }),
  component: VisionView,
});

function VisionView() {
  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
      <VisionPanel className="xl:col-span-8" />
      <AIPerception className="xl:col-span-4" />
      <DemoMode className="xl:col-span-12" />
    </div>
  );
}
