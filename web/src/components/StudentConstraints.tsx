import { useState } from "react";
import { getConstraints, addConstraint } from "../api";
import { useAuth } from "../lib/auth";
import type { Constraint } from "../types";

export default function StudentConstraints() {
  const { token } = useAuth();
  const [cohortId, setCohortId] = useState("");
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [targetId, setTargetId] = useState("");
  const [type, setType] = useState("must_pair");

  async function loadConstraints(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!cohortId.trim()) return;
    setLoading(true);
    setMsg("");
    try {
      const data = await getConstraints(cohortId.trim(), { token: token! });
      setConstraints(data);
    } catch (err) {
      setMsg("Error loading constraints: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!cohortId.trim() || !targetId.trim()) return;
    try {
      await addConstraint(cohortId.trim(), type, targetId.trim(), { token: token! });
      setTargetId("");
      await loadConstraints();
      setMsg("✅ Constraint added successfully!");
    } catch (err) {
      setMsg("❌ Error adding constraint: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  return (
    <section className="panel" style={{ marginTop: "2rem" }}>
      <h2>Team Preferences (Constraints)</h2>
      <p className="panel__hint">Request to pair or avoid pairing with specific students in a cohort.</p>

      <form onSubmit={loadConstraints} style={{ display: "flex", gap: "1rem", alignItems: "flex-end", marginBottom: "1.5rem" }}>
        <div className="field" style={{ flex: 1, margin: 0 }}>
          <label>Cohort ID</label>
          <input value={cohortId} onChange={e => setCohortId(e.target.value)} placeholder="Enter Cohort ID to view preferences" />
        </div>
        <button type="submit" className="btn btn--ghost" disabled={loading}>Load</button>
      </form>

      {msg && <p className="alert" style={{ marginBottom: "1rem" }}>{msg}</p>}

      {constraints.length > 0 && (
        <ul className="teams" style={{ marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {constraints.map(c => (
            <li key={c.id} style={{ padding: "0.8rem", background: "white", borderRadius: "8px", border: "1px solid #ddd" }}>
              <strong>Type:</strong> <span className={`badge ${c.type === 'must_pair' ? 'badge--success' : 'badge--error'}`}>{c.type}</span> <br/>
              <strong>Target Student ID:</strong> {c.student_b} <br/>
              <strong>Status:</strong> {c.status}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} style={{ display: "flex", gap: "1rem", alignItems: "flex-end", background: "#f9fafb", padding: "1rem", borderRadius: "8px", border: "1px solid #eee" }}>
        <div className="field" style={{ flex: 1, margin: 0 }}>
          <label>Target Student ID</label>
          <input value={targetId} onChange={e => setTargetId(e.target.value)} placeholder="e.g. u2" required />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Type</label>
          <select value={type} onChange={e => setType(e.target.value)} style={{ padding: "0.5rem" }}>
            <option value="must_pair">Must Pair</option>
            <option value="cannot_pair">Cannot Pair</option>
          </select>
        </div>
        <button type="submit" className="btn btn--primary">Request</button>
      </form>
    </section>
  );
}
