// FPT University Team Formation Assistant (TFA) — TypeScript DTO Models (v1.0.0)

export type UserRole = 'STUDENT' | 'LECTURER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type TermStatus = 'PLANNED' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
export type SectionStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type GroupingMode = 'STUDENT_LED' | 'LECTURER_LED' | 'HYBRID';
export type GroupingSessionStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'FROZEN'
  | 'MATCHING'
  | 'REVIEW'
  | 'PUBLISHED'
  | 'CLOSED'
  | 'CANCELLED';
export type TeamStatus =
  | 'DRAFT'
  | 'FORMING'
  | 'INCOMPLETE'
  | 'VALID'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'AT_RISK';
export type CommitmentLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  userCode?: string;
  campusId?: string;
  status: UserStatus;
}

export interface SkillRating {
  skillId: string;
  skillName: string;
  category: string;
  level: number; // 1-5
}

export interface TeamDNA {
  userId: string;
  skills: SkillRating[];
  preferredRoles: string[];
  commitmentLevel: CommitmentLevel;
  targetGrade: string;
  availableTimeSlots: string[]; // ISO string array e.g. ["MON_EVE", "TUE_EVE"]
  workStylePreference?: string;
  completenessScore: number; // 0-100%
}

export interface ClassSection {
  id: string;
  sectionCode: string; // e.g. SE1801
  courseCode: string; // e.g. SWE201c
  courseName: string;
  termId: string;
  lecturerId: string;
  lecturerName?: string;
  studentCount: number;
  dnaCompletionRate: number; // 0-100%
  activeSessionId?: string;
  activeSessionStatus?: GroupingSessionStatus;
  activeGroupingMode?: GroupingMode;
}

export interface GroupingSessionConfig {
  id: string;
  sectionId: string;
  mode: GroupingMode;
  status: GroupingSessionStatus;
  minTeamSize: number;
  maxTeamSize: number;
  targetTeamSize: number;
  deadlineIso?: string;
  skillWeights?: Record<string, number>;
}

export interface TeamMember {
  userId: string;
  fullName: string;
  studentCode: string;
  assignedRole: string;
  isLeader: boolean;
  skillsSummary: string[];
}

export interface Team {
  id: string;
  teamName: string;
  sectionId: string;
  sessionId: string;
  status: TeamStatus;
  members: TeamMember[];
  balanceScore?: number; // 0-100
  explainabilityRationale?: string[];
  isLocked?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
  traceId?: string;
}

export interface ApiErrorResponse {
  type?: string;
  title?: string;
  status?: number;
  code?: string;
  detail?: string;
  errors?: Array<{ field: string; message: string; code?: string }>;
}
