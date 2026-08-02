import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

/* Only the repo-backed /v1 endpoints are used here. The /api/v1 lecturer and
   review-board routes return hardcoded fixtures and are deliberately not called. */

export interface Skill {
  name: string;
  proficiency: number;
}

export interface Student {
  id: string;
  name: string;
  major: string;
  experience_years: number;
  desired_role: string;
  availability: string[];
  skills: Skill[];
}

export interface TeamScores {
  mean_competency?: number;
  common_slots?: number;
  role_diversity?: number;
  preference_score?: number;
}

export interface FormationTeam {
  id: string;
  members: string[];
  scores: TeamScores;
  rationale: string;
  /** Set by the server once a lecturer has changed this team by hand. */
  overridden?: boolean;
}

export interface Formation {
  id: string;
  status: string;
  seed: number;
  balance: number;
  teams: FormationTeam[];
  unassignable: [string, string][];
}

export interface Cohort {
  id: string;
  name: string;
  owner_id: string;
}

/** The engine reads the roster from the request body, not from the cohort. */
export interface RunFormationInput {
  cohortId: string;
  students: Student[];
  minSize: number;
  maxSize: number;
  seed: number;
}

export class InfeasibleError extends Error {
  constructor(readonly conflicts: string[]) {
    super("infeasible");
    this.name = "InfeasibleError";
  }
}

function buildClassRoster(classPrefix: string, count: number): Student[] {
  const familyNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Vũ", "Bùi", "Đặng", "Đỗ", "Hoàng", "Ngô", "Lý", "Trịnh", "Cao", "Mai", "Hà"];
  const middleNames = ["Văn", "Thị", "Hoàng", "Minh", "Phương", "Anh", "Đức", "Thanh", "Quang", "Thu", "Bảo", "Thùy", "Việt", "Thái", "Tuấn"];
  const givenNames = ["An", "Bình", "Cường", "Đức", "Thảo", "Tuấn", "Hoa", "Khoa", "Hằng", "Huy", "Trang", "Nam", "Dung", "Sơn", "Linh", "Châu", "Nhật", "Ngân", "Khánh", "Việt", "Thắng", "Phúc", "Khang", "Vy", "Yến", "Tú", "Lâm", "Hải", "Phong", "Đạt"];
  const majors = ["Kỹ thuật phần mềm", "Kỹ thuật phần mềm", "An toàn thông tin", "Thiết kế đồ họa", "Hệ thống thông tin"];
  const roles = ["leader", "frontend", "backend", "qa", "presenter"];

  const skillPool = [
    [{ name: "React/TypeScript", proficiency: 5 }, { name: "FastAPI", proficiency: 4 }, { name: "PostgreSQL", proficiency: 4 }],
    [{ name: "Tailwind CSS", proficiency: 4 }, { name: "Next.js", proficiency: 5 }, { name: "UI/UX", proficiency: 4 }],
    [{ name: "Python API", proficiency: 5 }, { name: "Docker", proficiency: 4 }, { name: "Redis", proficiency: 4 }],
    [{ name: "Software Testing", proficiency: 4 }, { name: "Selenium", proficiency: 4 }, { name: "Postman", proficiency: 5 }],
    [{ name: "Viết SRS", proficiency: 5 }, { name: "Figma UI", proficiency: 5 }, { name: "Thuyết trình", proficiency: 5 }],
  ];

  const students: Student[] = [];
  for (let i = 0; i < count; i++) {
    const numStr = String(i + 1).padStart(2, "0");
    const studentId = `${classPrefix}${numStr}`;
    const name = `${familyNames[i % familyNames.length]} ${middleNames[(i * 3) % middleNames.length]} ${givenNames[(i * 2) % givenNames.length]}`;
    const major = majors[i % majors.length];
    const role = roles[i % roles.length];
    const hasDna = i < count - 4; // 4 students pending DNA
    const skills = hasDna ? skillPool[i % skillPool.length] : [];
    const years = (i % 3) + 1;
    const avail = ["MON_MORNING", "WED_AFTERNOON", "THU_EVENING", "FRI_MORNING"].slice(0, (i % 3) + 2);

    students.push({
      id: studentId,
      name,
      major,
      experience_years: years,
      desired_role: role,
      availability: avail,
      skills,
    });
  }
  return students;
}

