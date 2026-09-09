import { Download, Eraser, Play, Square } from "lucide-react";
import { toast } from "sonner";

import { Panel } from "@/components/common/Panel";
import { useTelemetry } from "@/hooks/useTelemetry";
import { MISSION_ID } from "@/services/api";
import { downloadCsv, duration, rowsToCsv } from "@/utils/format";
import { cn } from "@/lib/utils";

const HEADERS = ["Time", "MQ-7", "MQ-2", "MQ-9", "Temp", "Hum", "Roll", "Pitch", "Dist", "Status"];

export function TelemetryLog({ className, rows = 12 }: { className?: string; rows?: number }) {
  const { log, sessionActive, sessionElapsed, startSession, stopSession, clearLog } = useTelemetry();

  const exportCsv = () => {
    if (log.length === 0) {
      toast.error("Nothing to export", { description: "Start a session to record telemetry rows." });
      return;
    }
    downloadCsv(`aegis-${MISSION_ID}-telemetry.csv`, rowsToCsv([...log].reverse()));
    toast.success("Data export complete", { description: `${log.length} telemetry rows written to CSV.` });
  };

  const btn = "label-chip flex items-center gap-1 border px-2 py-1 transition-colors";

  return (
    <Panel
      index="11"
      title="Live Telemetry"
      subtitle="1 Hz sensor log"
      className={className}
      bodyClassName="p-0"
      actions={
        <>
          <span className="readout text-[10px] text-data">{duration(sessionElapsed)}</span>
          {sessionActive ? (
            <button type="button" onClick={stopSession} className={cn(btn, "border-danger/60 text-danger hover:bg-danger/10")}>
              <Square className="h-3 w-3" /> Stop
            </button>
          ) : (
            <button type="button" onClick={startSession} className={cn(btn, "border-nominal/60 text-nominal hover:bg-nominal/10")}>
              <Play className="h-3 w-3" /> Start
            </button>
          )}
          <button type="button" onClick={exportCsv} className={cn(btn, "border-signal/60 text-signal hover:bg-signal/10")}>
            <Download className="h-3 w-3" /> CSV
          </button>
          <button type="button" onClick={clearLog} className={cn(btn, "border-hairline text-muted-foreground hover:text-foreground")}>
            <Eraser className="h-3 w-3" /> Clear
          </button>
        </>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 bg-panel-raised">
            <tr>
              {HEADERS.map((h) => (
                <th key={h} className="label-chip border-b border-hairline px-2 py-1.5 text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {log.length === 0 ? (
              <tr>
                <td colSpan={HEADERS.length} className="px-2 py-6 text-center text-xs text-muted-foreground">
                  Session stopped — no rows recorded. Press Start to resume logging.
                </td>
              </tr>
            ) : (
              log.slice(0, rows).map((r, i) => (
                <tr key={`${r.time}-${i}`} className={cn("border-b border-hairline/40", i === 0 && "bg-signal/5")}>
                  <td className="readout px-2 py-1 text-[11px] text-data">{r.time}</td>
                  <td className="readout px-2 py-1 text-[11px]">{r.mq7}</td>
                  <td className="readout px-2 py-1 text-[11px]">{r.mq2}</td>
                  <td className="readout px-2 py-1 text-[11px]">{r.mq9}</td>
                  <td className="readout px-2 py-1 text-[11px]">{r.temp}</td>
                  <td className="readout px-2 py-1 text-[11px]">{r.humidity}</td>
                  <td className="readout px-2 py-1 text-[11px]">{r.roll}</td>
                  <td className="readout px-2 py-1 text-[11px]">{r.pitch}</td>
                  <td className="readout px-2 py-1 text-[11px]">{r.distance}</td>
                  <td
                    className={cn(
                      "readout px-2 py-1 text-[11px]",
                      r.status === "CRITICAL" ? "text-danger" : r.status === "WARNING" ? "text-caution" : "text-nominal",
                    )}
                  >
                    {r.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
