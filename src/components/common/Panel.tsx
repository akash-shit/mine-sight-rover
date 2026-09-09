import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelProps {
  index?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  tone?: "default" | "danger" | "caution";
}

/**
 * Instrument housing. Every dashboard module is wrapped in this so the
 * whole console reads as one physical panel array.
 */
export function Panel({
  index,
  title,
  subtitle,
  actions,
  children,
  className,
  bodyClassName,
  tone = "default",
}: PanelProps) {
  return (
    <section
      className={cn(
        "panel flex min-h-0 flex-col rounded-sm",
        tone === "danger" && "border-danger/60 glow-danger",
        tone === "caution" && "border-caution/50",
        className,
      )}
      aria-label={title}
    >
      <header className="flex items-center justify-between gap-3 border-b border-hairline/70 bg-panel-raised/60 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          {index ? (
            <span className="label-chip text-signal/80">{index}</span>
          ) : (
            <span className="h-3 w-px bg-signal/60" aria-hidden />
          )}
          <h2 className="label-chip truncate text-foreground">{title}</h2>
          {subtitle ? (
            <span className="label-chip hidden truncate text-muted-foreground sm:inline">/ {subtitle}</span>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-1.5">{actions}</div> : null}
      </header>
      <div className={cn("min-h-0 flex-1 p-3", bodyClassName)}>{children}</div>
    </section>
  );
}
