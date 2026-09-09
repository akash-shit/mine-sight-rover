import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-6 w-6", className)} role="img" aria-label="AEGIS-SUBTERRA mark">
      <path d="M16 2 L28 8 V18 C28 24 22 28.5 16 30 C10 28.5 4 24 4 18 V8 Z" fill="none" stroke="var(--signal)" strokeWidth="1.6" />
      <path d="M16 8 L22 11 V18 C22 21 19 23.5 16 24.5 C13 23.5 10 21 10 18 V11 Z" fill="none" stroke="var(--data)" strokeWidth="1.2" />
      <circle cx="16" cy="16.5" r="2.2" fill="var(--signal)" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-sans text-sm font-semibold tracking-[0.22em] text-foreground", className)}>
      AEGIS<span className="text-signal">-</span>SUBTERRA
    </span>
  );
}
