import { motion } from "motion/react";
import type { ScenarioId } from "@/types/telemetry";
import { cn } from "@/lib/utils";

/**
 * Simulated ESP32-CAM tunnel feed. Pure SVG/CSS — no video asset, no real
 * camera. Replaced by an MJPEG <img>/WebRTC surface when the backend lands.
 */
export function TunnelFeed({
  scenario,
  thermal,
  offline,
}: {
  scenario: ScenarioId;
  thermal: boolean;
  offline: boolean;
}) {
  if (offline) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background scanlines">
        <div className="text-center">
          <div className="label-chip text-danger">CAMERA LINK LOST</div>
          <div className="label-chip mt-1 text-muted-foreground">awaiting stream reacquisition</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("absolute inset-0 overflow-hidden", thermal && "[filter:hue-rotate(150deg)_saturate(2.4)_contrast(1.25)]")}>
      <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="depth" cx="52%" cy="48%" r="62%">
            <stop offset="0%" stopColor="oklch(0.42 0.05 60)" />
            <stop offset="45%" stopColor="oklch(0.22 0.02 60)" />
            <stop offset="100%" stopColor="oklch(0.1 0.008 250)" />
          </radialGradient>
          <linearGradient id="wall" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.2 0.015 60)" />
            <stop offset="100%" stopColor="oklch(0.3 0.03 60)" />
          </linearGradient>
        </defs>
        <rect width="160" height="90" fill="url(#depth)" />
        {/* tunnel walls converging to vanishing point */}
        <polygon points="0,0 60,38 60,54 0,90" fill="url(#wall)" opacity="0.85" />
        <polygon points="160,0 100,38 100,54 160,90" fill="url(#wall)" opacity="0.85" />
        <polygon points="0,90 60,54 100,54 160,90" fill="oklch(0.17 0.012 60)" />
        <polygon points="0,0 60,38 100,38 160,0" fill="oklch(0.13 0.01 250)" />
        {/* rock texture strokes */}
        {Array.from({ length: 22 }).map((_, i) => (
          <line
            key={i}
            x1={(i * 7.3) % 160}
            y1={(i * 13) % 90}
            x2={((i * 7.3) % 160) + 6}
            y2={((i * 13) % 90) + 3}
            stroke="oklch(0.35 0.02 60)"
            strokeWidth="0.4"
            opacity="0.5"
          />
        ))}
        {/* support beams */}
        {[36, 52, 68].map((x, i) => (
          <g key={x} opacity={0.6 - i * 0.12}>
            <rect x={x} y={38 - i * 2} width="1" height={20 + i * 6} fill="oklch(0.4 0.03 60)" />
            <rect x={160 - x} y={38 - i * 2} width="1" height={20 + i * 6} fill="oklch(0.4 0.03 60)" />
          </g>
        ))}
        {scenario === "fire-smoke" ? (
          <g>
            <ellipse cx="92" cy="52" rx="14" ry="9" fill="oklch(0.68 0.19 45)" opacity="0.55" />
            <ellipse cx="92" cy="50" rx="7" ry="5" fill="oklch(0.82 0.18 70)" opacity="0.8" />
          </g>
        ) : null}
        {scenario === "gas-leak" || scenario === "fire-smoke" ? (
          <ellipse cx="76" cy="30" rx="42" ry="16" fill="oklch(0.6 0.02 250)" opacity="0.28" />
        ) : null}
        {scenario === "trapped-worker" ? (
          <g opacity="0.9">
            <circle cx="80" cy="44" r="3" fill="oklch(0.55 0.06 60)" />
            <rect x="77" y="47" width="6" height="10" rx="2" fill="oklch(0.5 0.08 40)" />
            <rect x="76.5" y="41" width="7" height="2" rx="1" fill="oklch(0.8 0.15 80)" />
          </g>
        ) : null}
        {scenario === "structural" ? (
          <path d="M60,20 L74,26 L88,18 L102,25" stroke="oklch(0.55 0.03 60)" strokeWidth="0.8" fill="none" />
        ) : null}
      </svg>

      {/* headlight cone */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: [0.55, 0.8, 0.55] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(ellipse 40% 34% at 52% 50%, color-mix(in oklch, var(--signal) 22%, transparent), transparent 70%)",
        }}
        aria-hidden
      />
      {/* dust drift */}
      <div className="pointer-events-none absolute inset-0 opacity-40 grid-field-fine animate-grid-drift" aria-hidden />
      <div className="pointer-events-none absolute inset-0 scanlines opacity-40" aria-hidden />
      {/* rolling capture line */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 h-16"
        style={{ background: "linear-gradient(to bottom, transparent, color-mix(in oklch, var(--data) 8%, transparent), transparent)" }}
        animate={{ y: ["-10%", "110%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        aria-hidden
      />
    </div>
  );
}
