import { useState, useEffect } from "react";
import { getCohorts, createCohort } from "../api";
import type { Cohort } from "../types";
import { UsersIcon, PlayIcon } from "./icons";
import { useAuth } from "../lib/auth";

export default function Dashboard({ onSelectCohort }: { onSelectCohort: (cohortId: string) => void }) {
  const { token } = useAuth();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [newCohortName, setNewCohortName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCohorts();
  }, [token]);

  async function loadCohorts() {
    setLoading(true);
    try {
      const data = await getCohorts({ token: token! });
      setCohorts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newCohortName.trim()) return;
    try {
      await createCohort(newCohortName, { token: token! });
      setNewCohortName("");
      await loadCohorts();
    } catch (err) {
      alert("Failed to create cohort: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  return (
    <section className="panel" aria-labelledby="dashboard-heading">
      <h2 id="dashboard-heading">
        <UsersIcon size={15} /> Lecturer Dashboard
      </h2>
      <p className="panel__hint">Manage your classes/cohorts and start team formations.</p>

      {error && <p className="alert" role="alert">{error}</p>}
      
      <div style={{ marginTop: "1rem" }}>
        <h3>Your Cohorts</h3>
        {loading ? (
          <p><span className="spinner" aria-hidden="true" /> Loading cohorts...</p>
        ) : cohorts.length === 0 ? (
          <p className="empty">You haven't created any cohorts yet.</p>
        ) : (
          <ul className="teams" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {cohorts.map((c) => (
              <li key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "white", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)" }}>
                <div>
                  <strong>{c.name}</strong> <br/>
                  <small style={{ color: "#666" }}>ID: {c.id}</small>
                </div>
                <button type="button" className="btn btn--primary" onClick={() => onSelectCohort(c.id)}>
                  <PlayIcon /> Manage
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: "2rem", borderTop: "1px solid rgba(0,0,0,0.1)", paddingTop: "1rem" }}>
        <h3>Create New Cohort</h3>
        <form onSubmit={handleCreate} style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
          <div className="field" style={{ flex: 1, margin: 0 }}>
            <label htmlFor="cohortName">Cohort Name</label>
            <input 
              id="cohortName" 
              value={newCohortName} 
              onChange={(e) => setNewCohortName(e.target.value)} 
              placeholder="e.g., Capstone Project 2026"
            />
          </div>
          <button type="submit" className="btn btn--primary" disabled={!newCohortName.trim()}>
            Create
          </button>
        </form>
      </div>
    </section>
  );
}
