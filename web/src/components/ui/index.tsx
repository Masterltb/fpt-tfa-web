import React, { ReactNode, useState } from "react";
import { CohortStatus, ProfileStatus, Proficiency, SkillCategory, TeamRole } from "../../types/ui";
import { X, TrendingUp, TrendingDown } from "lucide-react";

// ─── Avatar ──────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  { bg: "#E0E7FF", text: "#4338CA", border: "#C7D2FE" },
  { bg: "#D1FAE5", text: "#047857", border: "#A7F3D0" },
  { bg: "#FEF3C7", text: "#B45309", border: "#FDE68A" },
  { bg: "#FFE4E6", text: "#BE123C", border: "#FECDD3" },
  { bg: "#EDE9FE", text: "#6D28D9", border: "#DDD6FE" },
  { bg: "#E0F2FE", text: "#0369A1", border: "#BAE6FD" },
  { bg: "#CCFBF1", text: "#0F766E", border: "#99F6E4" },
  { bg: "#FFEDD5", text: "#C2410C", border: "#FED7AA" },
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const c = AVATAR_PALETTE[hash(name) % AVATAR_PALETTE.length];
  const szStyle = {
    sm: { width: 28, height: 28, fontSize: 11 },
    md: { width: 36, height: 36, fontSize: 13 },
    lg: { width: 48, height: 48, fontSize: 15 },
  }[size];
  return (
    <span
      style={{
        ...szStyle,
        backgroundColor: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {initials(name)}
    </span>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────

type BadgeVariant = "default" | "success" | "warning" | "danger" | "neutral";

const badgeColors: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  default: { bg: "#EEF2FF", text: "#4338CA", border: "#E0E7FF" },
  success: { bg: "#ECFDF5", text: "#047857", border: "#D1FAE5" },
  warning: { bg: "#FFFBEB", text: "#B45309", border: "#FEF3C7" },
  danger: { bg: "#FEF2F2", text: "#B91C1C", border: "#FEE2E2" },
  neutral: { bg: "#F3F4F6", text: "#4B5563", border: "#E5E7EB" },
};

export function Badge({
  children,
  variant = "default",
  size = "md",
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
}) {
  const c = badgeColors[variant];
  const sz = size === "sm" ? { fontSize: 11, padding: "2px 8px" } : { fontSize: 12, padding: "3px 10px" };
  return (
    <span
      style={{
        ...sz,
        backgroundColor: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        borderRadius: 999,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

const cohortStatusMap: Record<CohortStatus, { label: string; variant: BadgeVariant }> = {
  draft: { label: "Draft", variant: "neutral" },
  collecting: { label: "Collecting", variant: "default" },
  ready: { label: "Ready", variant: "success" },
  optimizing: { label: "Optimizing", variant: "warning" },
  review: { label: "Review Required", variant: "warning" },
  finalized: { label: "Finalized", variant: "success" },
  archived: { label: "Archived", variant: "neutral" },
};

const profileStatusMap: Record<ProfileStatus, { label: string; variant: BadgeVariant }> = {
  draft: { label: "Draft", variant: "neutral" },
  submitted: { label: "Submitted", variant: "success" },
  locked: { label: "Locked", variant: "default" },
};

export function StatusBadge({ status }: { status: CohortStatus | ProfileStatus | string }) {
  const map = { ...cohortStatusMap, ...profileStatusMap } as Record<
    string,
    { label: string; variant: BadgeVariant }
  >;
  const s = map[status] ?? { label: status, variant: "neutral" as BadgeVariant };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

// ─── Category color ──────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<SkillCategory, { bg: string; text: string; border: string }> = {
  Frontend: { bg: "#EEF2FF", text: "#4338CA", border: "#E0E7FF" },
  Backend: { bg: "#ECFDF5", text: "#047857", border: "#D1FAE5" },
  Mobile: { bg: "#F0F9FF", text: "#0369A1", border: "#E0F2FE" },
  Database: { bg: "#FFFBEB", text: "#B45309", border: "#FEF3C7" },
  "AI & Data": { bg: "#F5F3FF", text: "#6D28D9", border: "#EDE9FE" },
  DevOps: { bg: "#FFF7ED", text: "#C2410C", border: "#FFEDD5" },
  QA: { bg: "#FFF1F2", text: "#BE123C", border: "#FFE4E6" },
  "UI/UX": { bg: "#FDF2F8", text: "#BE185D", border: "#FCE7F3" },
  Product: { bg: "#F0FDFA", text: "#0F766E", border: "#CCFBF1" },
  Communication: { bg: "#ECFEFF", text: "#0E7490", border: "#CFFAFE" },
  Leadership: { bg: "#FDF4FF", text: "#A21CAF", border: "#FAE8FF" },
};

export function categoryColor(_cat?: SkillCategory): string {
  // Returns class fallback or empty string
  return "";
}

export function getCategoryStyle(cat: SkillCategory) {
  return CATEGORY_STYLES[cat] ?? { bg: "#F3F4F6", text: "#4B5563", border: "#E5E7EB" };
}

// ─── SkillChip ───────────────────────────────────────────────────────────────

export function SkillChip({
  name,
  proficiency,
  category,
}: {
  name: string;
  proficiency?: Proficiency;
  category?: SkillCategory;
}) {
  const c = category ? getCategoryStyle(category) : { bg: "#F3F4F6", text: "#4B5563", border: "#E5E7EB" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        borderRadius: 6,
        border: `1px solid ${c.border}`,
        backgroundColor: c.bg,
        color: c.text,
        padding: "2px 8px",
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      {name}
      {proficiency !== undefined && (
        <span style={{ opacity: 0.6, fontWeight: 600 }}>·{proficiency}</span>
      )}
    </span>
  );
}

// ─── Proficiency label ───────────────────────────────────────────────────────

export function proficiencyLabel(n: Proficiency): string {
  return ["", "Novice", "Beginner", "Intermediate", "Advanced", "Expert"][n] ?? "";
}

// ─── RoleBadge ───────────────────────────────────────────────────────────────

const ROLE_STYLES: Record<TeamRole, { bg: string; text: string; border: string }> = {
  Leader: { bg: "#FDF4FF", text: "#A21CAF", border: "#FAE8FF" },
  Developer: { bg: "#EEF2FF", text: "#4338CA", border: "#E0E7FF" },
  Researcher: { bg: "#F5F3FF", text: "#6D28D9", border: "#EDE9FE" },
  Designer: { bg: "#FDF2F8", text: "#BE185D", border: "#FCE7F3" },
  Presenter: { bg: "#ECFEFF", text: "#0E7490", border: "#CFFAFE" },
  Analyst: { bg: "#FFFBEB", text: "#B45309", border: "#FEF3C7" },
  "QA Engineer": { bg: "#FFF1F2", text: "#BE123C", border: "#FFE4E6" },
};

export function RoleBadge({ role }: { role: TeamRole | string }) {
  const c = ROLE_STYLES[role as TeamRole] ?? { bg: "#EEF2FF", text: "#4338CA", border: "#E0E7FF" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 6,
        border: `1px solid ${c.border}`,
        backgroundColor: c.bg,
        color: c.text,
        padding: "2px 8px",
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      {role}
    </span>
  );
}

// ─── MetricCard / StatCard ───────────────────────────────────────────────────

export function MetricCard({
  label,
  value,
  sub,
  trend,
  color = "indigo",
}: {
  label: string;
  value: string | number;
  sub?: string;
  trend?: number;
  color?: "indigo" | "emerald" | "amber" | "red" | "gray";
}) {
  const dotColor = {
    indigo: "#6366F1",
    emerald: "#10B981",
    amber: "#F59E0B",
    red: "#EF4444",
    gray: "#9CA3AF",
  }[color];
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: dotColor }} />
        <p style={{ fontSize: 12, fontWeight: 500, color: "var(--faint)", margin: 0 }}>{label}</p>
      </div>
      <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "8px 0 4px 0" }}>{value}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {sub && <span style={{ fontSize: 12, color: "var(--faint)" }}>{sub}</span>}
        {trend !== undefined && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
              fontSize: 12,
              fontWeight: 500,
              color: trend >= 0 ? "var(--success)" : "var(--danger)",
            }}
          >
            {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}

export function StatCard({ label, value, sub, color = "indigo" }: { label: string; value: number | string; sub?: string; color?: string }) {
  const colors: Record<string, string> = { indigo: "var(--primary)", emerald: "var(--success)", amber: "var(--warn)", red: "var(--danger)" };
  return (
    <div className="stat-card">
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value" style={{ color: colors[color] ?? colors.indigo }}>{value}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </div>
  );
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────

export function ProgressBar({
  value,
  max = 100,
  color = "indigo",
  className = "",
}: {
  value: number;
  max?: number;
  color?: "indigo" | "emerald" | "amber" | "red";
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const barColor = {
    indigo: "var(--primary)",
    emerald: "var(--success)",
    amber: "var(--warn)",
    red: "var(--danger)",
  }[color];
  return (
    <div style={{ height: 8, backgroundColor: "var(--surface-2)", borderRadius: 999, overflow: "hidden", flex: 1, width: "100%" }} className={className}>
      <div style={{ height: "100%", width: `${pct}%`, backgroundColor: barColor, borderRadius: 999, transition: "width 0.3s ease" }} />
    </div>
  );
}

// ─── Donut ───────────────────────────────────────────────────────────────────

export function Donut({ value }: { value: number }) {
  const r = 40, c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: 112, height: 112, flexShrink: 0 }}>
      <svg width="112" height="112" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border-strong)" strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--primary)" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>{value}%</span>
        <span style={{ fontSize: 10, color: "var(--faint)", marginTop: 2 }}>complete</span>
      </div>
    </div>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg className="animate-spin text-current" width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite" }}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

// ─── SectionCard ─────────────────────────────────────────────────────────────

export function SectionCard({
  title,
  subtitle,
  icon,
  actions,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card ${className}`} style={{ padding: 0, overflow: "hidden" }}>
      {(title || actions) && (
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", gap: 12 }}>
          {icon && (
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--faint)" }}>
              {icon}
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            {title && <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>{title}</h2>}
            {subtitle && <p style={{ fontSize: 12, color: "var(--faint)", margin: "2px 0 0 0" }}>{subtitle}</p>}
          </div>
          {actions && <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>{actions}</div>}
        </div>
      )}
      <div style={{ padding: 20 }}>{children}</div>
    </section>
  );
}

// ─── EmptyState ──────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "48px 24px" }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--faint)", marginBottom: 12 }}>
        {icon}
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>{title}</p>
      {description && <p style={{ fontSize: 12, color: "var(--faint)", margin: "4px 0 0 0", maxWidth: 360 }}>{description}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

export function Tooltip({ content, children }: { content: ReactNode; children: ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex" }} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span style={{ position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", marginBottom: 6, zIndex: 50, whiteSpace: "nowrap", borderRadius: 6, backgroundColor: "#111827", color: "#FFFFFF", padding: "4px 8px", fontSize: 11, fontWeight: 500, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
          {content}
        </span>
      )}
    </span>
  );
}

// ─── Tag ─────────────────────────────────────────────────────────────────────

export function Tag({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, borderRadius: 6, backgroundColor: "var(--surface-2)", border: "1px solid var(--border)", padding: "2px 8px", fontSize: 12, color: "var(--text)" }}>
      {label}
      {onRemove && (
        <button onClick={onRemove} style={{ color: "var(--faint)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
          <X size={11} />
        </button>
      )}
    </span>
  );
}

// ─── Button (shared) ─────────────────────────────────────────────────────────

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  style = {},
  ...props
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: "var(--primary)", color: "#FFFFFF", border: "1px solid transparent" },
    secondary: { backgroundColor: "var(--surface-1)", color: "var(--text)", border: "1px solid var(--border)" },
    ghost: { backgroundColor: "transparent", color: "var(--text)", border: "1px solid transparent" },
    danger: { backgroundColor: "var(--danger)", color: "#FFFFFF", border: "1px solid transparent" },
    success: { backgroundColor: "var(--success)", color: "#FFFFFF", border: "1px solid transparent" },
  };
  const szStyles: Record<string, React.CSSProperties> = {
    sm: { fontSize: 12, padding: "6px 10px" },
    md: { fontSize: 13, padding: "8px 16px" },
    lg: { fontSize: 14, padding: "10px 24px" },
  };
  return (
    <button
      className={`btn ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        borderRadius: 8,
        fontWeight: 500,
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.5 : 1,
        transition: "all 0.15s ease",
        ...variantStyles[variant],
        ...szStyles[size],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── Toast & Confetti utilities ──────────────────────────────────────────────

export const toast = {
  success: (msg: string) => {
    console.log("[Toast Success]", msg);
  },
  error: (msg: string) => {
    console.warn("[Toast Error]", msg);
  },
  info: (msg: string) => {
    console.info("[Toast Info]", msg);
  },
};

export function triggerConfetti() {
  console.log("[Confetti Triggered]");
}

