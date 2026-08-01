// ─── Core enums / unions ────────────────────────────────────────────────────

export type Role = "student" | "lecturer";

export type ProfileStatus = "draft" | "submitted" | "locked";

export type CohortStatus =
  | "draft"
  | "collecting"
  | "ready"
  | "optimizing"
  | "review"
  | "finalized"
  | "archived";

export type ConstraintStatus = "pending" | "approved" | "rejected" | "conflict";

export type ConstraintType = "must-pair" | "cannot-pair";

export type SkillCategory =
  | "Frontend"
  | "Backend"
  | "Mobile"
  | "Database"
  | "AI & Data"
  | "DevOps"
  | "QA"
  | "UI/UX"
  | "Product"
  | "Communication"
  | "Leadership";

export const SKILL_CATEGORIES: SkillCategory[] = [
  "Frontend",
  "Backend",
  "Mobile",
  "Database",
  "AI & Data",
  "DevOps",
  "QA",
  "UI/UX",
  "Product",
  "Communication",
  "Leadership",
];

export type TeamRole =
  | "Leader"
  | "Developer"
  | "Researcher"
  | "Designer"
  | "Presenter"
  | "Analyst"
  | "QA Engineer";

export const TEAM_ROLES: TeamRole[] = [
  "Leader",
  "Developer",
  "Researcher",
  "Designer",
  "Presenter",
  "Analyst",
  "QA Engineer",
];

export type Proficiency = 1 | 2 | 3 | 4 | 5;

// ─── Entities ───────────────────────────────────────────────────────────────

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
}

export interface StudentSkill {
  skillId: string;
  name: string;
  category: SkillCategory;
  proficiency: Proficiency;
  evidence?: string;
}

export interface Student {
  id: string;
  name: string;
  studentId: string;
  major: string;
  year: number;
  email: string;
  experience: number; // years
  bio: string;
  skills: StudentSkill[];
  availability: string[]; // e.g. "Mon-Morning"
  primaryRole: TeamRole;
  rankedRoles: TeamRole[];
  avoidRoles: TeamRole[];
  mustPair: string[]; // student ids
  cannotPair: string[]; // student ids
  profileStatus: ProfileStatus;
  profileCompleteness: number; // 0-100
  teamId: string | null;
}

export interface Team {
  id: string;
  name: string; // e.g. "Rồng"
  cohortId: string;
  memberIds: string[];
  qualityScore: number; // 0-100
  locked: boolean;
  rationale: string;
}

export interface Cohort {
  id: string;
  code: string; // SE1842
  name: string; // Software Engineering Project
  module: string;
  semester: string; // Fall 2026
  studentCount: number;
  minTeamSize: number;
  maxTeamSize: number;
  preferredTeamSize: number;
  status: CohortStatus;
  deadline: string; // ISO
  profileCompletion: number; // 0-100
  constraintReadiness: number; // 0-100
}

export interface Constraint {
  id: string;
  type: ConstraintType;
  cohortId: string;
  studentA: string;
  studentB: string;
  reason: string;
  status: ConstraintStatus;
  createdAt: string;
}

export interface Formation {
  cohortId: string;
  published: boolean;
  qualityScore: number;
  lastRun: string;
  preset: "Balanced" | "Skill-first" | "Availability-first" | "Preference-first" | "Custom";
  minTeamSize: number;
  maxTeamSize: number;
  preferredTeamSize: number;
  teamCount: number;
  allowUnassigned: boolean;
  weights: {
    skill: number;
    role: number;
    availability: number;
    preference: number;
    balance: number;
  };
  metrics: {
    hardViolations: number;
    skillCoverage: number;
    roleCoverage: number;
    availabilityOverlap: number;
    preferenceSatisfaction: number;
  };
}

export interface RequirementItem {
  id: string;
  cohortId: string;
  label: string;
  type: "skill" | "role";
  importance: "Hard" | "Strong" | "Soft";
  minPerTeam: number;
  coverage: number; // teams that satisfy it
  totalTeams: number;
  supply: number; // number of students who can fill it
  feasible: boolean;
  feasibilityNote?: string;
}

export interface Announcement {
  id: string;
  cohortId: string;
  author: string;
  title: string;
  body: string;
  createdAt: string;
  teamId?: string;
}
