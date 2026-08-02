import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowRightLeft,
  Award,
  BookOpen,
  Calendar,
  Check,
  Eye,
  MoreVertical,
  Star,
  Users,
} from "lucide-react";
import { Badge, Initials } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { FormationTeam, Student } from "@/lib/tfa";

const ROLE_VI: Record<string, string> = {
  backend: "Back-end",
  frontend: "Front-end",
  presenter: "Thuyết trình",
  qa: "Kiểm thử",
  leader: "Nhóm trưởng",
  other: "Khác",
};

const SLOT_VI: Record<string, string> = {
  "mon-am": "T2 sáng",
  "mon-pm": "T2 chiều",
  "tue-am": "T3 sáng",
  "tue-pm": "T3 chiều",
  "wed-am": "T4 sáng",
  "wed-pm": "T4 chiều",
  "thu-am": "T5 sáng",
  "thu-pm": "T5 chiều",
  "fri-am": "T6 sáng",
  "fri-pm": "T6 chiều",
};

interface StudentActionMenuProps {
  student: Student;
  currentTeamId: string;
  allTeams: FormationTeam[];
  committed: boolean;
  onViewDna: (student: Student) => void;
  onDirectMove: (studentId: string, targetTeamId: string) => void;
}

export function StudentActionMenu({
  student,
  currentTeamId,
  allTeams,
  committed,
  onViewDna,
  onDirectMove,
}: StudentActionMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const role = ROLE_VI[student.desired_role] ?? student.desired_role;

  useEffect(() => {
    if (!open) return;

    const handleDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className={cn("relative inline-block text-left", open && "z-50")} ref={menuRef}>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Mở thao tác cho ${student.name}`}
        title="Tùy chọn thao tác sinh viên"
        className={cn(
          "flex size-6 items-center justify-center rounded-md text-ink-faint transition-colors cursor-pointer",
          open ? "bg-fpt-orange/15 text-fpt-orange-ink" : "hover:bg-ink/[0.08] hover:text-ink",
        )}
      >
        <MoreVertical className="size-3.5" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={`Thông tin và thao tác với ${student.name}`}
          className={cn(
            "absolute right-0 top-[calc(100%+4px)] z-50 w-[min(23.8rem,calc(100vw-2.5rem))] rounded-card border border-line bg-surface p-3.5",
            "shadow-[0_12px_36px_rgba(15,23,42,0.22),0_4px_12px_rgba(15,23,42,0.12)]",
            "animate-in fade-in zoom-in-95 duration-150 origin-top-right",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start gap-3 border-b border-line p-2.5 pb-3">
            <Initials name={student.name} tone="orange" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.95rem] font-700 leading-[1.4] text-ink">{student.name}</p>
              <p className="mt-0.5 truncate text-[0.75rem] text-ink-soft">
                {student.major || "Chưa cập nhật chuyên ngành"}
              </p>
            </div>
            <Badge tone="blue">{role}</Badge>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <InfoCell icon={<Award className="size-3.5" />} label="Kinh nghiệm" value={student.experience_years > 0 ? `${student.experience_years} năm` : "Mới bắt đầu"} />
            <InfoCell icon={<Users className="size-3.5" />} label="Nhóm hiện tại" value={`Nhóm ${String(allTeams.findIndex((team) => team.id === currentTeamId) + 1).padStart(2, "0")}`} />
          </div>

          <div className="mt-3 space-y-3 border-b border-line pb-3">
            <InfoGroup icon={<BookOpen className="size-3.5" />} label="Kỹ năng">
              {student.skills.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {student.skills.map((skill) => (
                    <span key={skill.name} className="inline-flex items-center gap-1 rounded-full bg-ink/[0.055] px-2 py-1 text-[0.72rem] text-ink-soft">
                      {skill.name}
                      <span className="font-700 text-ink">{skill.proficiency}/5</span>
                      <Star className="size-3 fill-fpt-orange text-fpt-orange" />
                    </span>
                  ))}
                </div>
              ) : <span className="text-[0.78rem] text-ink-faint">Chưa cập nhật</span>}
            </InfoGroup>

            <InfoGroup icon={<Calendar className="size-3.5" />} label="Lịch rảnh">
              {student.availability.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {student.availability.map((slot) => (
                    <Badge key={slot} tone="green" className="px-2 py-0.5 text-[0.7rem]">
                      {SLOT_VI[slot.toLowerCase()] ?? slot.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              ) : <span className="text-[0.78rem] text-ink-faint">Chưa đăng ký</span>}
            </InfoGroup>
          </div>

          <div className="mt-3">
            <div className="mb-2 flex items-center gap-2">
              <ArrowRightLeft className="size-3.5 text-fpt-orange-ink" />
              <p className="text-[0.8rem] font-700 text-ink">Chuyển thẳng sang nhóm</p>
            </div>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {allTeams.map((team, index) => {
                const isCurrent = team.id === currentTeamId;
                return (
                  <button
                    key={team.id}
                    type="button"
                    role="menuitem"
                    disabled={committed || isCurrent}
                    onClick={() => {
                      onDirectMove(student.id, team.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-[9px] px-2.5 py-2 text-left text-[0.78rem] transition-colors",
                      isCurrent
                        ? "cursor-default bg-ink/[0.045] text-ink-soft"
                        : "cursor-pointer text-ink hover:bg-fpt-orange/10 hover:text-fpt-orange-ink",
                    )}
                  >
                    <span className="font-600">Nhóm {String(index + 1).padStart(2, "0")}</span>
                    <span className="flex items-center gap-1 text-[0.7rem] text-ink-faint">
                      {isCurrent ? <><Check className="size-3" /> Hiện tại</> : <>{team.members.length} SV <ArrowRight className="size-3.5" /></>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onViewDna(student);
              setOpen(false);
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-[9px] border border-line px-3 py-2 text-[0.78rem] font-600 text-fpt-blue-ink transition-colors hover:bg-fpt-blue/8"
          >
            <Eye className="size-3.5" /> Mở hồ sơ Team DNA đầy đủ
          </button>
        </div>
      )}
    </div>
  );
}

function InfoCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[9px] bg-ink/[0.03] px-2.5 py-2">
      <p className="flex items-center gap-1.5 text-[0.7rem] text-ink-faint">{icon}{label}</p>
      <p className="mt-0.5 truncate text-[0.78rem] font-600 text-ink">{value}</p>
    </div>
  );
}

function InfoGroup({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-[0.75rem] font-700 text-ink">{icon}{label}</p>
      {children}
    </div>
  );
}
