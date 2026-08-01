import { Fragment, useEffect, useState } from "react";
import { UsersRound, Sparkles, Clock, Megaphone, CalendarClock } from "lucide-react";
import { DAYS, SLOTS } from "../types/constants";
import { useAuth } from "../lib/auth";
import { useProfileData } from "../hooks/useProfileData";
import { useCohortsData } from "../hooks/useCohortsData";
import type { StudentIn } from "../types";
import { Avatar, RoleBadge, SkillChip, Badge, EmptyState } from "./ui";
import { SKILL_CATEGORIES } from "../types/ui";

export default function StudentTeam() {
  const { user } = useAuth();
  const { profile } = useProfileData();
  const { cohorts, fetchEnrolledStudents } = useCohortsData();
  const activeCohortId = cohorts[0]?.id || "cohort-1";

  const [previewPublished, setPreviewPublished] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState<StudentIn[]>([]);

  useEffect(() => {
    if (activeCohortId) {
      fetchEnrolledStudents(activeCohortId).then(setEnrolledStudents);
    }
  }, [activeCohortId, fetchEnrolledStudents]);

  const me = {
    id: profile?.id || user?.uid || "s-1",
    name: profile?.name || user?.displayName || "Phạm Thị Hoa",
    major: profile?.major || "Software Engineering",
    primaryRole: profile?.desired_role || "Developer",
    skills: (profile?.skills || []).map((sk, i) => ({
      skillId: `sk-${i}`,
      name: sk.name,
      category: "Frontend" as any,
      proficiency: sk.proficiency || 3,
    })),
    availability: profile?.availability || [],
  };

  const team = {
    id: "team-1",
    name: "1",
    qualityScore: 92,
    memberIds: [me.id, ...enrolledStudents.slice(0, 4).map((s) => s.id)],
    rationale: "Optimized for skill coverage across frontend, backend, and DevOps, plus strong time overlap.",
  };

  if (!previewPublished) {
    return (
      <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 360 }}>
        <EmptyState
          icon={<UsersRound size={24} />}
          title="Teams have not been published yet"
          description="Your lecturer is still reviewing team formations. You'll be notified as soon as your team is ready."
          action={
            <button
              onClick={() => setPreviewPublished(true)}
              style={{ fontSize: 13, fontWeight: 500, color: "var(--primary)", background: "none", border: "1px solid var(--border-strong)", borderRadius: 8, padding: "8px 16px", cursor: "pointer", marginTop: 8 }}
            >
              Preview published view (demo)
            </button>
          }
        />
      </div>
    );
  }

  const members = (team.memberIds || []).map((id) => {
    if (id === me.id) return me;
    const found = enrolledStudents.find((s) => s.id === id);
    return {
      id,
      name: found?.name || `Team Member (${id})`,
      major: (found as any)?.major || "Software Engineering",
      primaryRole: found?.desired_role || "Developer",
      skills: (found?.skills || []).map((sk, i) => ({
        skillId: `sk-${id}-${i}`,
        name: sk.name,
        category: "Backend" as any,
        proficiency: sk.proficiency || 3,
      })),
      availability: found?.availability || ["Mon-Morning", "Tue-Afternoon"],
    };
  });

  // combined skills
  const allSkills = members.flatMap((m) => m.skills || []);
  const uniqueByCat = SKILL_CATEGORIES.map((cat) => ({
    cat,
    skills: Array.from(new Set(allSkills.filter((s) => s.category === cat).map((s) => s.name))),
  })).filter((g) => g.skills.length > 0);

  // shared availability
  const slotCounts: Record<string, number> = {};
  members.forEach((m) => (m.availability || []).forEach((a) => (slotCounts[a] = (slotCounts[a] || 0) + 1)));
  const best = Object.entries(slotCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const teamAnnouncement = {
    body: "Welcome to your assigned team! Please coordinate your first meeting using the suggested slots below.",
    author: "Lecturer",
  };

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: 0 }}>Team {team.name}</h1>
            <Badge variant="success">Quality {team.qualityScore}/100</Badge>
          </div>
          <p style={{ fontSize: 13, color: "var(--faint)", margin: "4px 0 0 0" }}>SE1842 — Software Engineering Project</p>
        </div>
      </div>

      {/* Members */}
      <div className="card" style={{ padding: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 12px 0" }}>Team members</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          {members.map((m) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--surface-2)" }}>
              <Avatar name={m.name} size="md" />
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {m.name} {m.id === me.id && <span style={{ fontSize: 11, color: "var(--primary)" }}>(you)</span>}
                </p>
                <p style={{ fontSize: 11, color: "var(--faint)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.major}</p>
              </div>
              {m.primaryRole && <RoleBadge role={m.primaryRole} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {/* Combined skills */}
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 12px 0" }}>Combined skills</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {uniqueByCat.map((g) => (
              <div key={g.cat} style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: "var(--faint)", width: 96, flexShrink: 0, paddingTop: 2 }}>{g.cat}</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, flex: 1 }}>
                  {g.skills.map((s) => (
                    <SkillChip key={s} name={s} category={g.cat} />
                  ))}
                </div>
              </div>
            ))}
            {uniqueByCat.length === 0 && <p style={{ fontSize: 12, color: "var(--faint)", margin: 0 }}>No skills recorded.</p>}
          </div>
        </div>

        {/* Shared availability */}
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 12px 0" }}>Shared availability</h2>
          <div style={{ display: "inline-grid", gridTemplateColumns: "auto repeat(7, 1fr)", gap: 4 }}>
            <div />
            {DAYS.map((d) => (
              <span key={d} style={{ fontSize: 10, color: "var(--faint)", textAlign: "center", width: 28 }}>
                {d[0]}
              </span>
            ))}
            {SLOTS.map((slot) => (
              <Fragment key={slot}>
                <span style={{ fontSize: 10, color: "var(--faint)", paddingRight: 4, display: "flex", alignItems: "center" }}>
                  {slot[0]}
                </span>
                {DAYS.map((d) => {
                  const c = slotCounts[`${d}-${slot}`] || 0;
                  const all = c === members.length && members.length > 0;
                  const some = c > 0 && !all;
                  return (
                    <span
                      key={d + slot}
                      title={`${c}/${members.length} free`}
                      style={{
                        width: 28,
                        height: 20,
                        borderRadius: 4,
                        backgroundColor: all ? "var(--success)" : some ? "var(--warn)" : "var(--surface-2)",
                      }}
                    />
                  );
                })}
              </Fragment>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 11, color: "var(--faint)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: "var(--success)" }} /> All free
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: "var(--warn)" }} /> Some free
            </span>
          </div>
        </div>
      </div>

      {/* Suggested meeting slots */}
      <div className="card" style={{ padding: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: 8 }}>
          <CalendarClock size={16} style={{ color: "var(--primary)" }} /> Suggested meeting slots
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {best.map(([slot, cnt], i) => (
            <div key={slot} style={{ borderRadius: 8, border: "1px solid var(--border)", padding: 12, backgroundColor: "var(--surface-2)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{slot.replace("-", " · ")}</span>
                <Badge variant={i === 0 ? "success" : "neutral"} size="sm">
                  #{i + 1}
                </Badge>
              </div>
              <p style={{ fontSize: 11, color: "var(--faint)", margin: "6px 0 0 0", display: "flex", alignItems: "center", gap: 4 }}>
                <Clock size={11} /> {cnt}/{members.length} members free
              </p>
            </div>
          ))}
          {best.length === 0 && <p style={{ fontSize: 12, color: "var(--faint)", margin: 0 }}>No overlapping slots found.</p>}
        </div>
      </div>

      {/* Announcement */}
      {teamAnnouncement && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Megaphone size={16} style={{ color: "var(--warn)" }} />
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>Message for your team</h2>
          </div>
          <p style={{ fontSize: 13, color: "var(--text)", margin: 0 }}>{teamAnnouncement.body}</p>
          <p style={{ fontSize: 11, color: "var(--faint)", margin: "8px 0 0 0" }}>— {teamAnnouncement.author}</p>
        </div>
      )}

      {/* AI rationale */}
      <div style={{ borderRadius: 12, border: "1px solid #C7D2FE", backgroundColor: "#EEF2FF", padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Sparkles size={16} style={{ color: "#4F46E5" }} />
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "#312E81", margin: 0 }}>Team fit explanation</h2>
        </div>
        <p style={{ fontSize: 13, color: "#3730A3", margin: 0, lineHeight: 1.5 }}>{team.rationale}</p>
      </div>
    </div>
  );
}
