import React, { useMemo, useState } from "react";
import { Plus, Search, ChevronDown, X, FolderOpen } from "lucide-react";
import { useCohortsData } from "../hooks/useCohortsData";
import { CohortStatus } from "../types/ui";
import { StatusBadge, ProgressBar, Button, EmptyState, toast } from "./ui";

const STATUSES: (CohortStatus | "all")[] = [
  "all", "draft", "collecting", "ready", "optimizing", "review", "finalized", "archived",
];

export default function LecturerCohorts({ navigate }: { navigate?: (r: string) => void }) {
  const { cohorts, createNewCohort } = useCohortsData();
  const [q, setQ] = useState("");
  const [semester, setSemester] = useState("all");
  const [status, setStatus] = useState<CohortStatus | "all">("all");
  const [showNew, setShowNew] = useState(false);
  const [newCohortName, setNewCohortName] = useState("");
  const [newCohortCode, setNewCohortCode] = useState("");

  const displayCohorts = useMemo(() => {
    return (cohorts || []).map((c, i) => ({
      id: c.id,
      code: c.name.includes(" - ") ? c.name.split(" - ")[0] : `SWE40${i + 1}`,
      name: c.name.includes(" - ") ? c.name.split(" - ").slice(1).join(" - ") : c.name,
      module: "SWE401",
      semester: "Fall 2026",
      status: "collecting" as CohortStatus,
      studentCount: 24,
      profileCompletion: 82,
      minTeamSize: 4,
      maxTeamSize: 5,
    }));
  }, [cohorts]);

  const semesters = useMemo(() => ["all", ...new Set(displayCohorts.map((c) => c.semester))], [displayCohorts]);

  const filtered = displayCohorts.filter(
    (c) =>
      (q === "" || c.code.toLowerCase().includes(q.toLowerCase()) || c.name.toLowerCase().includes(q.toLowerCase())) &&
      (semester === "all" || c.semester === semester) &&
      (status === "all" || c.status === status)
  );

  const handleCreateCohort = async () => {
    if (!newCohortName.trim()) {
      toast.error("Cohort name is required");
      return;
    }
    const fullName = newCohortCode ? `${newCohortCode} - ${newCohortName}` : newCohortName;
    const created = await createNewCohort(fullName);
    if (created) {
      toast.success("Cohort created successfully");
      setShowNew(false);
      setNewCohortName("");
      setNewCohortCode("");
    }
  };

  const selectStyle: React.CSSProperties = {
    appearance: "none",
    border: "1px solid var(--border)",
    backgroundColor: "var(--surface-1)",
    borderRadius: 8,
    padding: "8px 32px 8px 12px",
    fontSize: 13,
    color: "var(--text)",
    outline: "none",
    cursor: "pointer",
  };

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: 0 }}>Cohorts</h1>
          <p style={{ fontSize: 13, color: "var(--faint)", margin: "4px 0 0 0" }}>Manage your teaching cohorts and team formations.</p>
        </div>
        <Button onClick={() => setShowNew(true)}>
          <Plus size={15} /> New Cohort
        </Button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 16, display: "flex", flexWrap: "wrap", gap: 12 }}>
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--faint)" }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search cohorts…"
            style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px 8px 34px", fontSize: 13, backgroundColor: "var(--surface-1)", color: "var(--text)", outline: "none" }}
          />
        </div>
        <div style={{ position: "relative" }}>
          <select value={semester} onChange={(e) => setSemester(e.target.value)} style={selectStyle}>
            {semesters.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All semesters" : s}
              </option>
            ))}
          </select>
          <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--faint)", pointerEvents: "none" }} />
        </div>
        <div style={{ position: "relative" }}>
          <select value={status} onChange={(e) => setStatus(e.target.value as CohortStatus | "all")} style={selectStyle}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All statuses" : s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--faint)", pointerEvents: "none" }} />
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <EmptyState icon={<FolderOpen size={20} />} title="No cohorts match your filters" description="Try adjusting your search or filters." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: "left", fontSize: 12, color: "var(--faint)", borderBottom: "1px solid var(--border)", backgroundColor: "var(--surface-2)" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Name</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Module</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Semester</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Students</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, width: 180 }}>Profile completion</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Team size</th>
                  <th style={{ padding: "12px 16px" }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <p style={{ fontWeight: 600, color: "var(--text)", margin: 0 }}>{c.code}</p>
                      <p style={{ fontSize: 11, color: "var(--faint)", margin: "2px 0 0 0" }}>{c.name}</p>
                    </td>
                    <td style={{ padding: "14px 16px", color: "var(--text)" }}>{c.module}</td>
                    <td style={{ padding: "14px 16px", color: "var(--text)" }}>{c.semester}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <StatusBadge status={c.status} />
                    </td>
                    <td style={{ padding: "14px 16px", color: "var(--text)" }}>{c.studentCount}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ProgressBar value={c.profileCompletion} />
                        <span style={{ fontSize: 12, color: "var(--faint)", width: 36, textAlign: "right" }}>{c.profileCompletion}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", color: "var(--text)" }}>
                      {c.minTeamSize}–{c.maxTeamSize}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <Button size="sm" onClick={() => navigate?.(`lecturer/cohorts/${c.id}/overview`)}>
                        Open
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New cohort drawer */}
      {showNew && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "flex-end" }} onClick={() => setShowNew(false)}>
          <div className="card" style={{ width: "100%", maxWidth: 440, height: "100%", borderRadius: 0, padding: 24, overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", margin: 0 }}>New cohort</h3>
              <button onClick={() => setShowNew(false)} style={{ color: "var(--faint)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--faint)", marginBottom: 6 }}>Cohort Name</label>
                <input
                  value={newCohortName}
                  onChange={(e) => setNewCohortName(e.target.value)}
                  placeholder="e.g. Software Engineering Project"
                  style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 13, backgroundColor: "var(--surface-1)", color: "var(--text)", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--faint)", marginBottom: 6 }}>Module Code</label>
                <input
                  value={newCohortCode}
                  onChange={(e) => setNewCohortCode(e.target.value)}
                  placeholder="e.g. SWE401"
                  style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 13, backgroundColor: "var(--surface-1)", color: "var(--text)", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--faint)", marginBottom: 6 }}>Semester</label>
                <input placeholder="e.g. Fall 2026" defaultValue="Fall 2026" style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 13, backgroundColor: "var(--surface-1)", color: "var(--text)", outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--faint)", marginBottom: 6 }}>Team Size</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {["Min", "Max", "Preferred"].map((l, idx) => (
                    <input key={l} placeholder={l} type="number" defaultValue={idx === 0 ? 4 : 5} style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 13, backgroundColor: "var(--surface-1)", color: "var(--text)", outline: "none" }} />
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--faint)", marginBottom: 6 }}>Deadline</label>
                <input type="date" style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 13, backgroundColor: "var(--surface-1)", color: "var(--text)", outline: "none" }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
              <Button variant="secondary" onClick={() => setShowNew(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCohort}>Create cohort</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
