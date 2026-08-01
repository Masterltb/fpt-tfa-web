import { useEffect, useState } from "react";
import { Check, AlertTriangle, Copy, X } from "lucide-react";
import { useProfileData } from "../hooks/useProfileData";
import { DAYS, SLOTS, SLOT_LABELS } from "../types/constants";
import { Button } from "./ui";

export default function StudentAvailability({ navigate: _navigate }: { navigate?: (r: string) => void }) {
  const { profile, saveProfile } = useProfileData();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dragging, setDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"add" | "remove">("add");
  const [copyFrom, setCopyFrom] = useState<string | null>(null);
  const [copyTargets, setCopyTargets] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (profile && profile.availability) {
      setSelected(new Set(profile.availability));
    }
  }, [profile]);

  const persistAvailability = async (nextSet: Set<string>) => {
    await saveProfile({ availability: Array.from(nextSet) });
  };

  const key = (d: string, s: string) => `${d}-${s}`;

  const apply = (k: string, mode: "add" | "remove") =>
    setSelected((prev) => {
      const n = new Set(prev);
      mode === "add" ? n.add(k) : n.delete(k);
      return n;
    });

  const onDown = (k: string) => {
    const mode = selected.has(k) ? "remove" : "add";
    setDragMode(mode);
    setDragging(true);
    apply(k, mode);
  };
  const onEnter = (k: string) => dragging && apply(k, dragMode);

  const handleDragEnd = () => {
    if (dragging) {
      setDragging(false);
      persistAvailability(selected);
    }
  };

  const clearDay = (d: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      SLOTS.forEach((s) => n.delete(key(d, s)));
      persistAvailability(n);
      return n;
    });

  const doCopy = () => {
    if (!copyFrom) return;
    const srcSlots = SLOTS.filter((s) => selected.has(key(copyFrom, s)));
    setSelected((prev) => {
      const n = new Set(prev);
      copyTargets.forEach((d) => {
        SLOTS.forEach((s) => n.delete(key(d, s)));
        srcSlots.forEach((s) => n.add(key(d, s)));
      });
      persistAvailability(n);
      return n;
    });
    setCopyFrom(null);
    setCopyTargets(new Set());
  };

  const count = selected.size;
  const low = count < 5;

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: 20 }} onMouseUp={handleDragEnd} onMouseLeave={handleDragEnd}>
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: 0 }}>Weekly Availability</h1>
        <p style={{ fontSize: 13, color: "var(--faint)", margin: "4px 0 0 0" }}>Click or drag to mark when you're free for team work.</p>
      </div>

      <div className="card" style={{ padding: 20, userSelect: "none" }}>
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 560 }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "110px repeat(7, 1fr)", gap: 6, marginBottom: 6 }}>
              <div />
              {DAYS.map((d) => (
                <div key={d} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0 }}>{d}</p>
                  <button
                    onClick={() => clearDay(d)}
                    style={{ fontSize: 11, color: "var(--faint)", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 2 }}
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => {
                      setCopyFrom(d);
                      setCopyTargets(new Set());
                    }}
                    style={{ marginLeft: 6, fontSize: 11, color: "var(--faint)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "inline-flex" }}
                    title={`Copy ${d} schedule`}
                  >
                    <Copy size={11} />
                  </button>
                </div>
              ))}
            </div>

            {/* Rows */}
            {SLOTS.map((slot) => (
              <div key={slot} style={{ display: "grid", gridTemplateColumns: "110px repeat(7, 1fr)", gap: 6, marginBottom: 6 }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "right", paddingRight: 8 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text)", margin: 0 }}>{slot}</p>
                  <p style={{ fontSize: 11, color: "var(--faint)", margin: 0 }}>{(SLOT_LABELS as Record<string, string>)[slot]}</p>
                </div>
                {DAYS.map((d) => {
                  const k = key(d, slot);
                  const active = selected.has(k);
                  return (
                    <button
                      key={k}
                      onMouseDown={() => onDown(k)}
                      onMouseEnter={() => onEnter(k)}
                      style={{
                        height: 44,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: active ? "1px solid transparent" : "1px dashed var(--border-strong)",
                        backgroundColor: active ? "var(--primary)" : "var(--surface-2)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {active && <Check size={14} style={{ color: "#FFFFFF" }} strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--primary)", backgroundColor: "var(--surface-2)", padding: "6px 12px", borderRadius: 8 }}>
            {count} slots selected
          </span>
          <Button variant="secondary" size="sm" onClick={() => setSelected(new Set())}>
            Clear all
          </Button>
          {low && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: "var(--warn)", backgroundColor: "var(--surface-2)", border: "1px solid var(--warn)", padding: "6px 12px", borderRadius: 8, marginLeft: "auto" }}>
              <AlertTriangle size={14} /> Low availability may limit team options
            </span>
          )}
        </div>
      </div>

      {/* Copy modal */}
      {copyFrom && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onMouseDown={() => setCopyFrom(null)}>
          <div className="card" style={{ width: "100%", maxWidth: 360, padding: 0 }} onMouseDown={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>Copy {copyFrom} schedule to…</h3>
              <button onClick={() => setCopyFrom(null)} style={{ color: "var(--faint)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              {DAYS.filter((d) => d !== copyFrom).map((d) => (
                <label key={d} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={copyTargets.has(d)}
                    onChange={() =>
                      setCopyTargets((t) => {
                        const n = new Set(t);
                        n.has(d) ? n.delete(d) : n.add(d);
                        return n;
                      })
                    }
                    style={{ width: 16, height: 16, accentColor: "var(--primary)" }}
                  />
                  {d}
                </label>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "16px 20px", borderTop: "1px solid var(--border)" }}>
              <Button variant="secondary" size="sm" onClick={() => setCopyFrom(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={doCopy} disabled={copyTargets.size === 0}>
                Copy to {copyTargets.size} day{copyTargets.size !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
