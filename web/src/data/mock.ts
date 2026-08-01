import {
  Announcement,
  Cohort,
  Constraint,
  Formation,
  RequirementItem,
  SkillCategory,
  Student,
  StudentSkill,
  Team,
  TeamRole,
  Proficiency,
} from "../types/ui";
import {
  DAYS,
  SLOTS,
  SLOT_LABELS,
  ALL_SLOTS,
  SKILL_CATALOG,
  skillByName,
} from "../types/constants";

export {
  DAYS,
  SLOTS,
  SLOT_LABELS,
  ALL_SLOTS,
  SKILL_CATALOG,
  skillByName,
};

// ─── Student names ──────────────────────────────────────────────────────────

const NAMES: string[] = [
  "Nguyễn Minh Tú", "Trần Thị Lan", "Lê Văn Hùng", "Phạm Thị Hoa", "Hoàng Minh Khoa",
  "Vũ Thị Mai", "Đặng Văn Nam", "Bùi Thị Thu", "Đinh Minh Quân", "Ngô Thị Hương",
  "Lý Văn Phúc", "Tô Thị Kim Anh", "Dương Minh Tuấn", "Cao Thị Linh", "Võ Văn Tâm",
  "Phan Thị Ngọc", "Trịnh Minh Đức", "Mai Thị Thảo", "Hồ Văn Long", "Lương Thị Yến",
  "Nguyễn Văn An", "Trần Minh Châu", "Lê Thị Dung", "Phạm Văn Đạt", "Hoàng Thị Emly",
  "Vũ Minh Phong", "Đặng Thị Quỳnh", "Bùi Văn Sơn", "Đinh Thị Trang", "Ngô Văn Uy",
  "Lý Thị Vân", "Tô Minh Xuân", "Dương Thị Yến", "Cao Văn Bảo", "Võ Thị Cẩm",
  "Phan Văn Dũng", "Trịnh Thị Giang", "Mai Văn Hiếu", "Hồ Thị Ý", "Lương Minh Khải",
  "Nguyễn Thị Lệ", "Trần Văn Minh",
];

const MAJORS = [
  "Software Engineering",
  "Computer Science",
  "Artificial Intelligence",
  "Information Systems",
  "Data Science",
  "Interaction Design",
];

const teamNames = [
  "Rồng", "Phượng", "Kỳ Lân", "Long Mã", "Hổ", "Hạc", "Rùa", "Cá Chép", "Đại Bàng",
];
// team sizes: 6 teams of 5, 3 teams of 4 = 42
const teamSizes = [5, 5, 5, 5, 5, 5, 4, 4, 4];

const ROLES: TeamRole[] = [
  "Leader", "Developer", "Researcher", "Designer", "Presenter", "Analyst", "QA Engineer",
];

// deterministic pseudo-random
function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pick<T>(arr: T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)];
}

function skillsForRole(role: TeamRole): SkillCategory[] {
  switch (role) {
    case "Developer": return ["Frontend", "Backend", "Database", "Mobile"];
    case "Designer": return ["UI/UX", "Frontend", "Product"];
    case "Researcher": return ["AI & Data", "Database", "Product"];
    case "Analyst": return ["AI & Data", "Database", "Product"];
    case "QA Engineer": return ["QA", "Backend", "DevOps"];
    case "Presenter": return ["Communication", "Product", "UI/UX"];
    case "Leader": return ["Leadership", "Product", "Communication", "Backend"];
  }
}

const BIOS = [
  "Final-year student passionate about building products that matter.",
  "Loves clean architecture and pair programming.",
  "Enthusiastic about data-driven decision making.",
  "Design-minded engineer who cares about the details.",
  "Team player who enjoys mentoring and unblocking others.",
  "Focused on shipping reliable, well-tested software.",
  "Curious about ML and always experimenting with side projects.",
  "Comfortable presenting to stakeholders and writing docs.",
];

// ─── Build students ───────────────────────────────────────────────────────────

const students: Student[] = [];

// assign team ids up front
const teamAssignments: string[] = [];
teamSizes.forEach((size, ti) => {
  for (let i = 0; i < size; i++) teamAssignments.push(`team-${ti + 1}`);
});

