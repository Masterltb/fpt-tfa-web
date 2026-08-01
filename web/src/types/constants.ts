import type { Skill, SkillCategory } from "./ui";

// ─── Days & slots ─────────────────────────────────────────────────────────────

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const SLOTS = ["Morning", "Afternoon", "Evening"];
export const SLOT_LABELS: Record<string, string> = {
  Morning: "8–12",
  Afternoon: "13–17",
  Evening: "18–22",
};
export const ALL_SLOTS: string[] = DAYS.flatMap((d) => SLOTS.map((s) => `${d}-${s}`));

// ─── Skill catalog ────────────────────────────────────────────────────────────

const rawSkills: [string, SkillCategory][] = [
  ["React", "Frontend"],
  ["Vue", "Frontend"],
  ["TypeScript", "Frontend"],
  ["HTML/CSS", "Frontend"],
  ["Tailwind CSS", "Frontend"],
  ["Next.js", "Frontend"],
  ["Node.js", "Backend"],
  ["Express", "Backend"],
  ["Java / Spring", "Backend"],
  ["Python / Django", "Backend"],
  ["Go", "Backend"],
  ["REST API Design", "Backend"],
  ["GraphQL", "Backend"],
  ["React Native", "Mobile"],
  ["Flutter", "Mobile"],
  ["Kotlin (Android)", "Mobile"],
  ["Swift (iOS)", "Mobile"],
  ["PostgreSQL", "Database"],
  ["MySQL", "Database"],
  ["MongoDB", "Database"],
  ["Redis", "Database"],
  ["Data Modeling", "Database"],
  ["Machine Learning", "AI & Data"],
  ["Deep Learning", "AI & Data"],
  ["NLP", "AI & Data"],
  ["Computer Vision", "AI & Data"],
  ["Data Analysis", "AI & Data"],
  ["Data Visualization", "AI & Data"],
  ["Docker", "DevOps"],
  ["Kubernetes", "DevOps"],
  ["CI/CD", "DevOps"],
  ["AWS", "DevOps"],
  ["Linux Administration", "DevOps"],
  ["Manual Testing", "QA"],
  ["Test Automation", "QA"],
  ["Cypress / Playwright", "QA"],
  ["Performance Testing", "QA"],
  ["Figma", "UI/UX"],
  ["Wireframing", "UI/UX"],
  ["User Research", "UI/UX"],
  ["Prototyping", "UI/UX"],
  ["Product Strategy", "Product"],
  ["Roadmapping", "Product"],
  ["Agile / Scrum", "Product"],
  ["Requirements Analysis", "Product"],
  ["Public Speaking", "Communication"],
  ["Technical Writing", "Communication"],
  ["Presentation Design", "Communication"],
  ["Team Leadership", "Leadership"],
  ["Project Management", "Leadership"],
  ["Conflict Resolution", "Leadership"],
  ["Mentoring", "Leadership"],
];

export const SKILL_CATALOG: Skill[] = rawSkills.map(([name, category], i) => ({
  id: `sk-${i + 1}`,
  name,
  category,
}));

export function skillByName(name: string): Skill | undefined {
  return SKILL_CATALOG.find((s) => s.name === name);
}
