import type { LogRow, StatusLevel, TelemetryFrame } from "@/types/telemetry";

export const pad2 = (n: number) => String(n).padStart(2, "0");

export function clockTime(ts: number) {
  const d = new Date(ts);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

export function duration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

export const statusLabel: Record<StatusLevel, string> = {
  nominal: "NOMINAL",
  caution: "WARNING",
  critical: "CRITICAL",
  offline: "OFFLINE",
};

/** Tailwind token classes per status. Never color-only — always paired with text/icon in UI. */
export const statusText: Record<StatusLevel, string> = {
  nominal: "text-nominal",
  caution: "text-caution",
  critical: "text-danger",
  offline: "text-muted-foreground",
};

export const statusBorder: Record<StatusLevel, string> = {
  nominal: "border-nominal/40",
  caution: "border-caution/60",
  critical: "border-danger/70",
  offline: "border-border",
};

export const statusDot: Record<StatusLevel, string> = {
  nominal: "bg-nominal",
  caution: "bg-caution",
  critical: "bg-danger",
  offline: "bg-muted-foreground",
};

export function frameToLogRow(frame: TelemetryFrame): LogRow {
  return {
    time: clockTime(frame.t),
    mq7: frame.gases[0].value,
    mq2: frame.gases[1].value,
    mq9: frame.gases[2].value,
    temp: frame.climate.temperature,
    humidity: frame.climate.humidity,
    roll: frame.structural.roll,
    pitch: frame.structural.pitch,
    distance: frame.structural.clearance,
    status: statusLabel[frame.system.threatLevel],
  };
}

export function rowsToCsv(rows: LogRow[]) {
  const header = [
    "Time",
    "MQ7_CO_ppm",
    "MQ2_Methane_ppm",
    "MQ9_Combustible_ppm",
    "Temperature_C",
    "Humidity_pct",
    "Roll_deg",
    "Pitch_deg",
    "Distance_cm",
    "Status",
  ].join(",");
  const body = rows.map((r) =>
    [r.time, r.mq7, r.mq2, r.mq9, r.temp, r.humidity, r.roll, r.pitch, r.distance, r.status].join(","),
  );
  return [header, ...body].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