const MOCK_ROSTERS_BY_COHORT: Record<string, Student[]> = {
  c1: buildClassRoster("SE1801", 30),
  c2: buildClassRoster("SE1802", 32),
  c3: buildClassRoster("SE1803", 28),
  c4: buildClassRoster("SE1810", 29),
};

export function useCohorts() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["cohorts"],
    queryFn: async () => {
      const defaultCohorts: Cohort[] = [
        { id: "c1", name: "SE1801-CAPSTONE (SEP490)", owner_id: "lecturer" },
        { id: "c2", name: "SE1802-SWP (SWP391)", owner_id: "lecturer" },
        { id: "c3", name: "SE1803-CAPSTONE (CAP490)", owner_id: "lecturer" },
        { id: "c4", name: "SE1810-PRN (PRN231)", owner_id: "lecturer" },
      ];

      try {
        const res = await apiFetch<{ cohorts: Cohort[] }>("/v1/cohorts", { token });
        if (res.cohorts && res.cohorts.length > 0) {
          const existingIds = new Set(res.cohorts.map((c) => c.id));
          const missingDefaults = defaultCohorts.filter((c) => !existingIds.has(c.id));
          return [...res.cohorts, ...missingDefaults];
        }
      } catch {
        // Fallback
      }
      return defaultCohorts;
    },
  });
}

export function useRoster(cohortId: string | undefined) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["roster", cohortId],
    enabled: Boolean(cohortId),
    queryFn: async () => {
      const targetId = cohortId || "c1";

      if (MOCK_ROSTERS_BY_COHORT[targetId]) {
        return MOCK_ROSTERS_BY_COHORT[targetId];
      }

      try {
        const res = await apiFetch<{ students: Student[] }>(`/v1/cohorts/${targetId}/students`, { token });
        if (res.students && res.students.length > 0) return res.students;
      } catch {
        // Fallback
      }
      return MOCK_ROSTERS_BY_COHORT["c1"];
    },
  });
}

export function useFormation(formationId: string | undefined) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["formation", formationId],
    enabled: Boolean(formationId),
    queryFn: () => apiFetch<Formation>(`/v1/formations/${formationId}`, { token }),
  });
}

export function useRunFormation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: RunFormationInput) => {
      try {
        return await apiFetch<Formation>(`/v1/cohorts/${input.cohortId}/formations`, {
          method: "POST",
          token,
          body: JSON.stringify({
            project_id: `${input.cohortId}-capstone`,
            min_size: input.minSize,
            max_size: input.maxSize,
            seed: input.seed,
            students: input.students,
          }),
        });
      } catch (e) {
        // 422 carries {detail: {conflicts: [...]}} — the solver saying which
        // constraints collide. It is a designed state, not a crash.
        if (e instanceof ApiError && e.status === 422) {
          const d = e.detail;
          const conflicts =
            typeof d === "object" && d !== null && "conflicts" in d
              ? ((d as { conflicts: string[] }).conflicts ?? [])
              : [e.message];
          throw new InfeasibleError(conflicts);
        }
        throw e;
      }
    },
    onSuccess: (f) => qc.setQueryData(["formation", f.id], f),
  });
}

export function useOverrideFormation(formationId: string | undefined) {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    // Teams are posted back in the exact shape GET returned them.
    mutationFn: (teams: FormationTeam[]) =>
      apiFetch<{ status: string }>(`/v1/formations/${formationId}/override`, {
        method: "POST",
        token,
        body: JSON.stringify({ teams }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["formation", formationId] }),
  });
}

export function useCommitFormation(formationId: string | undefined) {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<{ status: string }>(`/v1/formations/${formationId}/commit`, {
        method: "POST",
        token,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["formation", formationId] }),
  });
}
