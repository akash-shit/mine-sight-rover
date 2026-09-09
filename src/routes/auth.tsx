import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Fingerprint, Lock, ShieldCheck, User } from "lucide-react";

import { HeroVisual } from "@/components/landing/HeroVisual";
import { LogoMark, Wordmark } from "@/components/layout/Logo";
import { useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Operator Sign-In — AEGIS-SUBTERRA Control Station" },
      {
        name: "description",
        content: "Demo operator access to the AEGIS-SUBTERRA mine rescue command console.",
      },
      { property: "og:title", content: "Operator Sign-In — AEGIS-SUBTERRA" },
      { property: "og:description", content: "Authorized personnel only — mine rescue control system." },
    ],
  }),
  component: AuthPage,
});

const ROLES = ["RESCUE COMMANDER", "SAFETY OFFICER", "ROVER PILOT", "MINE SUPERVISOR"];

function AuthPage() {
  const navigate = useNavigate();
  const { signIn } = useSession();
  const [operatorId, setOperatorId] = useState("RESCUE-OPS-01");
  const [code, setCode] = useState("");
  const [role, setRole] = useState(ROLES[0]);
  const [granted, setGranted] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    signIn(operatorId, role);
    setGranted(true);
    setTimeout(() => void navigate({ to: "/dashboard" }), 1100);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="pointer-events-none absolute inset-0 opacity-35" aria-hidden>
        <HeroVisual />
      </div>
      <div className="pointer-events-none absolute inset-0 grid-field opacity-40" aria-hidden />
      <motion.div
        className="pointer-events-none absolute inset-x-0 h-px bg-signal/40"
        animate={{ top: ["12%", "88%", "12%"] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.7, 0.3, 1] }}
        className="panel notch relative z-10 w-full max-w-md p-7"
      >
        <div className="flex items-center gap-2">
          <LogoMark />
          <Wordmark className="text-[11px]" />
        </div>
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-foreground">Control Station Access</h1>
        <p className="label-chip mt-1 text-muted-foreground">DEMO AUTHENTICATION — NO CREDENTIALS VERIFIED</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="operator" className="label-chip flex items-center gap-1.5 text-muted-foreground">
              <User className="h-3 w-3" aria-hidden /> Operator ID
            </label>
            <input
              id="operator"
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              placeholder="RESCUE-OPS-01"
              className="readout w-full border border-hairline bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-signal"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="code" className="label-chip flex items-center gap-1.5 text-muted-foreground">
              <Lock className="h-3 w-3" aria-hidden /> Access Code
            </label>
            <input
              id="code"
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="••••••••"
              className="readout w-full border border-hairline bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-signal"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="role" className="label-chip flex items-center gap-1.5 text-muted-foreground">
              <ShieldCheck className="h-3 w-3" aria-hidden /> Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="label-chip w-full border border-hairline bg-background px-3 py-3 text-foreground outline-none transition-colors focus:border-signal"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 border border-signal bg-signal/15 py-3 text-signal transition-colors hover:bg-signal/25"
          >
            <Fingerprint className="h-4 w-4" aria-hidden />
            <span className="label-chip">Authenticate &amp; Enter</span>
          </button>
        </form>

        <div className="mt-5 flex flex-wrap gap-2">
          {["Network Online", "Sensor Link Ready", "AI Engine Ready"].map((s, i) => (
            <span key={s} className="label-chip flex items-center gap-1.5 border border-nominal/40 bg-nominal/10 px-2 py-1 text-nominal">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-nominal"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3 }}
                aria-hidden
              />
              {s}
            </span>
          ))}
        </div>

        <p className="label-chip mt-6 text-center text-muted-foreground">
          AUTHORIZED PERSONNEL ONLY — AEGIS-SUBTERRA CONTROL SYSTEM
        </p>

        <AnimatePresence>
          {granted ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background/95"
            >
              <motion.span initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={{ duration: 0.35 }}>
                <CheckCircle2 className="h-10 w-10 text-nominal" aria-hidden />
              </motion.span>
              <p className="label-chip text-nominal">ACCESS GRANTED</p>
              <p className="label-chip text-muted-foreground">HANDING OVER TO CONTROL STATION…</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
