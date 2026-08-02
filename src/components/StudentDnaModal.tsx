import { X, Briefcase, Calendar, Award, Star, BookOpen } from "lucide-react";
import { Badge, Button, Initials } from "@/components/ui";
import type { Student } from "@/lib/tfa";

const ROLE_VI: Record<string, string> = {
  backend: "Back-end Developer",
  frontend: "Front-end Developer",
  presenter: "Thuyết trình (Presenter)",
  qa: "Kiểm thử (QA/Tester)",
  leader: "Nhóm trưởng (Team Lead)",
  other: "Khác",
};

interface StudentDnaModalProps {
  student: Student | null;
  onClose: () => void;
}

export function StudentDnaModal({ student, onClose }: StudentDnaModalProps) {
  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-card border border-line bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
          <div className="flex items-center gap-3.5">
            <Initials name={student.name} tone="orange" />
            <div>
              <h2 className="text-[1.2rem] font-700 leading-tight text-ink">{student.name}</h2>
              <p className="mt-0.5 text-[0.85rem] font-500 text-ink-soft">
                Mã SV: <span className="font-600 text-ink">{student.id}</span> · Chuyên ngành:{" "}
                <span className="font-600 text-ink">{student.major || "SE"}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-ink-faint hover:bg-ink/[0.06] hover:text-ink transition-colors"
            aria-label="Đóng"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Main Attributes Badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[12px] bg-fpt-blue/6 border border-fpt-blue/15 p-3">
              <div className="flex items-center gap-1.5 text-[0.78rem] font-600 text-fpt-blue-ink">
                <Briefcase className="size-3.5" /> Vai trò mong muốn
              </div>
              <p className="mt-1 text-[0.92rem] font-700 text-ink">
                {ROLE_VI[student.desired_role] ?? student.desired_role}
              </p>
            </div>
            <div className="rounded-[12px] bg-fpt-orange/6 border border-fpt-orange/15 p-3">
              <div className="flex items-center gap-1.5 text-[0.78rem] font-600 text-fpt-orange-ink">
                <Award className="size-3.5" /> Kinh nghiệm thực tế
              </div>
              <p className="mt-1 text-[0.92rem] font-700 text-ink">
                {student.experience_years > 0 ? `${student.experience_years} năm` : "Chưa có / Mới bắt đầu"}
              </p>
            </div>
          </div>

          {/* Skills Section */}
          <div>
            <h3 className="flex items-center gap-2 text-[0.9rem] font-700 text-ink mb-2.5">
              <BookOpen className="size-4 text-fpt-blue-ink" /> Kỹ năng & Trình độ
            </h3>
            {student.skills && student.skills.length > 0 ? (
              <div className="space-y-2">
                {student.skills.map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between text-[0.88rem] bg-ink/[0.025] rounded-[8px] px-3 py-2">
                    <span className="font-500 text-ink">{skill.name}</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${
                            i < skill.proficiency
                              ? "fill-fpt-orange text-fpt-orange"
                              : "text-ink/15"
                          }`}
                        />
                      ))}
                      <span className="ml-1.5 text-[0.78rem] font-600 text-ink-soft">
                        {skill.proficiency}/5
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[0.85rem] text-ink-faint italic">Chưa cập nhật kỹ năng chi tiết</p>
            )}
          </div>

          {/* Availability Grid */}
          <div>
            <h3 className="flex items-center gap-2 text-[0.9rem] font-700 text-ink mb-2.5">
              <Calendar className="size-4 text-fpt-green-ink" /> Lịch rảnh rỗi trong tuần
            </h3>
            {student.availability && student.availability.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {student.availability.map((slot) => (
                  <Badge key={slot} tone="green" className="text-[0.78rem]">
                    {slot.replace("_", " ")}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-[0.85rem] text-ink-faint italic">Chưa đăng ký khung giờ rảnh</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 border-t border-line pt-4 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
