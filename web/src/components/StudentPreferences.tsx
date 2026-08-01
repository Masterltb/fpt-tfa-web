import { useEffect, useMemo, useState } from "react";
import {
  Crown,
  Code2,
  Microscope,
  Palette,
  Presentation,
  LineChart,
  Bug,
  Search,
  Plus,
  X,
  Info,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { useProfileData } from "../hooks/useProfileData";
import { useCohortsData } from "../hooks/useCohortsData";
import { TEAM_ROLES, TeamRole } from "../types/ui";
import type { StudentIn } from "../types";
import { Avatar, toast } from "./ui";

const ROLE_META: Record<TeamRole, { icon: typeof Crown; desc: string }> = {
  Leader: { icon: Crown, desc: "Drive direction and manage deliverables" },
  Developer: { icon: Code2, desc: "Build and implement solutions" },
  Researcher: { icon: Microscope, desc: "Domain research and analysis" },
  Designer: { icon: Palette, desc: "Wireframes, prototypes, UX" },
  Presenter: { icon: Presentation, desc: "Pitches, reports, stakeholder comms" },
  Analyst: { icon: LineChart, desc: "Data, insights, visualisation" },
  "QA Engineer": { icon: Bug, desc: "Testing and quality assurance" },
};

interface Pair {
  id: string;
  name: string;
  major: string;
  year: number;
  reason: string;
}

export default function StudentPreferences({ navigate: _navigate }: { navigate?: (r: string) => void }) {
  const { user } = useAuth();
  const { profile, saveProfile } = useProfileData();
  const { cohorts, fetchEnrolledStudents, fetchCohortConstraints, proposeConstraint } = useCohortsData();

  const activeCohortId = cohorts[0]?.id || "cohort-1";
  const [enrolledStudents, setEnrolledStudents] = useState<StudentIn[]>([]);

  useEffect(() => {
    if (activeCohortId) {
      fetchEnrolledStudents(activeCohortId).then(setEnrolledStudents);
    }
  }, [activeCohortId, fetchEnrolledStudents]);

  const [primary, setPrimary] = useState<TeamRole>("Developer");
  const [openTo, setOpenTo] = useState<Set<TeamRole>>(new Set(["Developer", "Leader"]));
  const [avoid, setAvoid] = useState<Set<TeamRole>>(new Set(["Presenter"]));
  const [query, setQuery] = useState("");
  const [mustPair, setMustPair] = useState<Pair[]>([]);
  const [cannotPair, setCannotPair] = useState<Pair[]>([]);

  useEffect(() => {
    if (profile && profile.desired_role) {
      setPrimary((profile.desired_role as TeamRole) || "Developer");
    }
  }, [profile]);

  useEffect(() => {
    if (activeCohortId) {
      fetchCohortConstraints(activeCohortId).then((constraints) => {
        const must: Pair[] = [];
        const cannot: Pair[] = [];
        constraints.forEach((c) => {
          const s = enrolledStudents.find((st) => st.id === c.student_b) || {
            name: c.student_b,
            major: "Software Engineering",
            year: 3,
          };
          const pair: Pair = {
            id: c.student_b,
            name: s.name,
            major: (s as any).major || "Software Engineering",
            year: (s as any).year || 3,
            reason: "",
          };
          if (c.type === "must_pair") must.push(pair);
          else if (c.type === "cannot_pair") cannot.push(pair);
        });
        setMustPair(must);
        setCannotPair(cannot);
      });
    }
  }, [activeCohortId, fetchCohortConstraints, enrolledStudents]);

  const taken = new Set([user?.uid || profile?.id || "s-1", ...mustPair.map((p) => p.id), ...cannotPair.map((p) => p.id)]);
  const results = useMemo(
    () =>
      query
        ? enrolledStudents.filter(
            (s) => !taken.has(s.id) && s.name.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 6)
        : [],
    [query, enrolledStudents, taken]
  );

  const handleRoleSelect = async (role: TeamRole) => {
    setPrimary(role);
    await saveProfile({ desired_role: role });
    toast.success(`Primary role updated to ${role}`);
  };

  const addTo = async (list: "must" | "cannot", sId: string) => {
    const s = enrolledStudents.find((st) => st.id === sId) || { id: sId, name: "Classmate", major: "Software Engineering", year: 3 };
    const p: Pair = { id: sId, name: s.name, major: (s as any).major || "Software Engineering", year: (s as any).year || 3, reason: "" };
    if (list === "must") setMustPair((x) => [...x, p]);
    else setCannotPair((x) => [...x, p]);
    setQuery("");
    await proposeConstraint(activeCohortId, list === "must" ? "must_pair" : "cannot_pair", sId);
    toast.success("Pairing request submitted.");
  };

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: 0 }}>Preferences</h1>
        <p style={{ fontSize: 13, color: "var(--faint)", margin: "4px 0 0 0" }}>Role and pairing signals for the optimizer.</p>
      </div>

      {/* Primary role */}
      <div className="card" style={{ padding: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 12px 0" }}>Primary role</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {TEAM_ROLES.map((role) => {
            const Icon = (ROLE_META as Record<TeamRole, { icon: typeof Crown; desc: string }>)[role].icon;
            const sel = primary === role;
            return (
              <button
                key={role}
                onClick={() => handleRoleSelect(role)}
                style={{
                  textAlign: "left",
                  padding: 14,
                  borderRadius: 8,
                  border: sel ? "2px solid var(--primary)" : "1px solid var(--border)",
                  backgroundColor: sel ? "var(--surface-2)" : "var(--surface-1)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <Icon size={18} style={{ color: sel ? "var(--primary)" : "var(--faint)" }} />
                <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: sel ? "var(--primary)" : "var(--text)" }}>{role}</p>
                <p style={{ fontSize: 11, color: "var(--faint)", margin: 0, lineHeight: 1.3 }}>{(ROLE_META as Record<TeamRole, { icon: typeof Crown; desc: string }>)[role].desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Open to / avoid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 12px 0" }}>Roles I'm open to</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {TEAM_ROLES.filter((r) => r !== primary).map((r) => (
              <label key={r} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text)", cursor: "pointer", padding: "6px 8px", borderRadius: 6 }}>
                <input
                  type="checkbox"
                  checked={openTo.has(r)}
                  onChange={() =>
                    setOpenTo((s) => {
                      const n = new Set(s);
                      n.has(r) ? n.delete(r) : n.add(r);
                      return n;
                    })
                  }
                  style={{ width: 16, height: 16, accentColor: "var(--primary)" }}
                />
                {r}
              </label>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 12px 0" }}>Roles I'd prefer to avoid</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {TEAM_ROLES.filter((r) => r !== primary).map((r) => (
              <label key={r} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text)", cursor: "pointer", padding: "6px 8px", borderRadius: 6 }}>
                <input
                  type="checkbox"
                  checked={avoid.has(r)}
                  onChange={() =>
                    setAvoid((s) => {
                      const n = new Set(s);
                      n.has(r) ? n.delete(r) : n.add(r);
                      return n;
                    })
                  }
                  style={{ width: 16, height: 16, accentColor: "var(--danger)" }}
                />
                {r}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Pairing constraints */}
      <div className="card" style={{ padding: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>Pairing Constraints</h2>
        <p style={{ fontSize: 12, color: "var(--faint)", margin: "4px 0 16px 0" }}>Request to be paired with, or separated from, classmates.</p>

        <div style={{ position: "relative", marginBottom: 20 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--faint)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search classmates by name…"
            style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px 10px 34px", fontSize: 13, backgroundColor: "var(--surface-1)", color: "var(--text)", outline: "none" }}
          />
          {results.length > 0 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, backgroundColor: "#FFFFFF", border: "1px solid var(--border)", borderRadius: 8, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", zIndex: 20, overflow: "hidden" }}>
              {results.map((s) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={s.name} size="sm" />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", margin: 0 }}>{s.name}</p>
                      <p style={{ fontSize: 11, color: "var(--faint)", margin: 0 }}>{s.major} · Year {s.year}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => addTo("must", s.id)}
                      style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, padding: "4px 8px", borderRadius: 6, backgroundColor: "#ECFDF5", color: "#047857", border: "1px solid #A7F3D0", cursor: "pointer", fontWeight: 500 }}
                    >
                      <Plus size={11} /> Must
                    </button>
                    <button
                      onClick={() => addTo("cannot", s.id)}
                      style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, padding: "4px 8px", borderRadius: 6, backgroundColor: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECDD3", cursor: "pointer", fontWeight: 500 }}
                    >
                      <Plus size={11} /> Cannot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {/* Must pair */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <CheckCircle2 size={14} style={{ color: "var(--success)" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--success)" }}>Must Pair ({mustPair.length})</span>
            </div>
            <p style={{ fontSize: 11, color: "var(--faint)", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
              <Info size={11} /> Requires lecturer approval
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {mustPair.map((p) => (
                <div key={p.id} style={{ borderRadius: 8, border: "1px solid #A7F3D0", backgroundColor: "#ECFDF5", padding: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar name={p.name} size="sm" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#065F46", margin: 0 }}>{p.name}</p>
                      <p style={{ fontSize: 11, color: "#047857", margin: 0 }}>{p.major}</p>
                    </div>
                    <button onClick={() => setMustPair((x) => x.filter((q) => q.id !== p.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "#059669" }}>
                      <X size={14} />
                    </button>
                  </div>
                  <textarea
                    value={p.reason}
                    onChange={(e) =>
                      setMustPair((x) => x.map((q) => (q.id === p.id ? { ...q, reason: e.target.value } : q)))
                    }
                    placeholder="Add reason (optional)…"
                    rows={1}
                    style={{ width: "100%", marginTop: 8, border: "1px solid #A7F3D0", borderRadius: 6, padding: "4px 8px", fontSize: 12, backgroundColor: "#FFFFFF", resize: "none", outline: "none" }}
                  />
                </div>
              ))}
              {mustPair.length === 0 && (
                <p style={{ fontSize: 12, color: "var(--faint)", border: "1px dashed var(--border)", borderRadius: 8, padding: 16, textAlign: "center", margin: 0 }}>
                  Search and add peers above
                </p>
              )}
            </div>
          </div>

          {/* Cannot pair */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <AlertCircle size={14} style={{ color: "var(--danger)" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--danger)" }}>Cannot Pair ({cannotPair.length})</span>
            </div>
            <p style={{ fontSize: 11, color: "var(--faint)", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
              <Lock size={11} /> This information is private
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cannotPair.map((p) => (
                <div key={p.id} style={{ borderRadius: 8, border: "1px solid #FECDD3", backgroundColor: "#FEF2F2", padding: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar name={p.name} size="sm" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#991B1B", margin: 0 }}>{p.name}</p>
                      <p style={{ fontSize: 11, color: "#B91C1C", margin: 0 }}>{p.major}</p>
                    </div>
                    <button onClick={() => setCannotPair((x) => x.filter((q) => q.id !== p.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626" }}>
                      <X size={14} />
                    </button>
                  </div>
                  <textarea
                    value={p.reason}
                    onChange={(e) =>
                      setCannotPair((x) => x.map((q) => (q.id === p.id ? { ...q, reason: e.target.value } : q)))
                    }
                    placeholder="Add private reason (required)…"
                    rows={1}
                    style={{ width: "100%", marginTop: 8, border: "1px solid #FECDD3", borderRadius: 6, padding: "4px 8px", fontSize: 12, backgroundColor: "#FFFFFF", resize: "none", outline: "none" }}
                  />
                </div>
              ))}
              {cannotPair.length === 0 && (
                <p style={{ fontSize: 12, color: "var(--faint)", border: "1px dashed var(--border)", borderRadius: 8, padding: 16, textAlign: "center", margin: 0 }}>
                  Search and add peers above
                </p>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "var(--faint)" }}>
          <Info size={14} style={{ marginTop: 2, flexShrink: 0 }} />
          <p style={{ margin: 0 }}>Preferences are not guaranteed. Final team assignment is controlled by your lecturer.</p>
        </div>
      </div>
    </div>
  );
}
