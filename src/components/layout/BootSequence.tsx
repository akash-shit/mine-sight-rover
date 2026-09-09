import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";

import { LogoMark, Wordmark } from "./Logo";

const STEPS = [
  "Sensor Bus",
  "Camera Link",
  "AI Engine",
  "Telemetry",
  "Mapping",
  "Alert Engine",
];

export function BootSequence({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step > STEPS.length) {
      const t = setTimeout(onDone, 320);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 250 : 190);
    return () => clearTimeout(t);
  }, [step, onDone]);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background grid-field"
    >
      <div className="w-[300px]">
        <div className="mb-5 flex items-center gap-2">
          <LogoMark />
          <Wordmark className="text-xs" />
        </div>
        <ul className="space-y-1.5">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center justify-between border-b border-hairline/60 pb-1.5">
              <span className="label-chip text-muted-foreground">{s}</span>
              <AnimatePresence>
                {i < step ? (
                  <motion.span
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="label-chip flex items-center gap-1 text-nominal"
                  >
                    <Check className="h-3 w-3" aria-hidden /> OK
                  </motion.span>
                ) : (
                  <span className="label-chip text-muted-foreground/50">···</span>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>
        <AnimatePresence>
          {step > STEPS.length ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="label-chip mt-4 border border-nominal/50 bg-nominal/10 px-2 py-1.5 text-center text-nominal"
            >
              SYSTEM READY
            </motion.p>
          ) : null}
        </AnimatePresence>
        <button
          type="button"
          onClick={onDone}
          className="label-chip mt-4 w-full border border-hairline py-1.5 text-muted-foreground transition-colors hover:border-signal/50 hover:text-signal"
        >
          Skip boot sequence
        </button>
      </div>
    </motion.div>
  );
}
