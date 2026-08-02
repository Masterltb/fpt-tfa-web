import { cn } from "@/lib/utils";

/* Soft SaaS surfaces: white cards on the tinted ground, gentle depth, and
   colour used only where it carries meaning. */

export function Card({
  children,
  className,
  interactive,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      {...rest}
      data-card
      className={cn(
        "rounded-card border border-line bg-surface",
        "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)]",
        interactive && "transition-shadow hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_14px_32px_-14px_rgba(15,23,42,0.18)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

type Tone = "orange" | "blue" | "green" | "danger" | "neutral";

const BADGE: Record<Tone, string> = {
  orange: "bg-fpt-orange/10 text-fpt-orange-ink",
  blue: "bg-fpt-blue/10 text-fpt-blue-ink",
  green: "bg-fpt-green/12 text-fpt-green-ink",
  danger: "bg-danger/10 text-danger",
  neutral: "bg-ink/[0.055] text-ink-soft",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
        "text-[0.78rem] font-600 leading-[1.5]",
        BADGE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const BUTTON: Record<"primary" | "secondary" | "ghost", string> = {
  // Ink on brand orange: white on #F37021 measures 2.9:1.
  primary: "bg-fpt-orange text-ink hover:brightness-[1.06] shadow-[0_2px_8px_-2px_rgba(243,112,33,0.5)]",
  secondary: "border border-line bg-surface text-ink hover:bg-ink/[0.03]",
  ghost: "text-ink-soft hover:bg-ink/[0.045]",
};

export function Button({
  variant = "secondary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[10px] px-4 py-2.5",
        "text-[0.9rem] font-600 leading-[1.4] transition-all",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
        BUTTON[variant],
        className,
      )}
    />
  );
}

/** A labelled figure with plain-language meaning, not a bare metric. */
export function Stat({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: Tone;
}) {
  const accent: Record<Tone, string> = {
    orange: "text-fpt-orange-ink",
    blue: "text-fpt-blue-ink",
    green: "text-fpt-green-ink",
    danger: "text-danger",
    neutral: "text-ink",
  };
  return (
    <div className="px-4 py-3.5">
      <p className="text-[0.78rem] font-500 leading-[1.5] text-ink-soft">{label}</p>
      <p className={cn("mt-0.5 text-[1.4rem] font-700 leading-[1.35] tabular-nums", accent[tone])}>
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[0.75rem] leading-[1.5] text-ink-faint">{hint}</p>}
    </div>
  );
}

/** A proportion shown as a bar, with the real numbers stated beside it. */
export function Meter({
  label,
  value,
  max,
  suffix,
  tone = "blue",
  muted,
}: {
  label: string;
  value: number;
  max: number;
  suffix?: string;
  tone?: Exclude<Tone, "neutral">;
  muted?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fill: Record<Exclude<Tone, "neutral">, string> = {
    orange: "bg-fpt-orange",
    blue: "bg-fpt-blue",
    green: "bg-fpt-green",
    danger: "bg-danger",
  };
  const shown = Number.isInteger(value) ? String(value) : value.toFixed(2);

  return (
    <div className={cn(muted && "opacity-55")}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[0.8rem] font-500 leading-[1.5] text-ink-soft">{label}</span>
        <span className="text-[0.85rem] font-700 leading-[1.5] tabular-nums text-ink">
          {shown}
          {suffix && <span className="ml-0.5 font-500 text-ink-faint">{suffix}</span>}
        </span>
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/[0.07]"
      >
        <div className={cn("h-full rounded-full transition-[width] duration-500", fill[tone])} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Initials from a Vietnamese name: family initial + given name initial. */
export function Initials({ name, tone = "blue" }: { name: string; tone?: Tone }) {
  const parts = name.trim().split(/\s+/);
  const text = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0]?.[0] ?? "?");
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full",
        "text-[0.72rem] font-700 uppercase leading-none",
        BADGE[tone],
      )}
    >
      {text}
    </span>
  );
}
