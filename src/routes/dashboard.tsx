import { useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";

import { BootSequence } from "@/components/layout/BootSequence";
import { CommandHeader } from "@/components/layout/CommandHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { TelemetryProvider, useTelemetry } from "@/hooks/useTelemetry";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const [booted, setBooted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TelemetryProvider>
      <AnimatePresence>{!booted ? <BootSequence onDone={() => setBooted(true)} /> : null}</AnimatePresence>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <div className="hidden md:flex">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <CommandHeader />
          <DangerEdge />
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: booted ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-0 flex-1 overflow-y-auto p-3"
          >
            <Outlet />
          </motion.main>
          <MobileNavHint />
        </div>
      </div>
    </TelemetryProvider>
  );
}

/** Screen-edge pulse while a critical threat is active — never a full-screen flash. */
function DangerEdge() {
  const { frame } = useTelemetry();
  if (frame?.system.threatLevel !== "critical") return null;
  return <div className="pointer-events-none fixed inset-0 z-40 animate-danger-edge" aria-hidden />;
}

function MobileNavHint() {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-hairline bg-panel md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="label-chip w-full py-2.5 text-muted-foreground"
      >
        {open ? "Hide navigation" : "Show navigation"}
      </button>
      {open ? (
        <div className="max-h-[46vh] overflow-y-auto">
          <Sidebar collapsed={false} onToggle={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
