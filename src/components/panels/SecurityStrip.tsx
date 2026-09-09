import { KeyRound, Lock, ShieldCheck, UserCheck } from "lucide-react";

import { useSession } from "@/hooks/useSession";
import { MISSION_ID } from "@/services/api";

export function SecurityStrip() {
  const { operator } = useSession();
  const items = [
    { icon: ShieldCheck, label: "Control Access", value: operator ? "AUTHENTICATED" : "GUEST DEMO" },
    { icon: KeyRound, label: "Session ID", value: operator?.sessionId ?? "SES-DEMO" },
    { icon: UserCheck, label: "Role", value: operator?.role ?? "RESCUE COMMANDER" },
    { icon: Lock, label: "Connection", value: "ENCRYPTED (DEMO)" },
    { icon: ShieldCheck, label: "Mission", value: MISSION_ID },
  ];

  return (
    <div className="panel flex flex-wrap items-center gap-x-5 gap-y-2 rounded-sm px-3 py-2">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <i.icon className="h-3.5 w-3.5 text-data" aria-hidden />
          <span className="label-chip text-muted-foreground">{i.label}</span>
          <span className="readout text-[11px] text-foreground">{i.value}</span>
        </span>
      ))}
      <span className="label-chip ml-auto text-muted-foreground">VISUAL DEMO ONLY — NO CRYPTOGRAPHIC CLAIM</span>
    </div>
  );
}
