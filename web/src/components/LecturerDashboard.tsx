import { ArrowRight, Activity, CalendarClock } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { listCohorts } from "../api";
import { useState, useEffect } from "react";
import type { Cohort } from "../types";

interface Props { navigate: (r: string) => void; }

const ACTIONS = [
  { text: "Review 3 pending Cannot-Pair requests in SE1842", cta: "Review", route: "lecturer/cohorts/SE1842/constraints", tone: "amber" },
  { text: "Remind 8 students with incomplete profiles in SE1842", cta: "Send reminder", route: "lecturer/cohorts/SE1842/students", tone: "indigo" },
  { text: "Run formation for SE1842 — profiles complete", cta: "Open formation", route: "lecturer/cohorts/SE1842/formation", tone: "green" },
];
const DEADLINES = [
  { label: "SE1842 — Profile deadline", date: "14 Aug 2026", days: 12 },
  { label: "SE1842 — Formation published", date: "20 Aug 2026", days: 18 },
];
const ACTIVITY = [
  { id: "a1", text: "Phạm Thị Hoa submitted their profile", time: "12 min ago" },
  { id: "a2", text: "Nguyễn Minh Tú added a Must-Pair request", time: "38 min ago" },
  { id: "a3", text: "Lê Văn Hùng updated their skills (4 → 6)", time: "1 hr ago" },
  { id: "a4", text: "Hoàng Minh Khoa submitted a Cannot-Pair request", time: "2 hrs ago" },
];

function StatCard({ label, value, sub, color = "indigo" }: { label: string; value: number; sub?: string; color?: string }) {
  const colors: Record<string, string> = { indigo: "var(--primary)", emerald: "var(--success)", amber: "var(--warn)", red: "var(--danger)" };
  return (
    <div className="stat-card">
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value" style={{ color: colors[color] ?? colors.indigo }}>{value}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </div>
  );
}

function ProgressBar({ value, color = "indigo" }: { value: number; color?: string }) {
  const fill = color === "emerald" ? "var(--success)" : "var(--primary)";
  return (
    <div style={{ height: 6, background: "var(--surface-2)", borderRadius: 99, overflow: "hidden", flex: 1 }}>
      <div style={{ height: "100%", width: `${value}%`, background: fill, borderRadius: 99 }} />
    </div>
  );
}

const STATUS_BADGE: Record<string, string> = {
  draft: "badge--gray", collecting: "badge--indigo", ready: "badge--green",
  optimizing: "badge--yellow", review: "badge--yellow", finalized: "badge--green", archived: "badge--gray",
};

export default function LecturerDashboard({ navigate }: Props) {
  const { user, token } = useAuth();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);

  useEffect(() => {
    if (token) {
      listCohorts({ token }).then(data => setCohorts(data)).catch(() => {});
    }
  }, [token]);

  const name = user?.displayName ?? "Lecturer";

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="page-header">
        <h1>Good morning, {name}</h1>
        <p>Friday, 17 July 2026</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        <StatCard label="Active Cohorts"       value={cohorts.length || 2} color="indigo" sub="1 in review" />
        <StatCard label="Total Students"       value={84}   color="emerald" sub="+5 this week" />
        <StatCard label="Pending Constraints"  value={5}    color="amber"   sub="3 cannot-pair" />
        <StatCard label="Awaiting Review"      value={1}    color="red"     sub="SE1842 formation" />
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: "2fr 1fr", alignItems: "start" }}>
        {/* Action required */}
        <div className="card card--flush">
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-strong)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>Action required</h2>
          </div>
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {ACTIONS.map(a => {
              const colors: Record<string, string> = { amber: "#F59E0B", indigo: "var(--primary)", green: "var(--success)", red: "var(--danger)" };
              return (
                <div key={a.text} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: "var(--r-sm)", border: "1px solid var(--border-strong)" }}>
                  <span style={{ width: 4, height: 32, borderRadius: 99, background: colors[a.tone], flexShrink: 0 }} />
                  <p style={{ flex: 1, fontSize: 13, color: "var(--text)" }}>{a.text}</p>
                  <button className="btn btn--secondary btn--sm" onClick={() => navigate(a.route)}>
                    {a.cta} <ArrowRight size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deadlines */}
        <div className="card card--flush">
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-strong)", display: "flex", alignItems: "center", gap: 8 }}>
            <CalendarClock size={14} style={{ color: "var(--primary)" }} />
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>Upcoming deadlines</h2>
          </div>
          <div style={{ padding: 12 }}>
            {DEADLINES.map(d => (
              <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", borderRadius: "var(--r-sm)" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text)" }}>{d.label}</p>
                  <p style={{ fontSize: 11, color: "var(--faint)" }}>{d.date}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: d.days <= 14 ? "var(--warn-weak)" : "var(--surface-2)", color: d.days <= 14 ? "#92400E" : "var(--muted)" }}>
                  {d.days}d
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cohort readiness */}
      <div className="card card--flush">
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-strong)" }}>
          <h2 style={{ fontSize: 14, fontWeight: 600 }}>Cohort readiness</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Cohort</th><th>Status</th><th>Students</th>
              <th>Profile completion</th><th>Constraint readiness</th><th></th>
            </tr>
          </thead>
          <tbody>
            {(cohorts.length > 0 ? cohorts : [
              { id: "SE1842", code: "SE1842", name: "Software Engineering Project", status: "review", studentCount: 42, profileCompletion: 78, constraintReadiness: 91 },
              { id: "AI2201", code: "AI2201", name: "Applied Machine Learning",     status: "collecting", studentCount: 38, profileCompletion: 54, constraintReadiness: 40 },
            ] as any[]).map((c: any) => (
              <tr key={c.id}>
                <td>
                  <p style={{ fontWeight: 600 }}>{c.code}</p>
                  <p style={{ fontSize: 11, color: "var(--muted)" }}>{c.name}</p>
                </td>
                <td><span className={`badge ${STATUS_BADGE[c.status] ?? "badge--gray"}`}>{c.status}</span></td>
                <td style={{ color: "var(--muted)" }}>{c.studentCount}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ProgressBar value={c.profileCompletion ?? 0} />
                    <span style={{ fontSize: 11, width: 32, color: "var(--muted)" }}>{c.profileCompletion ?? 0}%</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ProgressBar value={c.constraintReadiness ?? 0} color="emerald" />
                    <span style={{ fontSize: 11, width: 32, color: "var(--muted)" }}>{c.constraintReadiness ?? 0}%</span>
                  </div>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btn--secondary btn--sm" onClick={() => navigate(`lecturer/cohorts/${c.id}/students`)}>
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Activity */}
      <div className="card card--flush">
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-strong)", display: "flex", alignItems: "center", gap: 8 }}>
          <Activity size={14} style={{ color: "var(--primary)" }} />
          <h2 style={{ fontSize: 14, fontWeight: 600 }}>Recent activity</h2>
        </div>
        <div style={{ padding: 12 }}>
          {ACTIVITY.map(a => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", fontSize: 13 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--faint)", flexShrink: 0 }} />
              <p style={{ flex: 1, color: "var(--text)" }}>{a.text}</p>
              <span style={{ fontSize: 11, color: "var(--faint)" }}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
