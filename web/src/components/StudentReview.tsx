import React, { Fragment, useEffect, useState } from "react";
import {
  Pencil,
  AlertTriangle,
  CheckCircle2,
  Check,
  Lock,
  PartyPopper,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { useProfileData } from "../hooks/useProfileData";
import { useCohortsData } from "../hooks/useCohortsData";
import { DAYS, SLOTS } from "../types/constants";
import { SKILL_CATEGORIES, Proficiency } from "../types/ui";
import type { StudentIn } from "../types";
import { Avatar, SkillChip, RoleBadge, Button, triggerConfetti } from "./ui";

function EditLink({ route, onNav }: { route: string; onNav?: (r: string) => void }) {
  if (!onNav) return null;
  return (
    <button
      onClick={() => onNav(route)}
      style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 500, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
    >
      Edit <Pencil size={11} />
    </button>
  );
}

function Row({
  title,
  route,
  onNav,
  children,
}: {
  title: string;
  route: string;
  onNav?: (r: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>{title}</h2>
        <EditLink route={route} onNav={onNav} />
      </div>
      {children}
    </div>
  );
}

export default function StudentReview({ navigate }: { navigate?: (r: string) => void }) {
  const { user } = useAuth();
  const { profile } = useProfileData();
  const { cohorts, fetchEnrolledStudents, fetchCohortConstraints } = useCohortsData();

  const activeCohortId = cohorts[0]?.id || "cohort-1";
  const [enrolledStudents, setEnrolledStudents] = useState<StudentIn[]>([]);
  const [mustPair, setMustPair] = useState<string[]>([]);
  const [cannotPair, setCannotPair] = useState<string[]>([]);

  useEffect(() => {
    if (activeCohortId) {
      fetchEnrolledStudents(activeCohortId).then(setEnrolledStudents);
      fetchCohortConstraints(activeCohortId).then((constraints) => {
        const must: string[] = [];
        const cannot: string[] = [];
        constraints.forEach((c) => {
          if (c.type === "must_pair") must.push(c.student_b);
          else if (c.type === "cannot_pair") cannot.push(c.student_b);
        });
        setMustPair(must);
        setCannotPair(cannot);
      });
    }
  }, [activeCohortId, fetchEnrolledStudents, fetchCohortConstraints]);

  const me = {
    studentId: profile?.id || user?.uid || "SE184201",
    name: profile?.name || user?.displayName || "Phạm Thị Hoa",
    major: profile?.major || "Software Engineering",
    year: profile?.year || 3,
    email: profile?.email || user?.email || "hoapt.se1842@fpt.edu.vn",
    bio: (profile as any)?.bio || "Passionate about full-stack web development.",
    skills: (profile?.skills || []).map((sk, i) => ({
      skillId: `sk-${i}`,
      name: sk.name,
      category: "Frontend" as any,
      proficiency: (sk.proficiency || 3) as Proficiency,
    })),
    availability: profile?.availability || [],
    primaryRole: profile?.desired_role || "Developer",
    rankedRoles: ["Developer", "Leader"],
    mustPair,
    cannotPair,
  };
  const [submitted, setSubmitted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // required validation
  const missing: string[] = [];
  if (!me.name) missing.push("Full name");
  if ((me.skills || []).length < 3) missing.push("At least 3 skills");
  if ((me.availability || []).length < 5) missing.push("At least 5 availability slots");
  if (!me.primaryRole) missing.push("Primary role");
  const ready = missing.length === 0;

  const submit = () => {
    setConfirmOpen(false);
    setSubmitted(true);
    triggerConfetti();
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: 480, margin: "64px auto", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
          <PartyPopper size={28} style={{ color: "#059669" }} />
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: 0 }}>Profile submitted!</h1>
        <p style={{ fontSize: 13, color: "var(--faint)", margin: "8px 0 0 0" }}>
          Your profile is now locked and under review. You'll be notified when teams are published.
        </p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 500, color: "var(--primary)", backgroundColor: "#EEF2FF", border: "1px solid #C7D2FE", padding: "8px 12px", borderRadius: 8, marginTop: 20 }}>
          <Lock size={13} /> Contact your lecturer to make further changes.
        </div>
        <div style={{ marginTop: 24 }}>
          <Button onClick={() => navigate?.("student/dashboard")}>Back to dashboard</Button>
        </div>
      </div>
    );
  }

  const availSet = new Set(me.availability || []);

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: 0 }}>Review &amp; Submit</h1>
        <p style={{ fontSize: 13, color: "var(--faint)", margin: "4px 0 0 0" }}>Check everything before submitting for review.</p>
      </div>

      {/* Validation banner */}
      {ready ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", backgroundColor: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "#047857" }}>
          <CheckCircle2 size={16} /> Profile ready to submit
        </div>
      ) : (
        <div style={{ padding: "12px 16px", backgroundColor: "#FFFBEB", border: "1px solid #FEF3C7", borderRadius: 8 }}>
          <p style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, color: "#B45309", margin: 0 }}>
            <AlertTriangle size={16} /> Complete required fields first
          </p>
          <ul style={{ margin: "8px 0 0 24px", padding: 0, fontSize: 12, color: "#B45309" }}>
            {missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      <Row title="Basic Info" route="student/profile" onNav={navigate}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={me.name} size="lg" />
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>{me.name}</p>
            <p style={{ fontSize: 12, color: "var(--faint)", margin: "2px 0 0 0" }}>
              {me.studentId} · {me.major} · Year {me.year}
            </p>
            <p style={{ fontSize: 12, color: "var(--faint)", margin: "2px 0 0 0" }}>{me.email}</p>
          </div>
        </div>
        {me.bio && <p style={{ fontSize: 12, color: "var(--faint)", marginTop: 12 }}>{me.bio}</p>}
      </Row>

      <Row title="Skills" route="student/skills" onNav={navigate}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {SKILL_CATEGORIES.filter((c) => (me.skills || []).some((s) => s.category === c)).map((cat) => (
            <div key={cat} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: "var(--faint)", width: 96 }}>{cat}</span>
              {(me.skills || [])
                .filter((s) => s.category === cat)
                .map((s) => (
                  <SkillChip key={s.skillId} name={s.name} proficiency={s.proficiency} category={s.category} />
                ))}
            </div>
          ))}
          {(me.skills || []).length === 0 && <p style={{ fontSize: 12, color: "var(--faint)", margin: 0 }}>No skills added yet.</p>}
        </div>
      </Row>

      <Row title="Roles" route="student/prefs" onNav={navigate}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, fontSize: 12 }}>
          <span style={{ color: "var(--faint)" }}>Primary:</span>
          {me.primaryRole ? <RoleBadge role={me.primaryRole} /> : <span style={{ color: "var(--faint)" }}>Not selected</span>}
          {(me.rankedRoles || []).length > 0 && (
            <>
              <span style={{ color: "var(--faint)", marginLeft: 8 }}>Open to:</span>
              {(me.rankedRoles || []).map((r) => (
                <RoleBadge key={r} role={r} />
              ))}
            </>
          )}
        </div>
      </Row>

      <Row title="Availability" route="student/avail" onNav={navigate}>
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
              {DAYS.map((d) => (
                <span
                  key={d + slot}
                  style={{
                    width: 28,
                    height: 20,
                    borderRadius: 4,
                    backgroundColor: availSet.has(`${d}-${slot}`) ? "var(--primary)" : "var(--surface-2)",
                  }}
                />
              ))}
            </Fragment>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "var(--faint)", marginTop: 8 }}>{(me.availability || []).length} slots selected</p>
      </Row>

      <Row title="Pairing Preferences" route="student/prefs" onNav={navigate}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12 }}>
          <div>
            <p style={{ color: "var(--success)", fontWeight: 600, margin: "0 0 4px 0" }}>Must Pair</p>
            {(me.mustPair || []).length ? (
              (me.mustPair || []).map((id) => (
                <span key={id} style={{ display: "block", color: "var(--text)" }}>
                  {enrolledStudents.find((s) => s.id === id)?.name || id}
                </span>
              ))
            ) : (
              <span style={{ color: "var(--faint)" }}>None</span>
            )}
          </div>
          <div>
            <p style={{ color: "var(--danger)", fontWeight: 600, margin: "0 0 4px 0" }}>Cannot Pair</p>
            {(me.cannotPair || []).length ? (
              (me.cannotPair || []).map((id) => (
                <span key={id} style={{ display: "block", color: "var(--text)" }}>
                  {enrolledStudents.find((s) => s.id === id)?.name || id}
                </span>
              ))
            ) : (
              <span style={{ color: "var(--faint)" }}>None</span>
            )}
          </div>
        </div>
      </Row>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button size="lg" disabled={!ready} onClick={() => setConfirmOpen(true)}>
          <Check size={16} /> Submit Profile
        </Button>
      </div>

      {confirmOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setConfirmOpen(false)}>
          <div className="card" style={{ width: "100%", maxWidth: 400, padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <AlertTriangle size={18} style={{ color: "#D97706" }} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", margin: 0 }}>Submit your profile?</h3>
            <p style={{ fontSize: 13, color: "var(--faint)", margin: "8px 0 0 0" }}>
              Once submitted, you cannot edit your profile without lecturer permission. Are you sure?
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
              <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submit}>Confirm &amp; Submit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