NAMES.forEach((name, idx) => {
  const r = rng(idx * 97 + 13);
  const role = pick(ROLES, r);
  const cats = skillsForRole(role);
  const skillCount = 3 + Math.floor(r() * 4); // 3-6
  const chosen: StudentSkill[] = [];
  const usedNames = new Set<string>();
  let attempts = 0;
  while (chosen.length < skillCount && attempts < 40) {
    attempts++;
    const cat = pick(cats, r);
    const pool = SKILL_CATALOG.filter((s) => s.category === cat);
    const sk = pick(pool, r);
    if (usedNames.has(sk.name)) continue;
    usedNames.add(sk.name);
    chosen.push({
      skillId: sk.id,
      name: sk.name,
      category: sk.category,
      proficiency: (2 + Math.floor(r() * 4)) as Proficiency,
      evidence: r() > 0.6 ? "Used in a personal project and coursework." : undefined,
    });
  }

  // availability 5-10 slots
  const availCount = 5 + Math.floor(r() * 6);
  const availSet = new Set<string>();
  while (availSet.size < availCount) availSet.add(pick(ALL_SLOTS, r));

  const ranked = ROLES.filter((x) => x !== role)
    .sort(() => r() - 0.5)
    .slice(0, 2);
  const avoid = ROLES.filter((x) => x !== role && !ranked.includes(x))
    .sort(() => r() - 0.5)
    .slice(0, r() > 0.5 ? 1 : 0);

  const completeness =
    idx === 0 ? 72 : Math.min(100, 55 + Math.floor(r() * 46));
  const status: Student["profileStatus"] =
    idx === 0 ? "draft" : completeness >= 100 ? "submitted" : r() > 0.4 ? "submitted" : "draft";

  students.push({
    id: `s-${idx + 1}`,
    name,
    studentId: `SE1842-${String(idx + 1).padStart(3, "0")}`,
    major: pick(MAJORS, r),
    year: 2 + Math.floor(r() * 3),
    email: `student${idx + 1}@fpt.edu.vn`,
    experience: Math.floor(r() * 4),
    bio: pick(BIOS, r),
    skills: chosen,
    availability: Array.from(availSet),
    primaryRole: role,
    rankedRoles: ranked,
    avoidRoles: avoid,
    mustPair: [],
    cannotPair: [],
    profileStatus: status,
    profileCompleteness: completeness,
    teamId: teamAssignments[idx],
  });
});

// wire a few constraints into students
students[0].mustPair = ["s-2"];
students[1].mustPair = ["s-1"];
students[0].cannotPair = ["s-3"];
students[2].cannotPair = ["s-1"];
students[4].mustPair = ["s-6"];
students[5].mustPair = ["s-5"];
students[9].cannotPair = ["s-11"];
students[10].cannotPair = ["s-9"];

export const STUDENTS = students;
export const CURRENT_STUDENT_ID = "s-1";

// ─── Teams ──────────────────────────────────────────────────────────────────

export const TEAMS: Team[] = teamNames.map((tn, ti) => {
  const id = `team-${ti + 1}`;
  const memberIds = students.filter((s) => s.teamId === id).map((s) => s.id);
  return {
    id,
    name: tn,
    cohortId: "SE1842",
    memberIds,
    qualityScore: 78 + ((ti * 7) % 18),
    locked: ti === 0,
    rationale:
      `Team ${tn} balances strong backend and frontend coverage with a dedicated ` +
      `designer and a natural leader. Availability overlaps well on weekday afternoons, ` +
      `and no hard constraints are violated. Skill balance across members is even, ` +
      `reducing single points of failure.`,
  };
});

// ─── Cohorts ──────────────────────────────────────────────────────────────────

export const COHORTS: Cohort[] = [
  {
    id: "SE1842",
    code: "SE1842",
    name: "Software Engineering Project",
    module: "SWE401",
    semester: "Fall 2026",
    studentCount: 42,
    minTeamSize: 4,
    maxTeamSize: 5,
    preferredTeamSize: 5,
    status: "review",
    deadline: "2026-08-14",
    profileCompletion: 78,
    constraintReadiness: 91,
  },
  {
    id: "AI2201",
    code: "AI2201",
    name: "Applied Machine Learning",
    module: "AIM302",
    semester: "Fall 2026",
    studentCount: 42,
    minTeamSize: 3,
    maxTeamSize: 4,
    preferredTeamSize: 4,
    status: "collecting",
    deadline: "2026-09-02",
    profileCompletion: 54,
    constraintReadiness: 40,
  },
];

// ─── Constraints ──────────────────────────────────────────────────────────────

export const CONSTRAINTS: Constraint[] = [
  {
    id: "c-1", type: "must-pair", cohortId: "SE1842",
    studentA: "s-1", studentB: "s-2",
    reason: "We've worked well together before on a hackathon.",
    status: "approved", createdAt: "2026-07-10T09:00:00Z",
  },
  {
    id: "c-2", type: "must-pair", cohortId: "SE1842",
    studentA: "s-5", studentB: "s-6",
    reason: "Complementary skills, both prefer async work.",
    status: "pending", createdAt: "2026-07-12T14:20:00Z",
  },
  {
    id: "c-3", type: "must-pair", cohortId: "SE1842",
    studentA: "s-7", studentB: "s-8",
    reason: "Same commute schedule.",
    status: "pending", createdAt: "2026-07-13T11:05:00Z",
  },
  {
    id: "c-4", type: "cannot-pair", cohortId: "SE1842",
    studentA: "s-1", studentB: "s-3",
    reason: "Previous project conflict, prefer not to repeat.",
    status: "approved", createdAt: "2026-07-09T16:40:00Z",
  },
  {
    id: "c-5", type: "cannot-pair", cohortId: "SE1842",
    studentA: "s-9", studentB: "s-11",
    reason: "Scheduling incompatibility.",
    status: "pending", createdAt: "2026-07-14T08:15:00Z",
  },
  {
    id: "c-6", type: "cannot-pair", cohortId: "SE1842",
    studentA: "s-2", studentB: "s-3",
    reason: "Private.",
    status: "conflict", createdAt: "2026-07-14T10:00:00Z",
  },
];

