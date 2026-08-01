import { useEffect, useMemo, useState } from "react";
import { Search, Plus, X, ChevronDown, ChevronRight, FileText } from "lucide-react";
import { useProfileData } from "../hooks/useProfileData";
import { SKILL_CATALOG } from "../types/constants";
import { SKILL_CATEGORIES, SkillCategory, StudentSkill, Proficiency } from "../types/ui";
import { proficiencyLabel, EmptyState, toast } from "./ui";

export default function StudentSkills({ navigate: _navigate }: { navigate?: (r: string) => void }) {
  const { profile, saveProfile } = useProfileData();

  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [expanded, setExpanded] = useState<Set<SkillCategory>>(new Set(SKILL_CATEGORIES));
  const [globalSearch, setGlobalSearch] = useState("");
  const [addingIn, setAddingIn] = useState<SkillCategory | null>(null);
  const [addQuery, setAddQuery] = useState("");
  const [evidenceOpen, setEvidenceOpen] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (profile && profile.skills) {
      const mapped: StudentSkill[] = profile.skills.map((sk, i) => {
        const found = SKILL_CATALOG.find((c) => c.name.toLowerCase() === sk.name.toLowerCase());
        return {
          skillId: found?.id || `sk-custom-${i}`,
          name: sk.name,
          category: (found?.category || "Frontend") as SkillCategory,
          proficiency: (sk.proficiency || 3) as Proficiency,
        };
      });
      setSkills(mapped);
      setExpanded(new Set(SKILL_CATEGORIES.filter((c) => mapped.some((s) => s.category === c))));
    }
  }, [profile]);

  const persistSkills = async (next: StudentSkill[]) => {
    await saveProfile({
      skills: next.map((s) => ({
        name: s.name,
        proficiency: s.proficiency || 3,
      })),
    });
  };

  const addSkill = (name: string, category: SkillCategory) => {
    const sk = SKILL_CATALOG.find((s) => s.name === name && s.category === category);
    if (!sk) return;
    if (skills.some((s) => s.skillId === sk.id)) {
      toast.error("Skill already added.");
      return;
    }
    const next: StudentSkill[] = [...skills, { skillId: sk.id, name: sk.name, category: sk.category, proficiency: 3 }];
    setSkills(next);
    persistSkills(next);
    setAddQuery("");
    setAddingIn(null);
    setExpanded((e) => new Set(e).add(category));
  };

  const remove = (id: string) => {
    const next = skills.filter((s) => s.skillId !== id);
    setSkills(next);
    persistSkills(next);
  };

  const setProf = (id: string, prof: Proficiency) => {
    const next = skills.map((s) => (s.skillId === id ? { ...s, proficiency: prof } : s));
    setSkills(next);
    persistSkills(next);
  };

  const setEvidence = (id: string, text: string) =>
    setSkills((p) => p.map((s) => (s.skillId === id ? { ...s, evidence: text } : s)));

  const toggleCat = (c: SkillCategory) =>
    setExpanded((e) => {
      const n = new Set(e);
      n.has(c) ? n.delete(c) : n.add(c);
      return n;
    });

  const globalResults = useMemo(() => {
    if (!globalSearch) return [];
    return SKILL_CATALOG.filter(
      (s) =>
        s.name.toLowerCase().includes(globalSearch.toLowerCase()) &&
        !skills.some((sk) => sk.skillId === s.id)
    ).slice(0, 8);
  }, [globalSearch, skills]);

  const coveredCats = new Set(skills.map((s) => s.category)).size;

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: 0 }}>Skills &amp; Proficiency</h1>
        <p style={{ fontSize: 13, color: "var(--faint)", margin: "4px 0 0 0" }}>
          Rate each skill honestly — the optimizer uses this to balance your team.
        </p>
      </div>

      {/* Summary + global search */}
      <div className="card" style={{ padding: 16, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", gap: 24 }}>
          <div>
            <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>{skills.length}</p>
            <p style={{ fontSize: 12, color: "var(--faint)", margin: 0 }}>Total skills</p>
          </div>
          <div>
            <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>
              {coveredCats}
              <span style={{ fontSize: 13, color: "var(--faint)", fontWeight: 400 }}>/{SKILL_CATEGORIES.length}</span>
            </p>
            <p style={{ fontSize: 12, color: "var(--faint)", margin: 0 }}>Categories</p>
          </div>
        </div>
        <div style={{ position: "relative", flex: "1 1 240px", maxWidth: 320 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--faint)" }} />
          <input
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search all skills…"
            style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px 8px 34px", fontSize: 13, backgroundColor: "var(--surface-1)", color: "var(--text)", outline: "none" }}
          />
          {globalResults.length > 0 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, backgroundColor: "#FFFFFF", border: "1px solid var(--border)", borderRadius: 8, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", zIndex: 20, overflow: "hidden" }}>
              {globalResults.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    addSkill(s.name, s.category);
                    setGlobalSearch("");
                  }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", fontSize: 13, textAlign: "left", background: "none", border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer", color: "var(--text)" }}
                >
                  <Plus size={12} style={{ color: "var(--faint)" }} />
                  <span>{s.name}</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--faint)" }}>{s.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Categories */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {SKILL_CATEGORIES.map((cat) => {
          const catSkills = skills.filter((s) => s.category === cat);
          const isOpen = expanded.has(cat);
          const catalogForCat = SKILL_CATALOG.filter(
            (s) =>
              s.category === cat &&
              !skills.some((sk) => sk.skillId === s.id) &&
              (addQuery === "" || s.name.toLowerCase().includes(addQuery.toLowerCase()))
          );
          return (
            <div key={cat} className="card" style={{ padding: 0 }}>
              <button
                onClick={() => toggleCat(cat)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
              >
                {isOpen ? <ChevronDown size={15} style={{ color: "var(--faint)" }} /> : <ChevronRight size={15} style={{ color: "var(--faint)" }} />}
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{cat}</span>
                <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 999, border: "1px solid var(--border)", backgroundColor: "var(--surface-2)", color: "var(--faint)" }}>
                  {catSkills.length}
                </span>
              </button>

              {isOpen && (
                <div style={{ padding: "0 16px 16px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {catSkills.length === 0 && (
                    <p style={{ fontSize: 12, color: "var(--faint)", margin: "4px 0" }}>No skills yet in {cat}. Add one below.</p>
                  )}
                  {catSkills.map((skill) => (
                    <div key={skill.skillId} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12, backgroundColor: "var(--surface-2)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", width: 160, flexShrink: 0 }}>{skill.name}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, flex: "1 1 120px" }}>
                          {([1, 2, 3, 4, 5] as Proficiency[]).map((n) => (
                            <button
                              key={n}
                              onClick={() => setProf(skill.skillId, n)}
                              title={proficiencyLabel(n)}
                              style={{ height: 8, flex: 1, borderRadius: 999, border: "none", cursor: "pointer", backgroundColor: n <= skill.proficiency ? "var(--primary)" : "var(--border-strong)", transition: "all 0.15s ease" }}
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)", width: 90, textAlign: "right", flexShrink: 0 }}>
                          {proficiencyLabel(skill.proficiency)}
                        </span>
                        <button
                          onClick={() =>
                            setEvidenceOpen((e) => {
                              const n = new Set(e);
                              n.has(skill.skillId) ? n.delete(skill.skillId) : n.add(skill.skillId);
                              return n;
                            })
                          }
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--faint)" }}
                          title="Add evidence"
                        >
                          <FileText size={14} />
                        </button>
                        <button onClick={() => remove(skill.skillId)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--faint)" }}>
                          <X size={15} />
                        </button>
                      </div>
                      {evidenceOpen.has(skill.skillId) && (
                        <textarea
                          value={skill.evidence ?? ""}
                          onChange={(e) => setEvidence(skill.skillId, e.target.value)}
                          placeholder="Optional: describe projects or coursework that demonstrate this skill…"
                          rows={2}
                          style={{ width: "100%", marginTop: 8, border: "1px solid var(--border)", borderRadius: 6, padding: "6px 10px", fontSize: 12, resize: "none", backgroundColor: "var(--surface-1)", color: "var(--text)" }}
                        />
                      )}
                    </div>
                  ))}

                  {/* Add skill in category */}
                  {addingIn === cat ? (
                    <div style={{ position: "relative", marginTop: 4 }}>
                      <input
                        autoFocus
                        value={addQuery}
                        onChange={(e) => setAddQuery(e.target.value)}
                        onBlur={() => setTimeout(() => setAddingIn(null), 150)}
                        placeholder={`Search ${cat} skills…`}
                        style={{ width: "100%", border: "1px solid var(--primary)", borderRadius: 8, padding: "6px 10px", fontSize: 13, backgroundColor: "var(--surface-1)", color: "var(--text)", outline: "none" }}
                      />
                      {catalogForCat.length > 0 && (
                        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, backgroundColor: "#FFFFFF", border: "1px solid var(--border)", borderRadius: 8, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", zIndex: 20, maxHeight: 180, overflowY: "auto" }}>
                          {catalogForCat.map((s) => (
                            <button
                              key={s.id}
                              onMouseDown={() => addSkill(s.name, cat)}
                              style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", fontSize: 13, textAlign: "left", background: "none", border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer", color: "var(--text)" }}
                            >
                              <Plus size={12} style={{ color: "var(--faint)" }} /> {s.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAddingIn(cat);
                        setAddQuery("");
                      }}
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: "var(--primary)", background: "none", border: "1px dashed var(--border-strong)", borderRadius: 6, padding: "6px 10px", cursor: "pointer", width: "fit-content", marginTop: 4 }}
                    >
                      <Plus size={13} /> Add skill
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {skills.length === 0 && (
        <EmptyState
          icon={<Search size={20} />}
          title="No skills added yet"
          description="Use the search bar or expand a category to start adding your skills."
        />
      )}
    </div>
  );
}
