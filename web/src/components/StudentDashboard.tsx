import { Calendar, Clock, ArrowRight, Check, Circle, Megaphone, ChevronRight, CircleDot } from "lucide-react";
import { useAuth } from "../lib/auth";
import { useProfileData } from "../hooks/useProfileData";

function Donut({ value }: { value: number }) {
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

interface Props { navigate: (r: string) => void; }

export default function StudentDashboard({ navigate }: Props) {
  const { user } = useAuth();
  const { profile } = useProfileData();
  const firstName = (user?.displayName ?? profile?.name ?? "Student").split(" ").slice(-1)[0];

  const basicDone = Boolean(profile?.name && profile?.major && profile?.experience_years !== undefined);
  const skillsDone = Boolean((profile?.skills?.length ?? 0) >= 3);
  const availDone = Boolean((profile?.availability?.length ?? 0) >= 5);
  const roleDone = Boolean(profile?.desired_role && profile.desired_role !== "other");
  const pairingDone = Boolean(roleDone);
  const allReady = basicDone && skillsDone && availDone && roleDone;

  const checklist = [
    { label: "Basic Info", route: "student/profile", state: basicDone ? "done" : "progress" },
    { label: "Skills", route: "student/skills", state: skillsDone ? "done" : basicDone ? "progress" : "todo" },
    { label: "Availability", route: "student/avail", state: availDone ? "done" : skillsDone ? "progress" : "todo" },
    { label: "Role Preferences", route: "student/prefs", state: roleDone ? "done" : availDone ? "progress" : "todo" },
    { label: "Pairing Preferences", route: "student/prefs", state: pairingDone ? "done" : roleDone ? "progress" : "todo" },
    { label: "Final Review", route: "student/review", state: allReady ? "progress" : "todo" },
  ] as const;

  const doneCount = checklist.filter(c => c.state === "done").length;
  const completion = Math.round((doneCount / checklist.length) * 100);
  const first = checklist.find(c => c.state !== "done");

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Hero card */}
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              SE1842 — Software Engineering Project
            </span>
            <span className="badge badge--yellow">Draft</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
            Welcome back, {firstName}!
          </h1>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--muted)" }}>
              <Calendar size={13} /> Semester: Fall 2026
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#B45309", fontWeight: 500 }}>
              <Clock size={13} /> Profile due: 14 Aug 2026 — 12 days remaining
            </span>
          </div>
          <button className="btn btn--primary" style={{ marginTop: 16 }}
            onClick={() => first && navigate(first.route)}>
            Continue Profile <ArrowRight size={14} />
          </button>
        </div>
        <Donut value={completion} />
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* Checklist */}
        <div className="card card--flush" style={{ gridColumn: "1 / 2" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-strong)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Your progress</h2>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Complete each step to submit your profile.</p>
          </div>
          <div style={{ padding: 8 }}>
            {checklist.map(item => (
              <button key={item.label} onClick={() => navigate(item.route)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "var(--r-sm)", border: "none", background: "transparent", cursor: "pointer", textAlign: "left" }}
                onMouseOver={e => (e.currentTarget.style.background = "var(--surface-2)")}
                onMouseOut={e => (e.currentTarget.style.background = "transparent")}>
                {item.state === "done" ? (
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--success-weak)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <Check size={11} style={{ color: "#059669" }} />
                  </span>
                ) : item.state === "progress" ? (
                  <CircleDot size={20} style={{ color: "var(--primary)", flexShrink: 0 }} />
                ) : (
                  <Circle size={20} style={{ color: "var(--border-strong)", flexShrink: 0 }} />
                )}
                <span style={{ fontSize: 13, flex: 1, color: item.state === "done" ? "var(--faint)" : "var(--text)", fontWeight: item.state === "done" ? 400 : 500, textDecoration: item.state === "done" ? "line-through" : "none" }}>
                  {item.label}
                </span>
                {item.state === "progress" && (
                  <span style={{ fontSize: 10, fontWeight: 600, color: "var(--primary)", background: "var(--primary-weak)", padding: "2px 8px", borderRadius: 99 }}>In progress</span>
                )}
                <ChevronRight size={14} style={{ color: "var(--faint)" }} />
              </button>
            ))}
          </div>
        </div>

        {/* Announcement */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: "var(--r-sm)", background: "var(--warn-weak)", display: "grid", placeItems: "center" }}>
              <Megaphone size={13} style={{ color: "var(--warn)" }} />
            </div>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Latest announcement</h2>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Complete your skills section by Friday</p>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8, lineHeight: 1.6 }}>
            Please complete your skills section by Friday. Pay attention to proficiency ratings — be honest, not aspirational.
          </p>
          <p style={{ fontSize: 11, color: "var(--faint)", marginTop: 12 }}>— PGS.TS. Trần Văn Khoa</p>
        </div>
      </div>
    </div>
  );
}
