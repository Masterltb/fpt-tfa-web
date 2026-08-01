import { useState } from "react";
import { useAuth } from "../lib/auth";

export default function Login() {
  const { mockLogin } = useAuth();
  const [role, setRole] = useState("student");
  const [uid, setUid] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!uid.trim()) return;
    mockLogin(uid.trim(), role);
  }

  return (
    <div style={{ maxWidth: "400px", margin: "4rem auto", padding: "2rem", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2>Sign In (Dev Mode)</h2>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Firebase is not configured, so you are using Mock Auth. Please enter any User ID to log in.
      </p>

      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="uid">User ID</label>
          <input
            id="uid"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            placeholder="e.g. u1, s1, lec1"
            required
          />
        </div>
        
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="role">Role</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: "0.5rem" }}>
            <option value="student">Student</option>
            <option value="lecturer">Lecturer</option>
          </select>
        </div>

        <button type="submit" className="btn btn--primary" style={{ marginTop: "1rem" }}>
          Sign In
        </button>
      </form>
    </div>
  );
}
