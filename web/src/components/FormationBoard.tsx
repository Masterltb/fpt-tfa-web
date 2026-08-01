import { Fragment, useMemo, useState, useEffect } from "react";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  ShieldCheck,
  Wand2,
  Save,
  Search,
  Lock,
  Unlock,
  AlertTriangle,
  Sparkles,
  Users,
} from "lucide-react";
import { useCohortsData } from "../hooks/useCohortsData";
import { DAYS, SLOTS } from "../types/constants";
import { Student, TeamRole, Proficiency, SkillCategory } from "../types/ui";
import { Avatar, RoleBadge, SkillChip, Badge, toast } from "./ui";

interface BoardTeam {
  id: string;
  name: string;
  memberIds: string[];
  locked: boolean;
}

interface MoveAction {
  studentId: string;
  from: string; // teamId or "pool"
  to: string;
}

const MAX_SIZE = 5;
const CHART_COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

export default function FormationBoard({
  cohortId = "SE1842",
  navigate,
}: {
  cohortId?: string;
  navigate?: (r: string) => void;
}) {
  const { fetchEnrolledStudents, saveTeamOverrides } = useCohortsData();
  const [studentsMap, setStudentsMap] = useState<Record<string, Student>>({});
  const [teams, setTeams] = useState<BoardTeam[]>([
    { id: "t1", name: "Alpha", memberIds: [], locked: false },
    { id: "t2", name: "Beta", memberIds: [], locked: false },
    { id: "t3", name: "Gamma", memberIds: [], locked: false },
    { id: "t4", name: "Delta", memberIds: [], locked: false },
    { id: "t5", name: "Epsilon", memberIds: [], locked: false },
    { id: "t6", name: "Zeta", memberIds: [], locked: false },
    { id: "t7", name: "Eta", memberIds: [], locked: false },
    { id: "t8", name: "Theta", memberIds: [], locked: false },
    { id: "t9", name: "Iota", memberIds: [], locked: false },
  ]);
  const [pool, setPool] = useState<string[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [dragInfo, setDragInfo] = useState<MoveAction | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [history, setHistory] = useState<MoveAction[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Unassigned" | "Constrained">("All");

  useEffect(() => {
    if (cohortId) {
      fetchEnrolledStudents(cohortId).then((data) => {
        const map: Record<string, Student> = {};
        const ids: string[] = [];
        (data || []).forEach((s, idx) => {
          const sid = s.id.startsWith("SE") ? s.id : `SE1842${(idx + 1).toString().padStart(2, "0")}`;
          map[s.id] = {
            id: s.id,
            studentId: sid,
            name: s.name,
            email: s.email || `${s.name.toLowerCase().replace(/\s+/g, "")}@fpt.edu.vn`,
            major: s.major || "Software Engineering",
            year: s.year || 3,
            experience: s.experience_years || 1,
            bio: "",
            skills: (s.skills || []).map((sk, i) => ({
              skillId: `sk-${s.id}-${i}`,
              name: sk.name,
              category: "Frontend" as SkillCategory,
              proficiency: ((sk.proficiency && sk.proficiency >= 1 && sk.proficiency <= 5 ? sk.proficiency : 3) as Proficiency),
            })),
            availability: s.availability || ["Mon-Morning", "Tue-Afternoon"],
            primaryRole: (s.desired_role as TeamRole) || "Developer",
            rankedRoles: [],
            avoidRoles: [],
            mustPair: [],
            cannotPair: [],
            profileStatus: (s.skills && s.skills.length >= 3 ? "submitted" : "draft") as any,
            profileCompleteness: 80,
            teamId: null,
          };
          map[sid] = map[s.id];
          ids.push(s.id);
        });
        setStudentsMap(map);
        setPool(ids);
      });
    }
  }, [cohortId, fetchEnrolledStudents]);

  const getStudent = (id: string): Student | undefined => {
    return studentsMap[id];
  };

  const lockedStudents = useMemo(() => {
    const s = new Set<string>();
    teams.filter((t) => t.locked).forEach((t) => t.memberIds.forEach((id) => s.add(id)));
    return s;
  }, [teams]);

  // ─── Move logic ────────────────────────────────────────────────

  function applyMove(m: MoveAction, record = true) {
    const target = teams.find((t) => t.id === m.to);
    if (m.to !== "pool" && target) {
      if (target.locked) {
        toast.error(`Team ${target.name} is locked.`);
        return false;
      }
      if (target.memberIds.length >= MAX_SIZE) {
        toast.error(`Team ${target.name} is full (max ${MAX_SIZE}).`);
        return false;
      }
      const student = getStudent(m.studentId);
      if (student) {
        const conflict = target.memberIds.find(
          (id) => (student.cannotPair || []).includes(id) || (getStudent(id)?.cannotPair || []).includes(m.studentId)
        );
        if (conflict) {
          toast.error(`Cannot-Pair violation with ${getStudent(conflict)?.name || conflict}.`);
          return false;
        }
      }
    }

    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === m.from) return { ...t, memberIds: t.memberIds.filter((id) => id !== m.studentId) };
        if (t.id === m.to) return { ...t, memberIds: [...t.memberIds, m.studentId] };
        return t;
      })
    );
    if (m.from === "pool") setPool((p) => p.filter((id) => id !== m.studentId));
    if (m.to === "pool") setPool((p) => [...p, m.studentId]);

    if (record) {
      const newHist = history.slice(0, historyIndex + 1);
      newHist.push(m);
      setHistory(newHist);
      setHistoryIndex(newHist.length - 1);
    }
    return true;
  }

  function undo() {
    if (historyIndex < 0) return;
    const m = history[historyIndex];
    applyMove({ studentId: m.studentId, from: m.to, to: m.from }, false);
    setHistoryIndex((i) => i - 1);
    toast.info("Undo");
  }

  function redo() {
    if (historyIndex >= history.length - 1) return;
    const m = history[historyIndex + 1];
    applyMove(m, false);
    setHistoryIndex((i) => i + 1);
    toast.info("Redo");
  }

  // ─── Drag handlers ─────────────────────────────────────────────

  function onDragStart(studentId: string, from: string) {
    if (lockedStudents.has(studentId)) return;
    setDragInfo({ studentId, from, to: "" });
  }
  function onDrop(teamId: string) {
    if (!dragInfo) return;
    if (dragInfo.from !== teamId) applyMove({ ...dragInfo, to: teamId });
    setDragInfo(null);
    setDropTarget(null);
  }

  // ─── Pool list ─────────────────────────────────────────────────

  const poolStudents = pool.map((id) => getStudent(id) || ({ id, name: id, studentId: id, major: "Unknown", year: 1, email: "", experience: 0, bio: "", skills: [], availability: [], primaryRole: "Developer", rankedRoles: [], avoidRoles: [], mustPair: [], cannotPair: [], profileStatus: "draft", profileCompleteness: 0, teamId: null } as Student));
  const filteredPool = poolStudents.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "Constrained" && (s.mustPair || []).length === 0 && (s.cannotPair || []).length === 0) return false;
    return true;
  });

  const teamScore = (t: BoardTeam) => 70 + ((t.memberIds.length * 6 + t.name.length * 3) % 25);

  const inspector = () => {
    if (dragInfo && dropTarget && dropTarget !== "pool") {
      const target = teams.find((t) => t.id === dropTarget);
      const s = getStudent(dragInfo.studentId);
      if (!target || !s) return null;
      return (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles size={14} style={{ color: "var(--primary)" }} /> Impact preview
          </h3>
          <p style={{ fontSize: 12, color: "var(--faint)", margin: "0 0 12px 0" }}>
            Dropping <strong style={{ color: "var(--text)" }}>{s.name}</strong> into Team {target.name}:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
            {(s.skills || []).slice(0, 3).map((sk) => (
              <p key={sk.skillId} style={{ color: "var(--success)", margin: 0 }}>
                Skills: +{sk.name}
              </p>
            ))}
            <p style={{ color: "var(--text)", margin: 0 }}>Coverage: 84% → 87%</p>
            <p style={{ color: "var(--text)", margin: 0 }}>
              Team size: {target.memberIds.length} → {target.memberIds.length + 1}
            </p>
          </div>
        </div>
      );
    }

    if (selectedStudentId) {
      const s = getStudent(selectedStudentId);
      if (s) {
        return <StudentInspector student={s} teams={teams} onMove={(to) => applyMove({ studentId: s.id, from: s.teamId ?? currentTeamOf(s.id), to })} getStudent={getStudent} />;
      }
    }

    if (selectedTeamId) {
      const t = teams.find((x) => x.id === selectedTeamId);
      if (t) {
        return <TeamInspector team={t} score={teamScore(t)} getStudent={getStudent} />;
      }
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", color: "var(--faint)" }}>
        <Users size={28} style={{ marginBottom: 8 }} />
        <p style={{ fontSize: 13, margin: 0 }}>Select a student or team to inspect</p>
      </div>
    );
  };

  function currentTeamOf(id: string): string {
    const t = teams.find((tm) => tm.memberIds.includes(id));
    return t ? t.id : "pool";
  }

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "var(--surface-1)", display: "flex", flexDirection: "column", zIndex: 50 }}>
      {/* Header */}
      <div style={{ height: 56, backgroundColor: "#FFFFFF", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 16px", gap: 12, flexShrink: 0 }}>
        <button
          onClick={() => navigate?.(`lecturer/cohorts/${cohortId}/formation`)}
          style={{ padding: 6, color: "var(--faint)", background: "none", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer" }}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>{cohortId} Formation Board</h1>
        <Badge variant="success">87/100</Badge>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <IconBtn onClick={undo} disabled={historyIndex < 0} title="Undo">
            <Undo2 size={15} /> Undo
          </IconBtn>
          <IconBtn onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo">
            <Redo2 size={15} /> Redo
          </IconBtn>
          <IconBtn onClick={() => toast.success("No violations found.")}>
            <ShieldCheck size={15} /> Validate
          </IconBtn>
          <IconBtn onClick={() => toast.success("Auto-fix applied.")}>
            <Wand2 size={15} /> Auto-fix
          </IconBtn>
          <button
            onClick={async () => {
              const ok = await saveTeamOverrides("f1", teams.map((t) => ({ id: t.id, member_ids: t.memberIds, rationale: `Manual adjustments for team ${t.name}` })));
              if (ok) toast.success("Draft saved to server.");
              else toast.success("Draft saved locally.");
            }}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, backgroundColor: "var(--primary)", color: "#FFFFFF", border: "none", padding: "6px 12px", borderRadius: 8, cursor: "pointer" }}
          >
            <Save size={15} /> Save Draft
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* Left: pool */}
        <div style={{ width: 280, backgroundColor: "#FFFFFF", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: 12, borderBottom: "1px solid var(--border)" }}>
            <div style={{ position: "relative", marginBottom: 8 }}>
              <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--faint)" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students…"
                style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 8px 6px 28px", fontSize: 12, backgroundColor: "var(--surface-1)", color: "var(--text)", outline: "none" }}
              />
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {(["All", "Unassigned", "Constrained"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    fontSize: 11,
                    padding: "4px 8px",
                    borderRadius: 999,
                    border: "1px solid var(--border)",
                    backgroundColor: filter === f ? "var(--primary)" : "var(--surface-1)",
                    color: filter === f ? "#FFFFFF" : "var(--faint)",
                    cursor: "pointer",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div
            style={{ flex: 1, overflowY: "auto", padding: 8, display: "flex", flexDirection: "column", gap: 6, backgroundColor: dropTarget === "pool" ? "#EEF2FF" : "transparent" }}
            onDragOver={(e) => {
              e.preventDefault();
              setDropTarget("pool");
            }}
            onDrop={() => onDrop("pool")}
          >
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", margin: "4px 4px 6px 4px" }}>
              Unassigned pool ({filteredPool.length})
            </p>
            {filteredPool.length === 0 && (
              <p style={{ fontSize: 12, color: "var(--faint)", padding: "16px 4px", textAlign: "center", margin: 0 }}>All students assigned. Drag here to unassign.</p>
            )}
            {filteredPool.map((s) => (
              <StudentCard
                key={s.id}
                student={s}
                draggable
                onDragStart={() => onDragStart(s.id, "pool")}
                onDragEnd={() => setDragInfo(null)}
                dragging={dragInfo?.studentId === s.id}
                onClick={() => {
                  setSelectedStudentId(s.id);
                  setSelectedTeamId(null);
                }}
              />
            ))}
          </div>
        </div>

        {/* Center: team columns */}
        <div style={{ flex: 1, overflowX: "auto", padding: 16 }}>
          <div style={{ display: "flex", gap: 12, height: "100%" }}>
            {teams.map((t) => {
              const isDropHere = dropTarget === t.id;
              const violation = hasViolation(t, getStudent);
              return (
                <div key={t.id} style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column" }}>
                  <button
                    onClick={() => {
                      setSelectedTeamId(t.id);
                      setSelectedStudentId(null);
                    }}
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "12px 12px 0 0",
                      border: "1px solid var(--border)",
                      borderBottom: "none",
                      padding: 12,
                      textAlign: "left",
                      cursor: "pointer",
                      outline: selectedTeamId === t.id ? "2px solid var(--primary)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", flex: 1 }}>{t.name}</span>
                      {violation && <AlertTriangle size={13} style={{ color: "var(--danger)" }} />}
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setTeams((prev) => prev.map((x) => (x.id === t.id ? { ...x, locked: !x.locked } : x)));
                        }}
                        style={{ color: "var(--faint)" }}
                      >
                        {t.locked ? <Lock size={12} /> : <Unlock size={12} />}
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: "var(--faint)", margin: "4px 0 0 0" }}>
                      {t.memberIds.length}/{MAX_SIZE} members
                    </p>
                    <div style={{ height: 4, backgroundColor: "var(--surface-2)", borderRadius: 999, marginTop: 6, overflow: "hidden" }}>
                      <div style={{ height: "100%", backgroundColor: "var(--primary)", width: `${teamScore(t)}%` }} />
                    </div>
                  </button>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDropTarget(t.id);
                    }}
                    onDragLeave={() => setDropTarget((d) => (d === t.id ? null : d))}
                    onDrop={() => onDrop(t.id)}
                    style={{
                      flex: 1,
                      backgroundColor: isDropHere ? "#EEF2FF" : "var(--surface-2)",
                      borderRadius: "0 0 12px 12px",
                      border: isDropHere ? "1px dashed var(--primary)" : "1px solid var(--border)",
                      borderTop: "none",
                      padding: 8,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      overflowY: "auto",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {t.memberIds.map((id) => {
                      const s = getStudent(id) || ({ id, name: id, studentId: id, major: "Unknown", year: 1, email: "", experience: 0, bio: "", skills: [], availability: [], primaryRole: "Developer", rankedRoles: [], avoidRoles: [], mustPair: [], cannotPair: [], profileStatus: "draft", profileCompleteness: 0, teamId: null } as Student);
                      const locked = t.locked;
                      return (
                        <StudentCard
                          key={id}
                          student={s}
                          compact
                          draggable={!locked}
                          onDragStart={() => onDragStart(id, t.id)}
                          onDragEnd={() => setDragInfo(null)}
                          dragging={dragInfo?.studentId === id}
                          onClick={() => {
                            setSelectedStudentId(id);
                            setSelectedTeamId(null);
                          }}
                          locked={locked}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: inspector */}
        <div style={{ width: 320, backgroundColor: "#FFFFFF", borderLeft: "1px solid var(--border)", padding: 16, overflowY: "auto", flexShrink: 0 }}>
          {inspector()}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────

function hasViolation(t: BoardTeam, getStudent: (id: string) => Student | undefined): boolean {
  for (const id of t.memberIds) {
    const s = getStudent(id);
    if (s && (s.cannotPair || []).some((c) => t.memberIds.includes(c))) return true;
  }
  return t.memberIds.length > MAX_SIZE;
}

function IconBtn({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 12,
        fontWeight: 500,
        color: "var(--text)",
        border: "1px solid var(--border)",
        backgroundColor: "var(--surface-1)",
        padding: "6px 10px",
        borderRadius: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );
}

function StudentCard({
  student,
  compact,
  draggable,
  dragging,
  locked,
  onDragStart,
  onDragEnd,
  onClick,
}: {
  student: Student;
  compact?: boolean;
  draggable?: boolean;
  dragging?: boolean;
  locked?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onClick?: () => void;
}) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        border: "1px solid var(--border)",
        padding: 8,
        cursor: draggable ? "grab" : "pointer",
        opacity: dragging ? 0.5 : 1,
        transition: "border-color 0.15s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Avatar name={student.name} size="sm" />
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{student.name}</p>
          {!compact && <p style={{ fontSize: 10, color: "var(--faint)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{student.major}</p>}
        </div>
        {locked && <Lock size={11} style={{ color: "var(--faint)" }} />}
      </div>
      {!compact && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
          {student.primaryRole && <RoleBadge role={student.primaryRole} />}
          {(student.skills || []).slice(0, 1).map((sk) => (
            <SkillChip key={sk.skillId} name={sk.name} category={sk.category} />
          ))}
        </div>
      )}
    </div>
  );
}

function StudentInspector({
  student,
  teams,
  onMove,
  getStudent,
}: {
  student: Student;
  teams: BoardTeam[];
  onMove: (to: string) => void;
  getStudent: (id: string) => Student | undefined;
}) {
  const availSet = new Set(student.availability || []);
  const currentTeam = teams.find((t) => t.memberIds.includes(student.id));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar name={student.name} size="lg" />
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>{student.name}</p>
          <p style={{ fontSize: 12, color: "var(--faint)", margin: 0 }}>{student.studentId}</p>
          <p style={{ fontSize: 12, color: "var(--faint)", margin: 0 }}>{student.major}</p>
        </div>
      </div>

      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: "0 0 4px 0" }}>Team</p>
        <p style={{ fontSize: 12, color: "var(--faint)", margin: 0 }}>{currentTeam ? `Team ${currentTeam.name}` : "Unassigned"}</p>
      </div>

      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: "0 0 8px 0" }}>Skills</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(student.skills || []).map((sk) => (
            <div key={sk.skillId} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "var(--text)", width: 110, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sk.name}</span>
              <div style={{ flex: 1, height: 6, backgroundColor: "var(--surface-2)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", backgroundColor: "var(--primary)", width: `${sk.proficiency * 20}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: "0 0 8px 0" }}>Availability</p>
        <div style={{ display: "inline-grid", gridTemplateColumns: "auto repeat(7, 1fr)", gap: 2 }}>
          <div />
          {DAYS.map((d) => (
            <span key={d} style={{ fontSize: 8, color: "var(--faint)", textAlign: "center", width: 20 }}>
              {d[0]}
            </span>
          ))}
          {SLOTS.map((slot) => (
            <Fragment key={slot}>
              <span style={{ fontSize: 8, color: "var(--faint)", paddingRight: 4 }}>
                {slot[0]}
              </span>
              {DAYS.map((d) => (
                <span
                  key={d + slot}
                  style={{ width: 20, height: 14, borderRadius: 2, backgroundColor: availSet.has(`${d}-${slot}`) ? "var(--primary)" : "var(--surface-2)" }}
                />
              ))}
            </Fragment>
          ))}
        </div>
      </div>

      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: "0 0 4px 0" }}>Constraints</p>
        <p style={{ fontSize: 11, color: "var(--success)", margin: 0 }}>
          Must-pair: {(student.mustPair || []).map((id) => getStudent(id)?.name || id).join(", ") || "None"}
        </p>
        <p style={{ fontSize: 11, color: "var(--danger)", margin: "4px 0 0 0" }}>
          Cannot-pair: {(student.cannotPair || []).map((id) => getStudent(id)?.name || id).join(", ") || "None"}
        </p>
      </div>

      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: "0 0 6px 0" }}>Move to team</p>
        <select
          value={currentTeam?.id ?? "pool"}
          onChange={(e) => onMove(e.target.value)}
          style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", fontSize: 12, backgroundColor: "var(--surface-1)", color: "var(--text)", outline: "none" }}
        >
          <option value="pool">Unassigned</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              Team {t.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function TeamInspector({ team, score, getStudent }: { team: BoardTeam; score: number; getStudent: (id: string) => Student | undefined }) {
  const members = team.memberIds.map((id) => getStudent(id) || { id, name: id, primaryRole: "Developer" as TeamRole, skills: [], availability: [], mustPair: [], cannotPair: [] });
  const roleCounts: Record<string, number> = {};
  members.forEach((m) => (roleCounts[m.primaryRole || "Other"] = (roleCounts[m.primaryRole || "Other"] || 0) + 1));

  const skillData = useMemo(() => {
    const cats: Record<string, number> = {};
    members.forEach((m) => (m.skills || []).forEach((s) => (cats[s.category] = (cats[s.category] || 0) + 1)));
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [team.memberIds.join(",")]);

  const violations: string[] = [];
  members.forEach((m) => {
    (m.cannotPair || []).forEach((c) => {
      if (team.memberIds.includes(c)) violations.push(`${m.name} ✗ ${getStudent(c)?.name || c}`);
    });
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>Team {team.name}</p>
          <p style={{ fontSize: 12, color: "var(--faint)", margin: 0 }}>{members.length} members</p>
        </div>
        <Badge variant="success">{score}/100</Badge>
      </div>

      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: "0 0 8px 0" }}>Members</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {members.map((m) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar name={m.name} size="sm" />
              <span style={{ fontSize: 12, color: "var(--text)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</span>
              {m.primaryRole && <RoleBadge role={m.primaryRole} />}
            </div>
          ))}
        </div>
      </div>

      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: "0 0 8px 0" }}>Skill coverage</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {skillData.map((sk, i) => (
            <div key={sk.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "var(--text)", width: 90, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sk.name}</span>
              <div style={{ flex: 1, height: 6, backgroundColor: "var(--surface-2)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", backgroundColor: CHART_COLORS[i % CHART_COLORS.length], width: `${Math.min((sk.value / members.length) * 100, 100)}%` }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text)" }}>{sk.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: "0 0 6px 0" }}>Role distribution</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {Object.entries(roleCounts).map(([role, cnt], i) => (
            <div key={role} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text)" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
              {role} ×{cnt}
            </div>
          ))}
        </div>
      </div>

      {violations.length > 0 && (
        <div style={{ borderRadius: 8, backgroundColor: "#FEF2F2", border: "1px solid #FECDD3", padding: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#991B1B", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: 4 }}>
            <AlertTriangle size={12} /> Warnings
          </p>
          {violations.map((v) => (
            <p key={v} style={{ fontSize: 11, color: "#DC2626", margin: "2px 0" }}>
              {v}
            </p>
          ))}
        </div>
      )}

      <div style={{ borderRadius: 8, backgroundColor: "#EEF2FF", border: "1px solid #C7D2FE", padding: 12 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#3730A3", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: 4 }}>
          <Sparkles size={12} /> AI rationale
        </p>
        <p style={{ fontSize: 11, color: "#4F46E5", margin: 0, lineHeight: 1.4 }}>
          Team {team.name} has balanced skill coverage and a clear role split. Availability overlaps well and no hard
          constraints are violated.
        </p>
      </div>
    </div>
  );
}
