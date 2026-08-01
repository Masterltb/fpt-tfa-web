/**
 * TFA API Client — Interacts with FastAPI backend REST API (v1.0.0).
 */

const API_BASE = "/api/v1";

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
  traceId?: string;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    // Default fallback dev token
    headers["Authorization"] = "Bearer eyJ1aWQiOiJzdHUtMDAxIiwgInJvbGUiOiAic3R1ZGVudCJ9";
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "API Request Failed";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
    } catch {
      // Ignore JSON parse error
    }
    throw new Error(`HTTP ${response.status}: ${errorDetail}`);
  }

  const json = await response.json();
  return (json.data !== undefined ? json.data : json) as T;
}

// ---------------------------------------------------------------------------
// API Methods
// ---------------------------------------------------------------------------

export const ApiClient = {
  // Auth
  login: (email: string, pass: string) =>
    apiFetch<{ access_token: string; user: { id: string; role: string } }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password: pass }) }
    ),

  getMe: (token?: string) => apiFetch<{ id: string; email: string; role: string }>("/auth/me", {}, token),

  // Academic Catalogs
  getCampuses: () => apiFetch<Array<{ id: string; code: string; name: string }>>("/campuses"),
  getTerms: () => apiFetch<Array<{ id: string; name: string; status: string }>>("/terms"),
  getMajors: () => apiFetch<Array<{ id: string; code: string; name: string }>>("/majors"),
  getCourses: () => apiFetch<Array<{ id: string; code: string; name: string }>>("/courses"),
  getSections: () => apiFetch<Array<{ id: string; code: string; status: string }>>("/sections"),

  // Student Profile & Team DNA
  getStudentDashboard: (token?: string) => apiFetch<any>("/students/me/dashboard", {}, token),
  getTeamProfile: (token?: string) => apiFetch<any>("/students/me/team-profile", {}, token),
  updateTeamProfile: (payload: any, token?: string) =>
    apiFetch<any>("/students/me/team-profile", { method: "PUT", body: JSON.stringify(payload) }, token),

  // Grouping Sessions & Lecturer
  getGroupingSessions: () => apiFetch<Array<any>>("/grouping-sessions"),
  createMatchRun: (sessionId: string, seed: number = 42) =>
    apiFetch<any>(`/grouping-sessions/${sessionId}/match-runs`, {
      method: "POST",
      body: JSON.stringify({ seed, time_limit_seconds: 5.0 }),
    }),
  getReviewBoard: (sessionId: string) => apiFetch<any>(`/grouping-sessions/${sessionId}/review-board`),
  publishSession: (sessionId: string) =>
    apiFetch<any>(`/grouping-sessions/${sessionId}/publish`, { method: "POST" }),
};
