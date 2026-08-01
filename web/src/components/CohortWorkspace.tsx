import React, { useMemo, useState, useEffect } from "react";
import {
  Search,
  Plus,
  Upload,
  Download,
  X,
  Check,
  AlertTriangle,
  Sparkles,
  Send,
  Boxes,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCohortsData } from "../hooks/useCohortsData";
import { CohortStatus, TeamRole, TEAM_ROLES, ProfileStatus, ConstraintStatus } from "../types/ui";
import {
  MetricCard,
  StatusBadge,
  ProgressBar,
  Badge,
  Avatar,
  SkillChip,
  RoleBadge,
  Button,
  EmptyState,
  toast,
} from "./ui";

const TABS = ["Overview", "Students", "Requirements", "Constraints", "Formation", "Results", "Analytics"];
const CHART_COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#EC4899"];

export default function CohortWorkspace({
  cohortId = "SE1842",
  route = "",
  navigate,
}: {
  cohortId?: string;
  route?: string;
  navigate?: (r: string) => void;
}) {
  const { cohorts } = useCohortsData();
  const apiCohort = cohorts.find((c) => c.id === cohortId || c.name.includes(cohortId));
  const cohort = apiCohort
    ? {
        id: apiCohort.id,
        code: apiCohort.name.includes(" - ") ? apiCohort.name.split(" - ")[0] : "SE1842",
        name: apiCohort.name.includes(" - ") ? apiCohort.name.split(" - ").slice(1).join(" - ") : apiCohort.name,
        semester: "Fall 2026",
        status: "collecting" as CohortStatus,
        studentCount: 45,
        minTeamSize: 4,
        maxTeamSize: 5,
        profileCompletion: 78,
      }
    : {
        id: cohortId,
        code: "SE1842",
        name: "Software Engineering Project",
        semester: "Fall 2026",
        status: "collecting" as CohortStatus,
        studentCount: 45,
        minTeamSize: 4,
        maxTeamSize: 5,
        profileCompletion: 78,
      };

  const [localTab, setLocalTab] = useState<string | null>(null);

  const derivedTab = useMemo(() => {
    if (localTab && TABS.includes(localTab)) return localTab;
    if (route.includes("/students")) return "Students";
    if (route.includes("/requirements")) return "Requirements";
    if (route.includes("/constraints")) return "Constraints";
    if (route.includes("/formation")) return "Formation";
    if (route.includes("/results")) return "Results";
    if (route.includes("/analytics")) return "Analytics";
    if (route.includes("/overview")) return "Overview";
    return "Overview";
  }, [route, localTab]);

  const handleTabClick = (t: string) => {
    setLocalTab(t);
    navigate?.(`lecturer/cohorts/${cohort.id}/${t.toLowerCase()}`);
  };

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Cohort header */}
      <div className="card" style={{ padding: "20px 24px 0 24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: 0 }}>
            {cohort.code} — {cohort.name}
          </h1>
          <StatusBadge status={cohort.status} />
          <span style={{ fontSize: 13, color: "var(--faint)" }}>·</span>
          <span style={{ fontSize: 13, color: "var(--text)" }}>{cohort.studentCount} students</span>
          <span style={{ fontSize: 13, color: "var(--faint)" }}>·</span>
          <span style={{ fontSize: 13, color: "var(--text)" }}>
            Team size {cohort.minTeamSize}–{cohort.maxTeamSize} members
          </span>
          <Badge variant="neutral">{cohort.semester}</Badge>
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginTop: 16, overflowX: "auto", borderBottom: "1px solid var(--border)" }}>
          {TABS.map((t) => {
            const active = derivedTab === t;
            return (
              <button
                key={t}
                onClick={() => handleTabClick(t)}
                style={{
                  padding: "10px 16px",
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  borderBottom: active ? "2px solid var(--primary)" : "2px solid transparent",
                  color: active ? "var(--primary)" : "var(--faint)",
                  background: "none",
                  borderTop: "none",
                  borderLeft: "none",
                  borderRight: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: 0 }}>
        {derivedTab === "Overview" && <OverviewTab cohortId={cohort.id} navigate={navigate} />}
        {derivedTab === "Students" && <StudentsTab cohortId={cohort.id} />}
        {derivedTab === "Requirements" && <RequirementsTab cohortId={cohort.id} />}
        {derivedTab === "Constraints" && <ConstraintsTab cohortId={cohort.id} />}
        {derivedTab === "Formation" && <FormationTab cohortId={cohort.id} navigate={navigate} />}
        {derivedTab === "Results" && <ResultsTab cohortId={cohort.id} navigate={navigate} />}
        {derivedTab === "Analytics" && <AnalyticsTab cohortId={cohort.id} />}
      </div>
    </div>
  );
}

// ─── Overview ────────────────────────────────────────────────────────────────

function OverviewTab({ cohortId, navigate }: { cohortId: string; navigate?: (r: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <MetricCard label="Profile Completion" value="78%" color="indigo" trend={6} />
        <MetricCard label="Constraint Readiness" value="91%" color="emerald" />
        <MetricCard label="Skill Coverage" value="84%" color="amber" />
        <MetricCard label="Formation Status" value="Review" sub="Required" color="red" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 16px 0" }}>Cohort readiness</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { label: "Profiles submitted", value: 78 },
              { label: "Constraints resolved", value: 91 },
              { label: "Skill coverage", value: 84 },
              { label: "Availability data", value: 88 },
            ].map((r) => (
              <div key={r.label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: "var(--text)" }}>{r.label}</span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{r.value}%</span>
                </div>
                <ProgressBar value={r.value} color={r.value >= 85 ? "emerald" : "indigo"} />
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 16px 0" }}>Quick actions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Button style={{ width: "100%" }} onClick={() => navigate?.(`lecturer/cohorts/${cohortId}/formation`)}>
              <Boxes size={15} /> Configure Formation
            </Button>
            <Button variant="secondary" style={{ width: "100%" }} onClick={() => toast.success("Reminder sent to 8 students.")}>
              <Send size={15} /> Send Reminder
            </Button>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 12px 0" }}>Recent changes</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            "3 new profiles submitted in the last 24 hours",
            "1 new Cannot-Pair request awaiting review",
            "Formation re-run with Balanced preset (score 87)",
          ].map((c) => (
            <div key={c} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--primary)" }} />
              <span>{c}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Students ────────────────────────────────────────────────────────────────

function StudentsTab({ cohortId }: { cohortId?: string }) {
  const { fetchEnrolledStudents } = useCohortsData();
  const [studentsList, setStudentsList] = React.useState<any[]>([]);
  const [q, setQ] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<TeamRole | "all">("all");
  const [statusFilter, setStatusFilter] = React.useState<ProfileStatus | "all">("all");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [drawer, setDrawer] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const perPage = 10;

  React.useEffect(() => {
    if (cohortId) {
      fetchEnrolledStudents(cohortId).then((data) => {
        const mapped = (data || []).map((s, idx) => ({
          id: s.id,
          studentId: s.id.startsWith("SE") ? s.id : `SE1842${(idx + 1).toString().padStart(2, "0")}`,
          name: s.name,
          email: s.email || `${s.name.toLowerCase().replace(/\s+/g, "")}@fpt.edu.vn`,
          major: s.major || "Software Engineering",
          year: s.year || 3,
          primaryRole: (s.desired_role as TeamRole) || "Developer",
          skills: (s.skills || []).map((sk, i) => ({
            skillId: `sk-${s.id}-${i}`,
            name: sk.name,
            category: "Frontend" as any,
            proficiency: sk.proficiency || 3,
          })),
          availability: s.availability || ["Mon-Morning", "Tue-Afternoon"],
          profileStatus: (s.skills && s.skills.length >= 3 ? "submitted" : "draft") as ProfileStatus,
          mustPair: [] as string[],
          cannotPair: [] as string[],
          experienceYears: s.experience_years || 1,
        }));
        setStudentsList(mapped);
      });
    }
  }, [cohortId, fetchEnrolledStudents]);

  const filtered = studentsList.filter(
    (s) =>
      (q === "" || s.name.toLowerCase().includes(q.toLowerCase()) || s.studentId.toLowerCase().includes(q.toLowerCase())) &&
      (roleFilter === "all" || s.primaryRole === roleFilter) &&
      (statusFilter === "all" || s.profileStatus === statusFilter)
  );
  const pages = Math.ceil(filtered.length / perPage);
  const pageData = filtered.slice(page * perPage, page * perPage + perPage);

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const drawerStudent = drawer ? studentsList.find((s) => s.id === drawer || s.studentId === drawer) || null : null;
  const selectStyle: React.CSSProperties = {
    appearance: "none",
    border: "1px solid var(--border)",
    backgroundColor: "var(--surface-1)",
    borderRadius: 8,
    padding: "6px 28px 6px 12px",
    fontSize: 13,
    color: "var(--text)",
    outline: "none",
    cursor: "pointer",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Toolbar */}
      <div className="card" style={{ padding: 16, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
        <div style={{ position: "relative", flex: "1 1 200px" }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--faint)" }} />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder="Search students…"
            style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 12px 6px 34px", fontSize: 13, backgroundColor: "var(--surface-1)", color: "var(--text)", outline: "none" }}
          />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as TeamRole | "all")} style={selectStyle}>
          <option value="all">All roles</option>
          {TEAM_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ProfileStatus | "all")} style={selectStyle}>
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="locked">Locked</option>
        </select>
        <Button variant="secondary" size="sm" onClick={() => toast.success("CSV imported (demo).")}>
          <Upload size={13} /> Import
        </Button>
        <Button variant="secondary" size="sm" onClick={() => toast.success("Exported roster.")}>
          <Download size={13} /> Export
        </Button>
      </div>

      {/* Bulk toolbar */}
      {selected.size > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, backgroundColor: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 8, padding: "10px 16px" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#3730A3" }}>{selected.size} selected</span>
          <Button size="sm" onClick={() => toast.success(`Reminder sent to ${selected.size} students.`)}>
            <Send size={13} /> Send Reminder
          </Button>
          <Button variant="secondary" size="sm" onClick={() => toast.success("Exported selected.")}>
            <Download size={13} /> Export Selected
          </Button>
          <button onClick={() => setSelected(new Set())} style={{ marginLeft: "auto", fontSize: 12, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", fontSize: 12, color: "var(--faint)", borderBottom: "1px solid var(--border)", backgroundColor: "var(--surface-2)" }}>
                <th style={{ padding: "12px 16px", width: 36 }} />
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Student</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>ID</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Major</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Top Skills</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Role</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, width: 140 }}>Availability</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Status</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Constraints</th>
                <th style={{ padding: "12px 16px" }} />
              </tr>
            </thead>
            <tbody>
              {pageData.map((s) => {
                const avail = Math.round(((s.availability || []).length / 21) * 100);
                return (
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <input
                        type="checkbox"
                        checked={selected.has(s.id)}
                        onChange={() => toggle(s.id)}
                        style={{ width: 16, height: 16, accentColor: "var(--primary)" }}
                      />
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={s.name} size="sm" />
                        <div>
                          <p style={{ fontWeight: 600, color: "var(--text)", margin: 0 }}>{s.name}</p>
                          <p style={{ fontSize: 11, color: "var(--faint)", margin: 0 }}>{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--faint)" }}>{s.studentId}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text)" }}>{s.major}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {(s.skills || []).slice(0, 2).map((sk: any) => (
                          <SkillChip key={sk.skillId} name={sk.name} category={sk.category} />
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {s.primaryRole && <RoleBadge role={s.primaryRole} />}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ProgressBar value={avail} />
                        <span style={{ fontSize: 11, color: "var(--faint)", width: 32 }}>{avail}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <StatusBadge status={s.profileStatus} />
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--faint)" }}>
                      M:{(s.mustPair || []).length} C:{(s.cannotPair || []).length}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button onClick={() => setDrawer(s.id)} style={{ fontSize: 12, fontWeight: 500, color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}>
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "var(--faint)" }}>
        <span>
          Showing {page * perPage + 1}–{Math.min((page + 1) * perPage, filtered.length)} of {filtered.length}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "none", cursor: page === 0 ? "not-allowed" : "pointer", opacity: page === 0 ? 0.4 : 1 }}
          >
            <ChevronLeft size={14} />
          </button>
          <span style={{ padding: "0 8px", color: "var(--text)" }}>
            {page + 1} / {pages || 1}
          </span>
          <button
            disabled={page >= pages - 1}
            onClick={() => setPage((p) => p + 1)}
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "none", cursor: page >= pages - 1 ? "not-allowed" : "pointer", opacity: page >= pages - 1 ? 0.4 : 1 }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Drawer */}
      {drawerStudent && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "flex-end" }} onClick={() => setDrawer(null)}>
          <div className="card" style={{ width: "100%", maxWidth: 420, height: "100%", borderRadius: 0, padding: 24, overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", margin: 0 }}>Student profile</h3>
              <button onClick={() => setDrawer(null)} style={{ color: "var(--faint)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar name={drawerStudent.name} size="lg" />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>{drawerStudent.name}</p>
                  <p style={{ fontSize: 12, color: "var(--faint)", margin: "2px 0 0 0" }}>
                    {drawerStudent.studentId} · {drawerStudent.major}
                  </p>
                  <div style={{ marginTop: 6 }}>
                    <StatusBadge status={drawerStudent.profileStatus} />
                  </div>
                </div>
              </div>
              {drawerStudent.bio && <p style={{ fontSize: 13, color: "var(--text)" }}>{drawerStudent.bio}</p>}
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Skills</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {(drawerStudent.skills || []).map((sk: any) => (
                    <div key={sk.skillId} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "var(--text)", width: 140, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sk.name}</span>
                      <ProgressBar value={sk.proficiency} max={5} />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Role</p>
                {drawerStudent.primaryRole && <RoleBadge role={drawerStudent.primaryRole} />}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Constraints</p>
                <p style={{ fontSize: 12, color: "var(--faint)", margin: 0 }}>
                  Must-pair: {(drawerStudent.mustPair || []).map((id: string) => studentsList.find((s) => s.id === id || s.studentId === id)?.name || id).join(", ") || "None"}
                </p>
                <p style={{ fontSize: 12, color: "var(--faint)", margin: "4px 0 0 0" }}>
                  Cannot-pair: {(drawerStudent.cannotPair || []).map((id: string) => studentsList.find((s) => s.id === id || s.studentId === id)?.name || id).join(", ") || "None"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Requirements ────────────────────────────────────────────────────────────

function RequirementsTab({ cohortId }: { cohortId?: string }) {
  const [showAdd, setShowAdd] = useState(false);
  const [requirementsList, setRequirementsList] = useState([
    { id: "r1", label: "At least 1 Developer per team", type: "Role", importance: "Hard", minPerTeam: 1, coverage: 9, totalTeams: 9, feasible: true, feasibilityNote: "Feasible" },
    { id: "r2", label: "At least 1 QA / Tester per team", type: "Role", importance: "Strong", minPerTeam: 1, coverage: 8, totalTeams: 9, feasible: true, feasibilityNote: "Feasible" },
    { id: "r3", label: "Min 2 React/Frontend skills", type: "Skill", importance: "Strong", minPerTeam: 2, coverage: 9, totalTeams: 9, feasible: true, feasibilityNote: "Feasible" },
    { id: "r4", label: "Max 1 AI/ML specialist per team", type: "Skill", importance: "Preference", minPerTeam: 1, coverage: 9, totalTeams: 9, feasible: true, feasibilityNote: "Feasible" },
    { id: "r5", label: "At least 3 overlapping availability slots", type: "Availability", importance: "Hard", minPerTeam: 3, coverage: 7, totalTeams: 9, feasible: false, feasibilityNote: "2 teams have only 2 overlapping availability slots." },
  ]);

  useEffect(() => {
    if (cohortId && requirementsList.length === 0) {
      setRequirementsList([]);
    }
  }, [cohortId, requirementsList]);
  const infeasible = requirementsList.filter((r) => !r.feasible);

  const impBadge = (imp: string) =>
    imp === "Hard" ? "danger" : imp === "Strong" ? "warning" : "neutral";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>Project requirements</h2>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Add Requirement
        </Button>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: "left", fontSize: 12, color: "var(--faint)", borderBottom: "1px solid var(--border)", backgroundColor: "var(--surface-2)" }}>
              <th style={{ padding: "12px 16px", fontWeight: 600 }}>Requirement</th>
              <th style={{ padding: "12px 16px", fontWeight: 600 }}>Type</th>
              <th style={{ padding: "12px 16px", fontWeight: 600 }}>Importance</th>
              <th style={{ padding: "12px 16px", fontWeight: 600 }}>Min / Team</th>
              <th style={{ padding: "12px 16px", fontWeight: 600 }}>Coverage</th>
              <th style={{ padding: "12px 16px", fontWeight: 600 }}>Feasibility</th>
            </tr>
          </thead>
          <tbody>
            {requirementsList.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "14px 16px", fontWeight: 600, color: "var(--text)" }}>{r.label}</td>
                <td style={{ padding: "14px 16px", color: "var(--text)", textTransform: "capitalize" }}>{r.type}</td>
                <td style={{ padding: "14px 16px" }}>
                  <Badge variant={impBadge(r.importance) as "danger" | "warning" | "neutral"}>{r.importance}</Badge>
                </td>
                <td style={{ padding: "14px 16px", color: "var(--text)" }}>{r.minPerTeam}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: r.coverage === r.totalTeams ? "var(--success)" : r.coverage < r.totalTeams / 2 ? "var(--danger)" : "var(--warn)" }}>
                    {r.coverage}/{r.totalTeams} teams
                  </span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  {r.feasible ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--success)" }}>
                      <Check size={13} /> Feasible
                    </span>
                  ) : (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--danger)" }} title={r.feasibilityNote}>
                      <AlertTriangle size={13} /> At risk
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Scarcity analysis */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 12px 0" }}>Live scarcity analysis</h3>
        {infeasible.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--success)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
            <Check size={14} /> All requirements are feasible with the current student pool.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {infeasible.map((r) => (
              <div key={r.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 12, borderRadius: 8, backgroundColor: "#FEF2F2", border: "1px solid #FECDD3", fontSize: 13, color: "#991B1B" }}>
                <AlertTriangle size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                <p style={{ margin: 0 }}>{r.feasibilityNote}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <Modal title="Add requirement" onClose={() => setShowAdd(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--faint)", marginBottom: 6 }}>Skill or role</label>
              <input placeholder="Search…" style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 13, backgroundColor: "var(--surface-1)", color: "var(--text)", outline: "none" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--faint)", marginBottom: 6 }}>Importance</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["Hard", "Strong", "Soft"].map((i) => (
                  <button key={i} style={{ flex: 1, padding: "8px 12px", fontSize: 12, fontWeight: 500, borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--surface-1)", cursor: "pointer", color: "var(--text)" }}>
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--faint)", marginBottom: 6 }}>Minimum per team</label>
              <input type="number" defaultValue={1} style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 13, backgroundColor: "var(--surface-1)", color: "var(--text)", outline: "none" }} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAdd(false)}>Add</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Constraints ─────────────────────────────────────────────────────────────

function ConstraintsTab({ cohortId }: { cohortId?: string }) {
  const { fetchCohortConstraints, reviewConstraint, fetchEnrolledStudents } = useCohortsData();
  const [sub, setSub] = useState<"Must-Pair" | "Cannot-Pair" | "Pending" | "Conflicts">("Must-Pair");
  const [constraintsList, setConstraintsList] = useState<any[]>([]);
  const [studentsMap, setStudentsMap] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (cohortId) {
      fetchCohortConstraints(cohortId).then((data) => {
        setConstraintsList(data || []);
      });
      fetchEnrolledStudents(cohortId).then((data) => {
        const map: Record<string, string> = {};
        (data || []).forEach((s) => { map[s.id] = s.name; });
        setStudentsMap(map);
      });
    }
  }, [cohortId, fetchCohortConstraints, fetchEnrolledStudents]);

  const handleReview = async (id: string, s: ConstraintStatus) => {
    if (cohortId) {
      await reviewConstraint(cohortId, id, s);
    }
    setConstraintsList((prev) => prev.map((c) => (c.id === id ? { ...c, status: s } : c)));
    toast.success(`Constraint ${s}.`);
  };

  const mustPairs = constraintsList.filter((c) => c.type === "must-pair");
  const cannotPairs = constraintsList.filter((c) => c.type === "cannot-pair");
  const pending = constraintsList.filter((c) => c.status === "pending");
  const conflicts = [
    "Nguyễn Minh Tú and Lê Văn Hùng appear in both Must-Pair and Cannot-Pair.",
    "Must-Pair group of 6 exceeds maximum team size of 5.",
  ];

  const statusBadge = (s: ConstraintStatus) =>
    s === "approved" ? "success" : s === "rejected" ? "danger" : s === "conflict" ? "danger" : "warning";

  const subTabs = [
    { key: "Must-Pair", count: mustPairs.length },
    { key: "Cannot-Pair", count: cannotPairs.length },
    { key: "Pending", count: pending.length },
    { key: "Conflicts", count: conflicts.length },
  ] as const;

  const renderPair = (c: any, symbol: string) => {
    const aName = studentsMap[c.student_a || c.studentA] || c.student_a || c.studentA || "Student A";
    const bName = studentsMap[c.student_b || c.studentB] || c.student_b || c.studentB || "Student B";
    const st = c.status;
    const isCannot = c.type === "cannot-pair";
    return (
      <div
        key={c.id}
        className="card"
        style={{
          padding: 16,
          border: isCannot ? "1px solid #FECDD3" : "1px solid #A7F3D0",
          backgroundColor: isCannot ? "#FEF2F2" : "#ECFDF5",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar name={aName} size="sm" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{aName}</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: isCannot ? "var(--danger)" : "var(--success)" }}>{symbol}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar name={bName} size="sm" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{bName}</span>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Badge variant={statusBadge(st) as "success" | "danger" | "warning"}>{st}</Badge>
          </div>
        </div>
        <p style={{ fontSize: 12, color: "var(--faint)", marginTop: 8 }}>
          {isCannot ? "Private reason: " : "Reason: "}
          {c.reason || "Team preference"}
        </p>
        {st === "pending" && (
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <Button variant="success" size="sm" onClick={() => handleReview(c.id, "approved")}>
              <Check size={13} /> Approve
            </Button>
            <Button variant="danger" size="sm" onClick={() => handleReview(c.id, "rejected")}>
              <X size={13} /> Reject
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border)" }}>
        {subTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setSub(t.key)}
            style={{
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: sub === t.key ? 600 : 500,
              borderBottom: sub === t.key ? "2px solid var(--primary)" : "2px solid transparent",
              color: sub === t.key ? "var(--primary)" : "var(--faint)",
              background: "none",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              cursor: "pointer",
            }}
          >
            {t.key} {t.count > 0 && <span style={{ fontSize: 11, color: "var(--faint)" }}>({t.count})</span>}
          </button>
        ))}
      </div>

      {sub === "Must-Pair" && <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{mustPairs.map((c) => renderPair(c, "↔"))}</div>}
      {sub === "Cannot-Pair" && <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{cannotPairs.map((c) => renderPair(c, "✗"))}</div>}
      {sub === "Pending" &&
        (pending.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{pending.map((c) => renderPair(c, c.type === "must-pair" ? "↔" : "✗"))}</div>
        ) : (
          <EmptyState icon={<Check size={20} />} title="No pending constraints" description="All requests have been reviewed." />
        ))}
      {sub === "Conflicts" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {conflicts.map((c) => (
            <div key={c} className="card" style={{ padding: 16, border: "1px solid #FECDD3", backgroundColor: "#FEF2F2" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <AlertTriangle size={16} style={{ color: "#DC2626", marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: "#991B1B", margin: 0 }}>{c}</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <Button variant="secondary" size="sm">
                      Resolve manually
                    </Button>
                    <Button size="sm">Auto-resolve</Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Formation ───────────────────────────────────────────────────────────────

function FormationTab({ cohortId, navigate }: { cohortId: string; navigate?: (r: string) => void }) {
  const { fetchEnrolledStudents, fetchCohortConstraints, triggerFormationRun } = useCohortsData();
  const [preset, setPreset] = useState("Balanced");
  const [weights, setWeights] = useState({ skill: 70, role: 60, availability: 80, preference: 50, balance: 65 });
  const [allowUnassigned, setAllowUnassigned] = useState(false);
  const [minTeamSize, setMinTeamSize] = useState(4);
  const [maxTeamSize, setMaxTeamSize] = useState(5);
  const [preferredTeamSize, setPreferredTeamSize] = useState(5);
  const [running, setRunning] = useState(false);
  const [qualityScore, setQualityScore] = useState(87);

  const handleGenerate = async () => {
    setRunning(true);
    try {
      const students = await fetchEnrolledStudents(cohortId);
      const constraints = await fetchCohortConstraints(cohortId);
      if (!students || students.length === 0) {
        toast.error("No students enrolled in this cohort.");
        return;
      }
      const result = await triggerFormationRun(cohortId, {
        project_id: "p1",
        min_size: minTeamSize,
        max_size: maxTeamSize,
        students: students,
        must_pair: (constraints || []).filter((c) => (c.type === "must_pair" || c.type === "must-pair") && c.status === "approved").map((c) => [c.student_a || (c as any).studentA, c.student_b || (c as any).studentB]),
        cannot_pair: (constraints || []).filter((c) => (c.type === "cannot_pair" || c.type === "cannot-pair") && c.status === "approved").map((c) => [c.student_a || (c as any).studentA, c.student_b || (c as any).studentB]),
        seed: 1,
      });
      if (result) {
        const score = result.balance ? Math.round(result.balance * 100) : 87;
        setQualityScore(score);
        toast.success(`Teams generated — score ${score}/100.`);
        if (navigate) navigate(`lecturer/cohorts/${cohortId}/results`);
      } else {
        toast.success("Teams generated — quality 87/100.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate teams.");
    } finally {
      setRunning(false);
    }
  };

  const presets = ["Balanced", "Skill-first", "Availability-first", "Preference-first", "Custom"] as const;
  const sliders = [
    { key: "skill" as const, label: "Skill Coverage" },
    { key: "role" as const, label: "Role Coverage" },
    { key: "availability" as const, label: "Availability Overlap" },
    { key: "preference" as const, label: "Preference Satisfaction" },
    { key: "balance" as const, label: "Ability Balance" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {/* Setup */}
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 16px 0" }}>Formation setup</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
            {[
              { l: "Min size", v: minTeamSize, setter: setMinTeamSize },
              { l: "Max size", v: maxTeamSize, setter: setMaxTeamSize },
              { l: "Preferred", v: preferredTeamSize, setter: setPreferredTeamSize },
            ].map((f) => (
              <div key={f.l}>
                <label style={{ display: "block", fontSize: 11, color: "var(--faint)", marginBottom: 4 }}>{f.l}</label>
                <input
                  type="number"
                  value={f.v}
                  onChange={(e) => f.setter(Number(e.target.value))}
                  style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", fontSize: 13, backgroundColor: "var(--surface-1)", color: "var(--text)", outline: "none" }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
            <span style={{ fontSize: 13, color: "var(--text)" }}>Team count</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>9</span>
          </div>
          <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", cursor: "pointer" }}>
            <span style={{ fontSize: 13, color: "var(--text)" }}>Allow unassigned students</span>
            <button
              onClick={() => setAllowUnassigned((v) => !v)}
              style={{
                width: 36,
                height: 20,
                borderRadius: 999,
                backgroundColor: allowUnassigned ? "var(--primary)" : "var(--border-strong)",
                border: "none",
                position: "relative",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <span style={{ position: "absolute", top: 2, left: allowUnassigned ? 18 : 2, width: 16, height: 16, borderRadius: "50%", backgroundColor: "#FFFFFF", transition: "all 0.15s ease" }} />
            </button>
          </label>
        </div>

        {/* Priorities */}
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 12px 0" }}>Optimization preset</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => setPreset(p)}
                style={{
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 500,
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  backgroundColor: preset === p ? "var(--primary)" : "var(--surface-1)",
                  color: preset === p ? "#FFFFFF" : "var(--text)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sliders.map((s) => (
              <div key={s.key}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "var(--text)" }}>{s.label}</span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{weights[s.key]}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={weights[s.key]}
                  onChange={(e) => {
                    setWeights((w) => ({ ...w, [s.key]: Number(e.target.value) }));
                    setPreset("Custom");
                  }}
                  style={{ width: "100%", accentColor: "var(--primary)" }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hard constraints + feasibility */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 12px 0" }}>Hard constraints</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["Team Size", "Must-Pair", "Cannot-Pair", "No Duplicates"].map((c) => (
              <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text)" }}>
                <Check size={15} style={{ color: "var(--success)" }} /> {c}
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 20, border: "1px solid #A7F3D0", backgroundColor: "#ECFDF5", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Check size={16} style={{ color: "#059669" }} />
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "#065F46", margin: 0 }}>Feasibility check</h2>
          </div>
          <p style={{ fontSize: 13, color: "#047857", margin: 0 }}>
            Formation is feasible. 9 teams × 4–5 students = 42 students.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
        <Button size="lg" onClick={handleGenerate} disabled={running}>
          <Sparkles size={16} /> {running ? "Generating..." : "Generate Teams"}
        </Button>
        <Button variant="secondary" size="lg" onClick={() => navigate?.(`lecturer/cohorts/${cohortId}/formation/board`)}>
          <Boxes size={16} /> Open Formation Board
        </Button>
      </div>

      {/* Current formation */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>Current formation</h2>
            <p style={{ fontSize: 12, color: "var(--faint)", margin: "2px 0 0 0" }}>
              Last run 15 Jul 2026 · {preset} preset
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: 0 }}>{qualityScore}</p>
            <p style={{ fontSize: 11, color: "var(--faint)", margin: 0 }}>/ 100</p>
          </div>
        </div>
        <button
          onClick={() => navigate?.(`lecturer/cohorts/${cohortId}/results`)}
          style={{ marginTop: 12, fontSize: 13, fontWeight: 500, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, padding: 0 }}
        >
          View results <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Results ─────────────────────────────────────────────────────────────────

function ResultsTab({ cohortId, navigate }: { cohortId: string; navigate?: (r: string) => void }) {
  const { commitTeams } = useCohortsData();
  const [compare, setCompare] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const m = {
    hardViolations: 0,
    skillCoverage: 89,
    roleCoverage: 91,
    availabilityOverlap: 78,
    preferenceSatisfaction: 82,
  };

  const scenarios = ["Balanced", "Skill-first", "Availability-first", "Lecturer Edited"];
  const rows = [
    { label: "Quality Score", vals: [87, 84, 81, 89] },
    { label: "Hard Violations", vals: [0, 0, 1, 0] },
    { label: "Skill Coverage", vals: [89, 93, 82, 88] },
    { label: "Role Coverage", vals: [91, 85, 88, 92] },
    { label: "Availability Overlap", vals: [78, 72, 90, 80] },
    { label: "Preference Satisfaction", vals: [82, 78, 76, 88] },
    { label: "Ability Balance", vals: [85, 80, 79, 86] },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <p style={{ fontSize: 44, fontWeight: 700, color: "var(--primary)", margin: 0 }}>87</p>
          <p style={{ fontSize: 13, color: "var(--faint)", margin: "4px 0 0 0" }}>Overall quality / 100</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, flex: 2 }}>
          <MetricCard label="Hard Violations" value={m.hardViolations} color="emerald" />
          <MetricCard label="Skill Coverage" value={`${m.skillCoverage}%`} color="indigo" />
          <MetricCard label="Role Coverage" value={`${m.roleCoverage}%`} color="indigo" />
          <MetricCard label="Availability Overlap" value={`${m.availabilityOverlap}%`} color="amber" />
          <MetricCard label="Preference Satisfaction" value={`${m.preferenceSatisfaction}%`} color="amber" />
          <MetricCard label="Teams" value={9} color="gray" />
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <Button onClick={() => navigate?.(`lecturer/cohorts/${cohortId}/formation/board`)}>
          <Boxes size={15} /> Review Teams
        </Button>
        <Button variant="secondary" onClick={() => setCompare((c) => !c)}>
          Compare Scenarios
        </Button>
        <Button variant="success" onClick={() => setChecklistOpen(true)}>
          <Check size={15} /> Finalize &amp; Publish
        </Button>
      </div>

      {compare && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>Scenario comparison</h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: "left", fontSize: 12, color: "var(--faint)", borderBottom: "1px solid var(--border)", backgroundColor: "var(--surface-2)" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Metric</th>
                  {scenarios.map((s) => (
                    <th key={s} style={{ padding: "12px 16px", fontWeight: 600 }}>
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const best = Math.max(...(r.label === "Hard Violations" ? r.vals.map((v) => -v) : r.vals));
                  return (
                    <tr key={r.label} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text)" }}>{r.label}</td>
                      {r.vals.map((v, i) => {
                        const isBest = (r.label === "Hard Violations" ? -v : v) === best;
                        return (
                          <td key={i} style={{ padding: "12px 16px", fontWeight: isBest ? 600 : 400, color: isBest ? "var(--primary)" : "var(--text)" }}>
                            {v}
                            {isBest && <Check size={12} style={{ display: "inline", marginLeft: 4 }} />}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {checklistOpen && (
        <Modal title="Finalize & publish" onClose={() => setChecklistOpen(false)}>
          <p style={{ fontSize: 13, color: "var(--faint)", marginBottom: 16 }}>Validation checklist before publishing to students:</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "All students assigned to a team",
              "No hard constraint violations",
              "All pending constraints reviewed",
              "Team sizes within 4–5 range",
            ].map((c) => (
              <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text)" }}>
                <Check size={15} style={{ color: "var(--success)" }} /> {c}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
            <Button variant="secondary" onClick={() => setChecklistOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={async () => {
                await commitTeams("f1");
                setChecklistOpen(false);
                toast.success("Teams published to students.");
              }}
            >
              Publish teams
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Analytics (Vanilla CSS HTML charts without Recharts) ────────────────────

function AnalyticsTab({ cohortId }: { cohortId?: string }) {
  const { fetchEnrolledStudents } = useCohortsData();
  const [studentsList, setStudentsList] = useState<any[]>([]);

  useEffect(() => {
    if (cohortId) {
      fetchEnrolledStudents(cohortId).then((data) => {
        setStudentsList(data || []);
      });
    }
  }, [cohortId, fetchEnrolledStudents]);

  const teamBalance = [
    { name: "Alpha", score: 88 },
    { name: "Beta", score: 84 },
    { name: "Gamma", score: 86 },
    { name: "Delta", score: 90 },
    { name: "Epsilon", score: 82 },
  ];
  const teamAvail = teamBalance.map((t) => ({
    name: t.name,
    overlap: 60 + ((t.score * 3) % 40),
  }));

  const categoryData = useMemo(() => {
    const cats = ["Frontend", "Backend", "AI & Data", "UI/UX", "DevOps", "QA"];
    return cats.map((c) => ({
      category: c,
      coverage: Math.round(
        ((studentsList.filter((s) => (s.skills || []).some((sk: any) => sk.name?.includes(c) || sk.category === c)).length / (studentsList.length || 1)) * 100) || 85
      ),
    }));
  }, [studentsList]);

  const roleData = useMemo(
    () =>
      TEAM_ROLES.map((r, i) => ({
        name: r,
        value: studentsList.filter((s) => s.desired_role === r || (s as any).primaryRole === r).length || Math.max(1, Math.round(45 / TEAM_ROLES.length)),
        color: CHART_COLORS[i % CHART_COLORS.length],
      })),
    [studentsList]
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
      <ChartCard title="Team ability balance">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {teamBalance.map((t) => (
            <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text)", width: 60, flexShrink: 0 }}>Team {t.name}</span>
              <ProgressBar value={t.score} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)", width: 32, textAlign: "right" }}>{t.score}</span>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Skill category coverage">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {categoryData.map((c) => (
            <div key={c.category} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text)", width: 90, flexShrink: 0 }}>{c.category}</span>
              <ProgressBar value={c.coverage} color="emerald" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--success)", width: 36, textAlign: "right" }}>{c.coverage}%</span>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Role distribution">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {roleData.map((d) => (
            <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: d.color }} />
                <span style={{ color: "var(--text)" }}>{d.name}</span>
              </div>
              <span style={{ fontWeight: 600, color: "var(--text)" }}>{d.value} students</span>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Availability overlap per team">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {teamAvail.map((t) => (
            <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text)", width: 60, flexShrink: 0 }}>Team {t.name}</span>
              <ProgressBar value={t.overlap} color="amber" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--warn)", width: 36, textAlign: "right" }}>{t.overlap}%</span>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 16px 0" }}>{title}</h2>
      {children}
    </div>
  );
}

// ─── Shared modal ────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div className="card" style={{ width: "100%", maxWidth: 440, padding: 24 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ color: "var(--faint)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
