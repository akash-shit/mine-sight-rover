import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { LogOut, Radio } from "lucide-react";

import { useTelemetry } from "@/hooks/useTelemetry";
import { useSession } from "@/hooks/useSession";
import { MISSION_ID, ROVER_ID } from "@/services/api";
import { clockTime, duration, statusDot, statusLabel, statusText } from "@/utils/format";
import { cn } from "@/lib/utils";

export function CommandHeader() {
  const { frame, sessionElapsed, error } = useTelemetry();
  const { operator, signOut } = useSession();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const threat = frame?.system.threatLevel ?? "nominal";
  const critical = threat === "critical";

  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center gap-4 border-b border-hairline bg-panel px-4 transition-colors",
        critical && "border-danger/60 bg-danger/5",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Radio className={cn("h-4 w-4", critical ? "text-danger" : "text-signal")} aria-hidden />
        <h1 className="label-chip truncate text-foreground">Mine Rescue Command</h1>
      </div>

      <div className="hidden flex-1 items-center justify-center gap-5 lg:flex">
        <span className="readout text-[11px] text-muted-foreground">
          MISSION <span className="text-foreground">{MISSION_ID}</span>
        </span>
        <span className="readout text-[11px] text-muted-foreground">
          ROVER <span className="text-foreground">{ROVER_ID}</span>
        </span>
        <span className="readout text-[11px] text-muted-foreground">
          TIMER <span className="text-data">{duration(sessionElapsed)}</span>
        </span>
        <span className="readout text-[11px] text-muted-foreground">
          UTC <span className="text-foreground">{now ? clockTime(now) : "--:--:--"}</span>
        </span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span
          className={cn(
            "label-chip flex items-center gap-1.5 border px-2 py-1",
            critical ? "border-danger/60 bg-danger/10" : "border-hairline",
            statusText[threat],
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full animate-status-pulse", statusDot[threat])} aria-hidden />
          THREAT LEVEL {statusLabel[threat]}
        </span>
        {error ? (
          <span className="label-chip border border-danger/60 bg-danger/10 px-2 py-1 text-danger">LINK LOST — RETRYING</span>
        ) : null}
        <span className="label-chip hidden text-muted-foreground md:inline">
          {operator?.operatorId ?? "RESCUE-OPS-01"}
        </span>
        <Link
          to="/"
          onClick={signOut}
          className="label-chip flex items-center gap-1 border border-hairline px-2 py-1 text-muted-foreground transition-colors hover:border-signal/50 hover:text-signal"
        >
          <LogOut className="h-3 w-3" aria-hidden /> Exit
        </Link>
      </div>
    </header>
  );
}
