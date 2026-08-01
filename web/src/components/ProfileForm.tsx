import { useState, useEffect } from "react";
import { DEFAULT_ROLE_SUGGESTIONS } from "../types";
import type { Role, SkillIn } from "../types";
import { UsersIcon, CheckIcon } from "./icons";
import { getProfile, updateProfile, enrollInCohort } from "../api";
import { useAuth } from "../lib/auth";
import StudentConstraints from "./StudentConstraints";

export default function ProfileForm() {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [major, setMajor] = useState("");
  const [experience, setExperience] = useState(0);
  const [desiredRole, setDesiredRole] = useState<Role>("member");
  const [skills, setSkills] = useState<SkillIn[]>([]);
  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState(3);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Enrollment state
  const [cohortId, setCohortId] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [enrollMsg, setEnrollMsg] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    try {
      const p = await getProfile({ token: token! });
      setName(p.name);
      setMajor(p.major || "");
      setExperience(p.experience_years);
      setDesiredRole(p.desired_role);
      setSkills(p.skills || []);
    } catch (err) {
      console.log("No existing profile or error:", err);
    } finally {
      setLoading(false);
    }
  }

  function addSkill() {
    if (!skillName.trim()) return;
    setSkills([...skills, { name: skillName.trim(), proficiency: skillLevel }]);
    setSkillName("");
    setSkillLevel(3);
    setSaved(false);
  }

  function removeSkill(index: number) {
    setSkills(skills.filter((_, i) => i !== index));
    setSaved(false);
  }

  async function onSave() {
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile({
        name,
        major,
        experience_years: experience,
        desired_role: desiredRole,
        availability: [], // Simplified for now
        skills
      }, { token: token! });
      setSaved(true);
    } catch (err) {
      alert("Error saving profile: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  }

  async function onEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!cohortId.trim()) return;
    setEnrolling(true);
    setEnrollMsg("");
    try {
      await enrollInCohort(cohortId.trim(), { token: token! });
      setEnrollMsg("✅ Enrolled successfully!");
      setCohortId("");
    } catch (err) {
      setEnrollMsg("❌ Failed to enroll: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) {
    return <section className="panel"><p>Loading profile...</p></section>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <section className="panel" aria-labelledby="profile-heading">
        <h2 id="profile-heading">
          <UsersIcon size={16} /> My Profile
        </h2>
        <p className="panel__hint">Your skills and availability feed the AI suggestions.</p>

        <div className="field field--row">
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" value={name} onChange={(e) => {setName(e.target.value); setSaved(false);}} />
          </div>
          <div className="field">
            <label htmlFor="major">Major</label>
            <input id="major" value={major} onChange={(e) => {setMajor(e.target.value); setSaved(false);}} placeholder="e.g. Computer Science" />
          </div>
        </div>

        <div className="field field--row">
          <div className="field">
            <label htmlFor="experience">Experience (years)</label>
            <input
              id="experience" type="number" inputMode="numeric" min={0}
              value={experience} onChange={(e) => {setExperience(Number(e.target.value)); setSaved(false);}}
            />
          </div>
          <div className="field">
            <label htmlFor="role">Desired role</label>
            <input
              id="role" list="role-suggestions" value={desiredRole}
              onChange={(e) => {setDesiredRole(e.target.value); setSaved(false);}} placeholder="e.g. researcher…"
            />
            <datalist id="role-suggestions">
              {DEFAULT_ROLE_SUGGESTIONS.map((r) => <option key={r} value={r} />)}
            </datalist>
          </div>
        </div>

        <fieldset>
          <legend>Skills</legend>
          <div className="field field--row">
            <div className="field">
              <label htmlFor="skill-name">Skill</label>
              <input id="skill-name" value={skillName} onChange={(e) => setSkillName(e.target.value)} placeholder="e.g. data analysis…" />
            </div>
            <div className="field">
              <label htmlFor="skill-level">Proficiency (1–5)</label>
              <input
                id="skill-level" type="number" inputMode="numeric" min={1} max={5}
                value={skillLevel} onChange={(e) => setSkillLevel(Number(e.target.value))}
              />
            </div>
          </div>
          <button type="button" className="btn btn--ghost" onClick={addSkill}>
            Add Skill
          </button>
          {skills.length > 0 && (
            <ul className="chips" aria-label="added skills" style={{ marginTop: "1rem" }}>
              {skills.map((s, i) => (
                <li key={`${s.name}-${i}`} style={{ cursor: "pointer" }} onClick={() => removeSkill(i)} title="Click to remove">
                  {s.name} · {s.proficiency} &times;
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginTop: "1rem" }}>
          <button type="button" className="btn btn--primary" onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
          {saved && <span style={{ color: "green", fontSize: "0.9rem" }}><CheckIcon /> Profile saved</span>}
        </div>
      </section>

      <section className="panel" aria-labelledby="enroll-heading">
        <h2 id="enroll-heading">Join a Cohort / Class</h2>
        <p className="panel__hint">Enter the Cohort ID provided by your lecturer to join.</p>
        <form onSubmit={onEnroll} style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
          <div className="field" style={{ flex: 1, margin: 0 }}>
            <label htmlFor="cohortId">Cohort ID</label>
            <input id="cohortId" value={cohortId} onChange={(e) => setCohortId(e.target.value)} placeholder="e.g. c1" />
          </div>
          <button type="submit" className="btn btn--primary" disabled={enrolling || !cohortId.trim()}>
            {enrolling ? "Joining..." : "Join"}
          </button>
        </form>
        {enrollMsg && <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>{enrollMsg}</p>}
      </section>

      <StudentConstraints />
    </div>
  );
}
