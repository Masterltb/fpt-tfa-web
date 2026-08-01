/**
 * Mock data helpers for fpt-tfa-web tests (similar to backend test helpers).
 */

export interface Skill {
  name: string;
  level: number;
}

export interface Student {
  id: string;
  name: string;
  skills: Skill[];
  experienceYears: number;
  desiredRole: 'leader' | 'coordinator' | 'researcher' | 'presenter' | 'member' | 'other';
}

export interface Team {
  id: string;
  name: string;
  members: Student[];
  rationale?: string;
}

export function makeCohort(n: number): Student[] {
  const roles: Student['desiredRole'][] = ['leader', 'coordinator', 'researcher', 'presenter', 'member', 'other'];
  const students: Student[] = [];

  for (let i = 0; i < n; i++) {
    students.push({
      id: `u${i}`,
      name: `Student ${i}`,
      skills: [
        { name: 'React', level: Math.floor(Math.random() * 5) + 1 },
        { name: 'Python', level: Math.floor(Math.random() * 5) + 1 }
      ],
      experienceYears: Math.floor(Math.random() * 4),
      desiredRole: roles[i % roles.length]
    });
  }

  return students;
}
