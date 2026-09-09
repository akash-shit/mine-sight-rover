import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Brain,
  Camera,
  ChevronLeft,
  Gauge,
  LayoutGrid,
  Map,
  ScrollText,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";

import { LogoMark, Wordmark } from "./Logo";
import { useTelemetry } from "@/hooks/useTelemetry";
import { ROVER_ID } from "@/services/api";
import { statusDot, statusLabel } from "@/utils/format";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Command", icon: SlidersHorizontal, exact: true },
  { to: "/dashboard/overview", label: "Overview", icon: LayoutGrid },
  { to: "/dashboard/vision", label: "Live Vision", icon: Camera },
  { to: "/dashboard/telemetry", label: "Telemetry", icon: Gauge },
  { to: "/dashboard/map", label: "Tunnel Map", icon: Map },
  { to: "/dashboard/hazards", label: "Hazards", icon: ShieldAlert },
  { to: "/dashboard/ai", label: "AI Analysis", icon: Brain },
  { to: "/dashboard/log", label: "Mission Log", icon: ScrollText },
  { to: "/dashboard/system", label: "System", icon: Activity },
] as const;

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { frame, unreadAlerts } = useTelemetry();
  const roverStatus = frame?.system.rover ?? "offline";

  return (
    <nav
      aria-label="Command navigation"
      className={cn(
        "flex shrink-0 flex-col border-r border-hairline bg-sidebar transition-[width] duration-300",
        collapsed ? "w-[60px]" : "w-[212px]",
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-hairline px-3">
        <LogoMark className="h-6 w-6 shrink-0" />
        {!collapsed ? <Wordmark className="text-[11px]" /> : null}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          className="ml-auto text-muted-foreground transition-colors hover:text-signal"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} aria-hidden />
        </button>
      </div>

      <ul className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                title={item.label}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-sm px-2.5 py-2 transition-colors",
                  active
                    ? "bg-signal/12 text-signal"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                )}
              >
                {active ? <span className="absolute inset-y-1 left-0 w-0.5 bg-signal" aria-hidden /> : null}
                <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                {!collapsed ? <span className="label-chip truncate">{item.label}</span> : null}
                {!collapsed && item.label === "Hazards" && unreadAlerts > 0 ? (
                  <span className="label-chip ml-auto border border-danger/60 bg-danger/15 px-1 py-0.5 text-danger">
                    {unreadAlerts}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-hairline p-3">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full animate-status-pulse", statusDot[roverStatus])} aria-hidden />
          {!collapsed ? (
            <div className="min-w-0">
              <div className="label-chip truncate text-foreground">{ROVER_ID}</div>
              <div className="label-chip truncate text-muted-foreground">{statusLabel[roverStatus]}</div>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
