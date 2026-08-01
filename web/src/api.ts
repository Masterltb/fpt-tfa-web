import type { Formation, RunFormationIn, Constraint, Cohort, StudentIn } from "./types";

export interface Auth {
  token: string;
}

/** Run a formation. Auth is sent as headers (dev stub; replaced by a bearer JWT in prod). */
export async function runFormation(
  cohortId: string,
  body: RunFormationIn,
  auth: Auth,
): Promise<Formation> {
  const res = await fetch(`/v1/cohorts/${encodeURIComponent(cohortId)}/formations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail: unknown = {};
    try {
      detail = await res.json();
    } catch {
      detail = {};
    }
    throw new Error(`Formation failed (${res.status}): ${JSON.stringify(detail)}`);
  }
  return (await res.json()) as Formation;
}

export async function overrideFormation(
  formationId: string,
  teams: { id: string; member_ids: string[]; rationale: string }[],
  auth: Auth,
): Promise<void> {
  const res = await fetch(`/v1/formations/${encodeURIComponent(formationId)}/override`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.token}`,
    },
    body: JSON.stringify({ teams }),
  });
  if (!res.ok) {
    throw new Error(`Override failed (${res.status})`);
  }
}

export async function commitFormation(
  formationId: string,
  auth: Auth,
): Promise<void> {
  const res = await fetch(`/v1/formations/${encodeURIComponent(formationId)}/commit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Commit failed (${res.status})`);
  }
}

export async function getFormation(
  formationId: string,
  auth: Auth,
): Promise<Formation> {
  const res = await fetch(`/v1/formations/${encodeURIComponent(formationId)}`, {
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to get formation");
  return (await res.json()) as Formation;
}


export async function getConstraints(
  cohortId: string,
  auth: Auth,
): Promise<Constraint[]> {
  const res = await fetch(`/v1/cohorts/${encodeURIComponent(cohortId)}/constraints`, {
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to get constraints");
  const data = await res.json();
  return data.constraints as Constraint[];
}

export async function approveConstraint(
  cohortId: string,
  constraintId: string,
  auth: Auth,
): Promise<void> {
  const res = await fetch(`/v1/cohorts/${encodeURIComponent(cohortId)}/constraints/${encodeURIComponent(constraintId)}/approve`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to approve constraint");
}

export async function rejectConstraint(
  cohortId: string,
  constraintId: string,
  auth: Auth,
): Promise<void> {
  const res = await fetch(`/v1/cohorts/${encodeURIComponent(cohortId)}/constraints/${encodeURIComponent(constraintId)}/reject`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to reject constraint");
}

export async function getCohorts(auth: Auth): Promise<Cohort[]> {
  const res = await fetch("/v1/cohorts", {
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to get cohorts");
  const data = await res.json();
  return data.cohorts as Cohort[];
}

export const listCohorts = getCohorts;


export async function createCohort(name: string, auth: Auth): Promise<Cohort> {
  const res = await fetch("/v1/cohorts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.token}`,
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to create cohort");
  return await res.json() as Cohort;
}

export async function getProfile(auth: Auth): Promise<StudentIn> {
  const res = await fetch("/v1/profiles/me", {
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
  });
  if (!res.ok) throw new Error(`Failed to get profile (${res.status})`);
  return await res.json() as StudentIn;
}

export async function updateProfile(profile: Omit<StudentIn, "id">, auth: Auth): Promise<void> {
  const res = await fetch("/v1/profiles/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.token}`,
    },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error("Failed to update profile");
}

export async function enrollInCohort(cohortId: string, auth: Auth): Promise<void> {
  const res = await fetch(`/v1/cohorts/${encodeURIComponent(cohortId)}/enroll`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to enroll in cohort");
}

export async function getEnrolledStudents(cohortId: string, auth: Auth): Promise<StudentIn[]> {
  const res = await fetch(`/v1/cohorts/${encodeURIComponent(cohortId)}/students`, {
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to get enrolled students");
  const data = await res.json();
  return data.students as StudentIn[];
}


export async function addConstraint(cohortId: string, type: string, targetStudentId: string, auth: Auth): Promise<void> {
  const res = await fetch(`/v1/cohorts/${encodeURIComponent(cohortId)}/constraints`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.token}`,
    },
    body: JSON.stringify({ type, target_student_id: targetStudentId }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function updateConstraintStatus(cohortId: string, constraintId: string, status: string, auth: Auth): Promise<void> {
  const res = await fetch(`/v1/cohorts/${encodeURIComponent(cohortId)}/constraints/${encodeURIComponent(constraintId)}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.token}`,
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(await res.text());
}

