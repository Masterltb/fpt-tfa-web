import { useState, useEffect } from "react";
import { BookOpen, Layers, Calendar, Building2 } from "lucide-react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface AcademicContextData {
  term: string;
  campus: string;
  courseCode: string;
  courseName: string;
  classCode: string;
  studentCount: number;
  sessionName: string;
  cohortId: string;
}

export const MOCK_ACADEMIC_CONTEXTS: AcademicContextData[] = [
  {
    term: "Summer 2026",
    campus: "Hà Nội (HOLA)",
    courseCode: "SEP490",
    courseName: "Software Engineering Capstone Project",
    classCode: "SE1801-CAPSTONE",
    studentCount: 30,
    sessionName: "Đồ án Tốt nghiệp KTPM (SEP490)",
    cohortId: "c1",
  },
  {
    term: "Summer 2026",
    campus: "Hà Nội (HOLA)",
    courseCode: "SWP391",
    courseName: "Software Development Project",
    classCode: "SE1802-SWP",
    studentCount: 32,
    sessionName: "Đồ án Môn học SWP391",
    cohortId: "c2",
  },
  {
    term: "Summer 2026",
    campus: "Hà Nội (HOLA)",
    courseCode: "CAP490",
    courseName: "IT Capstone Project",
    classCode: "SE1803-CAPSTONE",
    studentCount: 28,
    sessionName: "Đồ án Tốt nghiệp CNTT (CAP490)",
    cohortId: "c3",
  },
  {
    term: "Summer 2026",
    campus: "Hà Nội (HOLA)",
    courseCode: "PRN231",
    courseName: "Cross-Platform Application Project",
    classCode: "SE1810-PRN",
    studentCount: 29,
    sessionName: "Đồ án Ứng dụng Đa nền tảng (PRN231)",
    cohortId: "c4",
  },
];

interface CourseClassSelectorProps {
  activeCohortId?: string;
  onSelectCohort?: (cohortId: string, context: AcademicContextData) => void;
  className?: string;
}

export function CourseClassSelector({
  activeCohortId = "c1",
  onSelectCohort,
  className,
}: CourseClassSelectorProps) {
  const [selectedId, setSelectedId] = useState<string>(() => {
    return localStorage.getItem("tfa_selected_cohort_id") || activeCohortId;
  });

  const activeContext =
    MOCK_ACADEMIC_CONTEXTS.find((c) => c.cohortId === selectedId) || MOCK_ACADEMIC_CONTEXTS[0];

  useEffect(() => {
    localStorage.setItem("tfa_selected_cohort_id", activeContext.cohortId);
    if (onSelectCohort) {
      onSelectCohort(activeContext.cohortId, activeContext);
    }
  }, [selectedId]);

  return (
    <div
      className={cn(
        "no-print rounded-2xl border border-line bg-surface/90 p-4 shadow-sm backdrop-blur-md transition-all",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        {/* Academic Hierarchy Label */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="blue" className="px-2.5 py-1 text-[0.75rem]">
            <Building2 className="size-3.5" /> {activeContext.campus}
          </Badge>
          <Badge tone="neutral" className="px-2.5 py-1 text-[0.75rem]">
            <Calendar className="size-3.5" /> Học kỳ: {activeContext.term}
          </Badge>
        </div>

        {/* Selectors Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Select Course & Class */}
          <div className="flex items-center gap-2 rounded-xl border border-line bg-ink/[0.03] px-3 py-1.5">
            <BookOpen className="size-4 text-fpt-orange-ink" />
            <span className="text-[0.78rem] font-700 text-ink-soft uppercase tracking-wider">Môn & Lớp:</span>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="bg-transparent text-[0.88rem] font-700 text-ink focus:outline-none cursor-pointer"
            >
              {MOCK_ACADEMIC_CONTEXTS.map((ctx) => (
                <option key={ctx.cohortId} value={ctx.cohortId}>
                  [{ctx.courseCode}] {ctx.classCode} — {ctx.studentCount} SV
                </option>
              ))}
            </select>
          </div>

          {/* Select Grouping Session */}
          <div className="flex items-center gap-2 rounded-xl border border-line bg-ink/[0.03] px-3 py-1.5">
            <Layers className="size-4 text-fpt-blue-ink" />
            <span className="text-[0.78rem] font-700 text-ink-soft uppercase tracking-wider">Phiên gom:</span>
            <span className="text-[0.88rem] font-600 text-ink">{activeContext.sessionName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
