import { useEffect, useRef, useState } from "react";
import { Check, Lock, Save, AlertCircle, ChevronDown } from "lucide-react";
import { useAuth } from "../lib/auth";
import { useProfileData } from "../hooks/useProfileData";
import { Button, Spinner, toast } from "./ui";

type SaveState = "saved" | "unsaved" | "saving";

export default function StudentProfile({ navigate: _navigate }: { navigate?: (r: string) => void }) {
  const { user } = useAuth();
  const { profile, loading, saveProfile } = useProfileData();

  const studentId = profile?.id || user?.uid || "SE184201";

  const [form, setForm] = useState({
    name: profile?.name || user?.displayName || "Phạm Thị Hoa",
    email: profile?.email || user?.email || "hoapt.se1842@fpt.edu.vn",
    major: profile?.major || "Software Engineering",
    year: profile?.year || 3,
    experience: profile?.experience_years || 2,
    bio: (profile as any)?.bio || "Passionate about full-stack web development with React & Node.",
  });
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const firstRender = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || user?.displayName || "Phạm Thị Hoa",
        email: profile.email || user?.email || "hoapt.se1842@fpt.edu.vn",
        major: profile.major || "Software Engineering",
        year: profile.year || 3,
        experience: profile.experience_years || 0,
        bio: (profile as any).bio || "",
      });
    }
  }, [profile, user]);

  // autosave
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setSaveState("unsaved");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaveState("saving");
      await saveProfile({
        name: form.name,
        email: form.email,
        major: form.major,
        year: Number(form.year),
        experience_years: Number(form.experience),
        desired_role: profile?.desired_role || "other",
      });
      setSaveState("saved");
    }, 900);
    return () => timer.current && clearTimeout(timer.current);
  }, [form]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const nameValid = form.name.trim().length > 0;

  const set = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!nameValid || !emailValid) {
      toast.error("Please fix validation errors before saving.");
      return;
    }
    setSaveState("saving");
    const success = await saveProfile({
      name: form.name,
      email: form.email,
      major: form.major,
      year: Number(form.year),
      experience_years: Number(form.experience),
      desired_role: profile?.desired_role || "other",
    });
    if (success) {
      setSaveState("saved");
      toast.success("Profile saved to database.");
    } else {
      setSaveState("unsaved");
      toast.error("Failed to save profile.");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid var(--border)",
    backgroundColor: "var(--surface-1)",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    color: "var(--text)",
    outline: "none",
    transition: "all 0.15s ease",
  };

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            Profile {loading && <Spinner size={16} />}
          </h1>
          <p style={{ fontSize: 13, color: "var(--faint)", margin: "4px 0 0 0" }}>Your identity in the cohort. Visible to your lecturer.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500 }}>
          {saveState === "saving" && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--primary)" }}>
              <Spinner size={13} /> Saving…
            </span>
          )}
          {saveState === "saved" && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--success)" }}>
              <Check size={14} /> All changes saved
            </span>
          )}
          {saveState === "unsaved" && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--warn)" }}>
              <AlertCircle size={14} /> Unsaved changes
            </span>
          )}
        </div>
      </div>

      {/* Status banner */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", backgroundColor: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 8, fontSize: 12, color: "#3730A3" }}>
        <Lock size={14} style={{ marginTop: 2, flexShrink: 0, color: "#4F46E5" }} />
        <p style={{ margin: 0 }}>
          Your profile is currently a <strong>draft</strong>. You can edit freely until you submit it for review.
        </p>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--faint)", marginBottom: 6 }}>Full Name</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} style={inputStyle} />
            {!nameValid && <p style={{ fontSize: 11, color: "var(--danger)", margin: "4px 0 0 0" }}>Name is required.</p>}
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--faint)", marginBottom: 6 }}>Student ID</label>
            <input
              value={studentId}
              readOnly
              style={{ ...inputStyle, backgroundColor: "var(--surface-2)", color: "var(--faint)", cursor: "not-allowed", fontFamily: "monospace" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--faint)", marginBottom: 6 }}>Email Address</label>
            <input value={form.email} onChange={(e) => set("email", e.target.value)} style={inputStyle} />
            {!emailValid && <p style={{ fontSize: 11, color: "var(--danger)", margin: "4px 0 0 0" }}>Enter a valid email address.</p>}
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--faint)", marginBottom: 6 }}>Major / Programme</label>
            <input value={form.major} onChange={(e) => set("major", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--faint)", marginBottom: 6 }}>Year of Study</label>
            <div style={{ position: "relative" }}>
              <select
                value={form.year}
                onChange={(e) => set("year", Number(e.target.value))}
                style={{ ...inputStyle, appearance: "none", paddingRight: 36, cursor: "pointer" }}
              >
                {[1, 2, 3, 4].map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--faint)", pointerEvents: "none" }} />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--faint)", marginBottom: 6 }}>Years of Experience</label>
            <div style={{ position: "relative" }}>
              <select
                value={form.experience}
                onChange={(e) => set("experience", Number(e.target.value))}
                style={{ ...inputStyle, appearance: "none", paddingRight: 36, cursor: "pointer" }}
              >
                {[0, 1, 2, 3, 4, 5].map((y) => (
                  <option key={y} value={y}>
                    {y === 0 ? "Less than 1 year" : `${y}${y === 5 ? "+" : ""} year${y > 1 ? "s" : ""}`}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--faint)", pointerEvents: "none" }} />
            </div>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--faint)", marginBottom: 6 }}>Short Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => set("bio", e.target.value.slice(0, 150))}
              rows={3}
              style={{ ...inputStyle, resize: "none" }}
              placeholder="Tell your team a little about yourself…"
            />
            <p style={{ fontSize: 11, color: "var(--faint)", margin: "4px 0 0 0", textAlign: "right" }}>{form.bio.length}/150</p>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <Button onClick={handleSave}>
            <Save size={15} /> Save
          </Button>
        </div>
      </div>
    </div>
  );
}
