import { useState } from "react";
import { UserPlus, Check, Globe, Building, Sparkles } from "lucide-react";
import { Badge, Button, Card, Initials } from "@/components/ui";
import { useCohorts, useRoster } from "@/lib/tfa";

const CROSS_CLASS_COURSES = ["SEP490", "CAP490", "EXE101", "EXE201"];

export default function StudentRecommendations() {
  const cohorts = useCohorts();
  const cohort = cohorts.data?.[0];
  const roster = useRoster(cohort?.id);

  const [selectedCourse, setSelectedCourse] = useState("SEP490");
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const isCrossClassAllowed = CROSS_CLASS_COURSES.includes(selectedCourse);

  // Mock candidates algorithm output
  const candidates = (roster.data ?? []).slice(1, 7).map((student, index) => {
    const scores = [96, 91, 88, 85, 82, 79];
    const rationales = [
      "Bù trừ hoàn hảo kỹ năng Back-end (FastAPI) & có 5/6 khung giờ học tập rảnh trùng khớp.",
      "Kinh nghiệm Tester/QA (4/5 sao), phủ kín vai trò kiểm thử chất lượng đồ án.",
      "Trùng 4 khung giờ rảnh tối thứ 2, 4, 6 và có điểm chuyên môn Database cao (4/5).",
      "Vai trò Thuyết trình & làm SRS chuyên nghiệp, sẵn sàng đóng góp cho nhóm.",
      "Có thế mạnh về Thiết kế UI/UX Figma và trùng 3 buổi chiều họp đồ án.",
      "Kinh nghiệm 2 năm làm dự án thực tế, bổ sung tốt vai trò Nhóm trưởng.",
    ];

    const classSection = isCrossClassAllowed && index % 2 === 1 ? "SE1802 (Khác lớp)" : "SE1801 (Cùng lớp)";

    return {
      student,
      classSection,
      matchScore: scores[index % scores.length],
      rationale: rationales[index % rationales.length],
    };
  });

  function toggleInvite(id: string) {
    setInvitedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Course Switcher & Rules Header Banner */}
      <Card className="p-4 bg-ink/[0.02] border-line">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[0.85rem] font-700 text-ink">Môn học cần tìm đồng đội:</span>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="rounded-lg border border-line bg-surface py-1 px-2.5 text-[0.85rem] font-700 text-ink cursor-pointer focus:outline-none"
            >
              <option value="SEP490">SEP490 — Đồ án Tốt nghiệp (Gợi ý liên lớp)</option>
              <option value="CAP490">CAP490 — Capstone Project (Gợi ý liên lớp)</option>
              <option value="EXE101">EXE101 — Trải nghiệm Khởi nghiệp (Gợi ý liên lớp)</option>
              <option value="SWP391">SWP391 — Software Project (Gợi ý trong lớp SE1801)</option>
              <option value="PRN231">PRN231 — Cross-Platform App (Gợi ý trong lớp SE1801)</option>
            </select>
          </div>

          <Badge tone={isCrossClassAllowed ? "blue" : "orange"} className="px-3 py-1 text-[0.78rem]">
            {isCrossClassAllowed ? (
              <span className="flex items-center gap-1.5 font-600">
                <Globe className="size-3.5" /> Gợi ý Đồng đội Liên Lớp ({selectedCourse})
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-600">
                <Building className="size-3.5" /> Gợi ý Nội Bộ Lớp SE1801 ({selectedCourse})
              </span>
            )}
          </Badge>
        </div>

        <p className="mt-2 text-[0.82rem] leading-relaxed text-ink-soft">
          💡 <span className="font-600 text-ink">Phân tích OR-Tools AI:</span>{" "}
          {isCrossClassAllowed ? (
            <span className="text-fpt-blue-ink font-500">
              Môn <b>{selectedCourse}</b> cho phép ghép nhóm liên lớp. Hệ thống tìm kiếm ứng viên tối ưu từ <b>tất cả các lớp học phần cùng môn</b> trong học kỳ.
            </span>
          ) : (
            <span className="text-fpt-orange-ink font-500">
              Môn <b>{selectedCourse}</b> yêu cầu ghép nội bộ. Thuật toán lọc các bạn cùng lớp học phần <b>{cohort?.name ?? "SE1801"}</b> có chỉ số tương thích cao nhất.
            </span>
          )}
        </p>
      </Card>

      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[1.7rem] font-700 leading-[1.3] text-ink sm:text-[2rem]">
            Gợi ý ghép nhóm AI ✨
          </h1>
          <p className="mt-1 text-[0.95rem] text-ink-soft">
            Thuật toán phân tích Team DNA để đề xuất các bạn học phù hợp nhất cho môn <span className="font-600 text-ink">{selectedCourse}</span>
          </p>
        </div>

        <Badge tone="green" className="px-3 py-1.5 text-[0.8rem]">
          <Sparkles className="size-3.5" /> Tìm thấy {candidates.length} ứng viên phù hợp
        </Badge>
      </div>

      {/* Candidates Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {candidates.map(({ student, classSection, matchScore, rationale }) => {
          const isInvited = invitedIds.includes(student.id);
          const isCross = classSection.includes("Khác lớp");
          return (
            <Card key={student.id} className="p-5 flex flex-col justify-between transition-all hover:border-fpt-blue/40">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Initials name={student.name} tone={isCross ? "blue" : "orange"} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="truncate text-[0.95rem] font-700 text-ink">{student.name}</h3>
                        <span className="shrink-0 rounded bg-ink/[0.05] px-1 py-0.2 text-[0.68rem] font-600 text-ink-soft tabular-nums">
                          {student.id}
                        </span>
                      </div>
                      <p className="text-[0.78rem] text-ink-faint mt-0.5 truncate">
                        {student.major} · <span className="font-600 text-ink">{student.desired_role}</span>
                      </p>
                    </div>
                  </div>

                  <Badge tone={matchScore >= 90 ? "green" : "blue"} className="shrink-0 text-[0.78rem] font-700">
                    {matchScore}% Đáng khớp
                  </Badge>
                </div>

                {/* Class Badge */}
                <div className="mt-2.5 flex items-center justify-between text-[0.75rem]">
                  <span className={`inline-flex items-center gap-1 font-600 rounded px-1.5 py-0.5 ${
                    isCross ? "bg-fpt-blue/12 text-fpt-blue-ink" : "bg-ink/[0.05] text-ink-soft"
                  }`}>
                    {isCross ? <Globe className="size-3" /> : <Building className="size-3" />} {classSection}
                  </span>
                  <span className="text-ink-faint">
                    {student.experience_years > 0 ? `${student.experience_years} năm KN` : "Mới bắt đầu"}
                  </span>
                </div>

                {/* Rationale Box */}
                <div className="mt-3 rounded-xl bg-fpt-orange/[0.06] p-3 border border-fpt-orange/20">
                  <p className="text-[0.8rem] leading-relaxed text-ink font-500">
                    💡 <span className="font-600 text-fpt-orange-ink">Lý do gợi ý:</span> {rationale}
                  </p>
                </div>

                {/* Skills Chips */}
                <div className="mt-3 space-y-1">
                  <p className="text-[0.75rem] font-700 text-ink-soft">Kỹ năng nổi bật:</p>
                  <div className="flex flex-wrap gap-1">
                    {student.skills.map((skill) => (
                      <span key={skill.name} className="inline-flex items-center gap-1 rounded bg-ink/[0.045] px-1.5 py-0.5 text-[0.7rem] text-ink">
                        {skill.name} <span className="font-700 text-ink">{skill.proficiency}/5</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
                <span className="text-[0.72rem] text-ink-faint">
                  {student.availability.length} khung rảnh
                </span>

                <Button
                  variant={isInvited ? "secondary" : "primary"}
                  onClick={() => toggleInvite(student.id)}
                  className={isInvited ? "text-fpt-green-ink border-fpt-green/30" : undefined}
                >
                  {isInvited ? <Check className="size-4 text-fpt-green-ink" /> : <UserPlus className="size-4" />}
                  {isInvited ? "Đã gửi lời mời" : "Mời vào nhóm"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
