import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Compass } from "lucide-react";

import { BootIntro } from "@/components/landing/BootIntro";
import { HeroVisual } from "@/components/landing/HeroVisual";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TechStrip } from "@/components/landing/TechStrip";
import { LogoMark, Wordmark } from "@/components/layout/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AEGIS-SUBTERRA — AI Mine Safety, Monitoring & Rescue" },
      {
        name: "description",
        content:
          "Rover-borne gas sensing, YOLO11s vision, structural monitoring and 2D ultrasonic tunnel mapping for underground coal mine rescue teams.",
      },
      { property: "og:title", content: "AEGIS-SUBTERRA — AI Mine Safety, Monitoring & Rescue" },
      {
        property: "og:description",
        content: "Sense the hazard. Map the unknown. Protect the rescuer.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  "Real-Time Sensing",
  "AI Vision",
  "Structural Monitoring",
  "2D Mapping",
  "Remote Control",
  "Hazard Alerting",
];

function Landing() {
  const [booting, setBooting] = useState(true);

  return (
    <div className="relative min-h-screen bg-background">
      <AnimatePresence>{booting ? <BootIntro onDone={() => setBooting(false)} /> : null}</AnimatePresence>

      <div className="pointer-events-none fixed inset-0 grid-field opacity-40" aria-hidden />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center gap-3 px-6 py-5">
        <LogoMark />
        <Wordmark />
        <span className="label-chip ml-3 hidden border border-hairline px-2 py-1 text-muted-foreground md:inline">
          SIH 2026 · PS 26039 · GOVT. OF JHARKHAND
        </span>
        <Link
          to="/auth"
          className="label-chip ml-auto border border-hairline px-3 py-1.5 text-muted-foreground transition-colors hover:border-signal/60 hover:text-signal"
        >
          Operator Sign-In
        </Link>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1.05fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: booting ? 0 : 1, y: booting ? 18 : 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.2, 0.7, 0.3, 1] }}
          >
            <p className="label-chip text-signal">SENSE THE HAZARD · MAP THE UNKNOWN · PROTECT THE RESCUER</p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.03] tracking-tight text-foreground sm:text-6xl">
              AEGIS
              <span className="text-signal">-</span>
              SUBTERRA
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground">
              AI-Powered Underground Mine Safety, Monitoring &amp; Rescue System.
            </p>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Real-time gas and climate sensing, AI vision, structural monitoring and remote robotic intervention —
              so a rover enters the collapsed tunnel instead of a rescuer.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/auth"
                className="group inline-flex items-center gap-2 border border-signal bg-signal/15 px-5 py-3 text-signal transition-colors hover:bg-signal/25"
              >
                <span className="label-chip">Enter Control Station</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
              <a
                href="#how-heading"
                className="inline-flex items-center gap-2 border border-hairline px-5 py-3 text-muted-foreground transition-colors hover:border-data/60 hover:text-data"
              >
                <Compass className="h-4 w-4" aria-hidden />
                <span className="label-chip">Explore System</span>
              </a>
            </div>

            <ul className="mt-8 flex flex-wrap gap-2">
              {FEATURES.map((f, i) => (
                <motion.li
                  key={f}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: booting ? 0 : 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.06, duration: 0.4 }}
                  className="label-chip border border-hairline px-2.5 py-1.5 text-muted-foreground"
                >
                  {f}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: booting ? 0 : 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="panel notch h-[340px] w-full overflow-hidden lg:h-[420px]"
          >
            <HeroVisual />
          </motion.div>
        </section>

        <HowItWorks />
        <TechStrip />

        <section className="mx-auto w-full max-w-6xl px-6 pb-24">
          <div className="panel notch flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Ready to take the console?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The control station runs on simulated telemetry for this demo — every panel is live and reactive.
              </p>
            </div>
            <Link
              to="/auth"
              className="ml-auto inline-flex items-center gap-2 border border-signal bg-signal/15 px-5 py-3 text-signal transition-colors hover:bg-signal/25"
            >
              <span className="label-chip">Enter Control Station</span>
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-hairline">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-6 py-6">
          <LogoMark className="h-4 w-4" />
          <span className="label-chip text-muted-foreground">AEGIS-SUBTERRA CONTROL SYSTEM</span>
          <span className="label-chip ml-auto text-muted-foreground">
            PROTOTYPE — SIMULATED TELEMETRY, NO LIVE HARDWARE ATTACHED
          </span>
        </div>
      </footer>
    </div>
  );
}
