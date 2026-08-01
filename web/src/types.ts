// Desired role is free-form and configured per course/project (not software-specific).
// These are only generic default suggestions (A-04, needs confirmation).
export type Role = string;
export const DEFAULT_ROLE_SUGGESTIONS: string[] = [
  "leader",
  "coordinator",
  "researcher",
  "presenter",
  "member",
  "other",
];

export interface SkillIn {
  name: string;
  proficiency: number;
}

export interface StudentIn {
  id: string;
  name: string;
  email?: string;
  major?: string;
  year?: number;
  availability?: string[];
  skills: SkillIn[];
  experience_years: number;
  desired_role: string;
}

export interface RunFormationIn {
  project_id: string;
  min_size: number;
  max_size: number;
  students: StudentIn[];
  must_pair: [string, string][];
  cannot_pair: [string, string][];
  seed: number;
}

export interface Team {
  id: string;
  members: string[];
  scores: Record<string, number>;
  rationale: string;
}

export interface Formation {
  id: string;
  status: string;
  seed: number;
  balance: number;
  teams: Team[];
  unassignable: [string, string][];
}

export interface Constraint {
  id: string;
  cohort_id: string;
  type: string;
  student_a: string;
  student_b: string;
  status: string;
}

export interface Cohort {
  id: string;
  name: string;
  owner_id: string;
}