// ─── Formation ────────────────────────────────────────────────────────────────

export const FORMATION: Formation = {
  cohortId: "SE1842",
  published: false,
  qualityScore: 87,
  lastRun: "2026-07-15T13:30:00Z",
  preset: "Balanced",
  minTeamSize: 4,
  maxTeamSize: 5,
  preferredTeamSize: 5,
  teamCount: 9,
  allowUnassigned: false,
  weights: { skill: 70, role: 65, availability: 60, preference: 55, balance: 75 },
  metrics: {
    hardViolations: 0,
    skillCoverage: 89,
    roleCoverage: 91,
    availabilityOverlap: 78,
    preferenceSatisfaction: 82,
  },
};

// ─── Requirements ─────────────────────────────────────────────────────────────

export const REQUIREMENTS: RequirementItem[] = [
  {
    id: "r-1", cohortId: "SE1842", label: "Backend (Node/Java/Python)", type: "skill",
    importance: "Hard", minPerTeam: 1, coverage: 9, totalTeams: 9, supply: 18, feasible: true,
  },
  {
    id: "r-2", cohortId: "SE1842", label: "Frontend (React/Vue)", type: "skill",
    importance: "Hard", minPerTeam: 1, coverage: 9, totalTeams: 9, supply: 15, feasible: true,
  },
  {
    id: "r-3", cohortId: "SE1842", label: "UI/UX Design", type: "skill",
    importance: "Strong", minPerTeam: 1, coverage: 7, totalTeams: 9, supply: 8, feasible: true,
  },
  {
    id: "r-4", cohortId: "SE1842", label: "DevOps (Docker/CI/CD)", type: "skill",
    importance: "Strong", minPerTeam: 1, coverage: 3, totalTeams: 9, supply: 3, feasible: false,
    feasibilityNote: "Only 3 students have DevOps but 9 teams require 1 each.",
  },
  {
    id: "r-5", cohortId: "SE1842", label: "Team Leader role", type: "role",
    importance: "Hard", minPerTeam: 1, coverage: 9, totalTeams: 9, supply: 11, feasible: true,
  },
  {
    id: "r-6", cohortId: "SE1842", label: "QA / Testing", type: "skill",
    importance: "Soft", minPerTeam: 1, coverage: 5, totalTeams: 9, supply: 6, feasible: true,
  },
];

// ─── Announcements ────────────────────────────────────────────────────────────

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "a-1", cohortId: "SE1842", author: "PGS.TS. Trần Văn Khoa",
    title: "Complete your skills section by Friday",
    body: "Please complete your skills section by Friday. Pay attention to proficiency ratings — be honest, not aspirational.",
    createdAt: "2026-07-14T09:00:00Z",
  },
  {
    id: "a-2", cohortId: "SE1842", author: "PGS.TS. Trần Văn Khoa",
    title: "Pairing requests open until 12 Aug",
    body: "You may submit Must-Pair and Cannot-Pair requests until 12 August. All requests require my approval and are not guaranteed.",
    createdAt: "2026-07-11T15:30:00Z",
  },
  {
    id: "a-3", cohortId: "SE1842", author: "PGS.TS. Trần Văn Khoa",
    title: "Team Rồng — kickoff meeting",
    body: "Welcome to Team Rồng! Your first sprint planning is scheduled. Please coordinate a weekly slot using your shared availability.",
    createdAt: "2026-07-16T08:00:00Z", teamId: "team-1",
  },
];

// ─── Recent activity ──────────────────────────────────────────────────────────

export interface Activity { id: string; text: string; time: string; }
export const RECENT_ACTIVITY: Activity[] = [
  { id: "ac-1", text: "Phạm Thị Hoa submitted their profile", time: "12 min ago" },
  { id: "ac-2", text: "Nguyễn Minh Tú added a Must-Pair with Trần Thị Lan", time: "38 min ago" },
  { id: "ac-3", text: "Lê Văn Hùng updated their skills (4 → 6)", time: "1 hr ago" },
  { id: "ac-4", text: "Hoàng Minh Khoa submitted a Cannot-Pair request", time: "2 hrs ago" },
  { id: "ac-5", text: "Vũ Thị Mai completed their availability", time: "3 hrs ago" },
  { id: "ac-6", text: "Đặng Văn Nam submitted their profile", time: "4 hrs ago" },
  { id: "ac-7", text: "Bùi Thị Thu updated role preferences", time: "5 hrs ago" },
  { id: "ac-8", text: "Đinh Minh Quân submitted their profile", time: "Yesterday" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getStudent(id: string): Student | undefined {
  return STUDENTS.find((s) => s.id === id);
}

export function getTeam(id: string): Team | undefined {
  return TEAMS.find((t) => t.id === id);
}

export function getStudentTeam(studentId: string): Team | undefined {
  const s = getStudent(studentId);
  if (!s || !s.teamId) return undefined;
  return getTeam(s.teamId);
}

export function getCohort(id: string): Cohort | undefined {
  return COHORTS.find((c) => c.id === id);
}
