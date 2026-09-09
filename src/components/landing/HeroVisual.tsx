import { motion } from "motion/react";

/** Abstract tunnel-depth hero: rover silhouette, sensor sweeps, dust drift. */
export function HeroVisual() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-label="Rover exploring a dark mine tunnel">
        <defs>
          <radialGradient id="tunnelDepth" cx="50%" cy="46%" r="60%">
            <stop offset="0%" stopColor="oklch(0.3 0.04 60)" />
            <stop offset="55%" stopColor="oklch(0.18 0.015 250)" />
            <stop offset="100%" stopColor="oklch(0.13 0.008 250)" />
          </radialGradient>
          <linearGradient id="scanFade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--data)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--data)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--data)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect width="400" height="300" fill="url(#tunnelDepth)" />

        {/* tunnel rings receding */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const scale = 1 - i * 0.15;
          return (
            <motion.ellipse
              key={i}
              cx="200"
              cy="140"
              rx={190 * scale}
              ry={120 * scale}
              fill="none"
              stroke="var(--hairline)"
              strokeWidth="1"
              initial={{ opacity: 0.1 }}
              animate={{ opacity: [0.12, 0.4, 0.12] }}
              transition={{ duration: 4, repeat: Infinity, delay: i * 0.35 }}
            />
          );
        })}

        {/* comms waves */}
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={`w${i}`}
            cx="200"
            cy="215"
            r="20"
            fill="none"
            stroke="var(--data)"
            strokeWidth="0.8"
            animate={{ r: [16, 90], opacity: [0.55, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, delay: i * 1.05, ease: "easeOut" }}
          />
        ))}

        {/* sensor sweep */}
        <motion.rect
          x="0"
          y="0"
          width="400"
          height="1.2"
          fill="url(#scanFade)"
          animate={{ y: [40, 250, 40] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* rover silhouette */}
        <motion.g animate={{ y: [0, -3, 0] }} transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}>
          <path d="M160 220 L168 200 L232 200 L240 220 Z" fill="oklch(0.24 0.015 250)" stroke="var(--hairline)" strokeWidth="1" />
          <rect x="176" y="184" width="48" height="18" fill="oklch(0.28 0.015 250)" stroke="var(--hairline)" strokeWidth="1" />
          <circle cx="172" cy="222" r="8" fill="oklch(0.2 0.01 250)" stroke="var(--hairline)" />
          <circle cx="200" cy="224" r="8" fill="oklch(0.2 0.01 250)" stroke="var(--hairline)" />
          <circle cx="228" cy="222" r="8" fill="oklch(0.2 0.01 250)" stroke="var(--hairline)" />
          <motion.circle
            cx="184"
            cy="192"
            r="3"
            fill="var(--signal)"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          <motion.circle
            cx="216"
            cy="192"
            r="3"
            fill="var(--signal)"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          {/* headlight cone */}
          <motion.path
            d="M200 190 L120 120 L280 120 Z"
            fill="var(--signal)"
            animate={{ opacity: [0.06, 0.16, 0.06] }}
            transition={{ duration: 3.6, repeat: Infinity }}
          />
        </motion.g>

        {/* dust particles */}
        {Array.from({ length: 26 }).map((_, i) => (
          <motion.circle
            key={`d${i}`}
            cx={(i * 37) % 400}
            cy={(i * 61) % 280}
            r={0.8 + (i % 3) * 0.4}
            fill="var(--muted-foreground)"
            animate={{ y: [0, -22, 0], opacity: [0.05, 0.35, 0.05] }}
            transition={{ duration: 6 + (i % 5), repeat: Infinity, delay: i * 0.22 }}
          />
        ))}
      </svg>
      <div className="pointer-events-none absolute inset-0 grid-field-fine opacity-25" aria-hidden />
    </div>
  );
}
