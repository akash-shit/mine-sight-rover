import { useEffect, useState } from "react";
import { motion } from "motion/react";

import { LogoMark } from "@/components/layout/Logo";

const SUBSYSTEMS = ["SENSOR BUS", "CAMERA LINK", "AI ENGINE", "TELEMETRY", "MAPPING"];
const TEXT = "INITIALIZING SYSTEM...";

export function BootIntro({ onDone }: { onDone: () => void }) {
  const [typed, setTyped] = useState("");
  const [active, setActive] = useState(0);
  const [linked, setLinked] = useState(false);

  useEffect(() => {
    let i = 0;
    const type = setInterval(() => {
      i += 1;
      setTyped(TEXT.slice(0, i));
      if (i >= TEXT.length) clearInterval(type);
    }, 34);
    return () => clearInterval(type);
  }, []);

  useEffect(() => {
    const timers = SUBSYSTEMS.map((_, i) => setTimeout(() => setActive(i + 1), 900 + i * 160));
    const linkT = setTimeout(() => setLinked(true), 1800);
    const done = setTimeout(onDone, 2500);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(linkT);
      clearTimeout(done);
    };
  }, [onDone]);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <motion.div
          className="absolute inset-x-0 h-px bg-signal/60"
          animate={{ top: ["10%", "90%", "10%"] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
        <LogoMark className="h-12 w-12" />
      </motion.div>

      <p className="readout mt-5 text-xs tracking-[0.28em] text-signal">
        {typed}
        <span className="animate-status-pulse">_</span>
      </p>

      <ul className="mt-6 space-y-1">
        {SUBSYSTEMS.map((s, i) => (
          <li key={s} className="flex w-[240px] items-center justify-between">
            <span className="label-chip text-muted-foreground">{s}</span>
            <span className={i < active ? "label-chip text-nominal" : "label-chip text-muted-foreground/40"}>
              {i < active ? "ONLINE" : "····"}
            </span>
          </li>
        ))}
      </ul>

      {linked ? (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="label-chip mt-6 border border-nominal/50 bg-nominal/10 px-3 py-1.5 text-nominal"
        >
          LINK ESTABLISHED
        </motion.p>
      ) : null}

      <button
        type="button"
        onClick={onDone}
        className="label-chip absolute bottom-8 border border-hairline px-3 py-1.5 text-muted-foreground transition-colors hover:border-signal/60 hover:text-signal"
      >
        Skip intro
      </button>
    </motion.div>
  );
}
