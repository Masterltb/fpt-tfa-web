import { useState } from "react";
import { Dna, Star, Calendar, Check, Save, UserCheck } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { useCohorts, useRoster, type Skill } from "@/lib/tfa";

const ROLES = [
  { id: "leader", title: "Nhóm trưởng (Team Leader)", desc: "Điều phối tiến độ, quản lý task và kết nối các thành viên" },
  { id: "frontend", title: "Front-end Developer", desc: "Thiết kế UI/UX, lập trình giao diện React, Tailwind & API integration" },
  { id: "backend", title: "Back-end Developer", desc: "Xây dựng RESTful API, xử lý cơ sở dữ liệu PostgreSQL & logic hệ thống" },
  { id: "qa", title: "Kiểm thử (QA/QC)", desc: "Viết testcase, thực hiện kiểm thử tự động/thủ công và đảm bảo chất lượng" },
  { id: "presenter", title: "Thuyết trình & Docs", desc: "Soạn tài liệu SRS/Architecture, làm slide và đại diện thuyết trình" },
];

const DEFAULT_SKILLS: Skill[] = [
  { name: "Front-end (React/TypeScript)", proficiency: 4 },
  { name: "Back-end (Python/FastAPI)", proficiency: 3 },
  { name: "Cơ sở dữ liệu (PostgreSQL/SQL)", proficiency: 4 },
  { name: "Kiểm thử phần mềm (Software Testing)", proficiency: 3 },
  { name: "Thuyết trình & Viết tài liệu SRS", proficiency: 5 },
];

const SHIFTS = [
  { id: "MON_MORNING", label: "T2 Sáng" },
  { id: "MON_AFTERNOON", label: "T2 Chiều" },
  { id: "MON_EVENING", label: "T2 Tối" },
  { id: "TUE_MORNING", label: "T3 Sáng" },
  { id: "TUE_AFTERNOON", label: "T3 Chiều" },
  { id: "TUE_EVENING", label: "T3 Tối" },
  { id: "WED_MORNING", label: "T4 Sáng" },
  { id: "WED_AFTERNOON", label: "T4 Chiều" },
  { id: "WED_EVENING", label: "T4 Tối" },
  { id: "THU_MORNING", label: "T5 Sáng" },
  { id: "THU_AFTERNOON", label: "T5 Chiều" },
  { id: "THU_EVENING", label: "T5 Tối" },
  { id: "FRI_MORNING", label: "T6 Sáng" },
  { id: "FRI_AFTERNOON", label: "T6 Chiều" },
  { id: "FRI_EVENING", label: "T6 Tối" },
  { id: "SAT_MORNING", label: "T7 Sáng" },
  { id: "SAT_AFTERNOON", label: "T7 Chiều" },
  { id: "SAT_EVENING", label: "T7 Tối" },
];

export default function StudentProfile() {
  const { principal } = useAuth();
  const cohorts = useCohorts();
  const cohort = cohorts.data?.[0];
  const roster = useRoster(cohort?.id);

  const me = roster.data?.find((s) => s.id === principal?.uid || s.name.includes(principal?.uid ?? ""));

  const [desiredRole, setDesiredRole] = useState(me?.desired_role || "frontend");
  const [skills, setSkills] = useState<Skill[]>(me?.skills.length ? me.skills : DEFAULT_SKILLS);
  const [availability, setAvailability] = useState<string[]>(
    me?.availability.length ? me.availability : ["MON_AFTERNOON", "TUE_MORNING", "WED_EVENING", "FRI_AFTERNOON"]
  );
  const [saved, setSaved] = useState(false);

  function handleStarClick(skillName: string, rating: number) {
    setSkills((prev) =>
      prev.map((s) => (s.name === skillName ? { ...s, proficiency: rating } : s))
    );
  }

  function toggleSlot(slotId: string) {
    setAvailability((prev) =>
      prev.includes(slotId) ? prev.filter((s) => s !== slotId) : [...prev, slotId]
    );
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.7rem] font-700 leading-[1.3] text-ink sm:text-[2rem]">
            Hồ sơ Team DNA cá nhân 🧬
          </h1>
          <p className="mt-1 text-[0.95rem] text-ink-soft">
            Thông tin năng lực và lịch rảnh giúp thuật toán OR-Tools phân bổ nhóm tối ưu nhất.
          </p>
        </div>

        <Button variant="primary" onClick={handleSave} className="shadow-md">
          {saved ? <Check className="size-4 text-white" /> : <Save className="size-4" />}
          {saved ? "Đã lưu thành công!" : "Lưu hồ sơ DNA"}
        </Button>
      </div>

      {saved && (
        <Card className="border-fpt-green/40 bg-fpt-green/10 p-4 text-[0.9rem] font-600 text-fpt-green-ink">
          ✨ Đã cập nhật Hồ sơ Team DNA! Giảng viên và thuật toán AI ghép nhóm sẽ ghi nhận thông tin mới của bạn.
        </Card>
      )}

      {/* 1. Desired Role */}
      <Card className="p-5">
        <div className="flex items-center gap-2 border-b border-line pb-3">
          <UserCheck className="size-5 text-fpt-orange-ink" />
          <h2 className="text-[1.1rem] font-700 text-ink">1. Vai trò mong muốn trong đồ án</h2>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((role) => {
            const isSelected = desiredRole === role.id;
            return (
              <div
                key={role.id}
                onClick={() => setDesiredRole(role.id)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  isSelected
                    ? "border-fpt-orange bg-fpt-orange/[0.06] ring-2 ring-fpt-orange/20 shadow-sm"
                    : "border-line bg-surface hover:border-fpt-orange/40 hover:bg-ink/[0.02]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[0.95rem] font-700 text-ink">{role.title}</span>
                  {isSelected && <Check className="size-4 text-fpt-orange-ink" />}
                </div>
                <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink-soft">{role.desc}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 2. Skills Rating */}
      <Card className="p-5">
        <div className="flex items-center gap-2 border-b border-line pb-3">
          <Dna className="size-5 text-fpt-blue-ink" />
          <h2 className="text-[1.1rem] font-700 text-ink">2. Đánh giá mức độ thành thạo kỹ năng (1 - 5 sao)</h2>
        </div>

        <div className="mt-4 space-y-3">
          {skills.map((skill) => (
            <div key={skill.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-line/60 bg-surface/50 p-3.5">
              <span className="text-[0.92rem] font-600 text-ink">{skill.name}</span>

              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(skill.name, star)}
                    className="p-1 text-ink-faint hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`size-5 ${
                        star <= skill.proficiency
                          ? "fill-fpt-orange text-fpt-orange"
                          : "text-ink/20"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 min-w-[32px] text-[0.88rem] font-700 text-ink text-right">
                  {skill.proficiency}/5
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 3. Availability Grid */}
      <Card className="p-5">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="size-5 text-fpt-green-ink" />
            <h2 className="text-[1.1rem] font-700 text-ink">3. Khung giờ học tập rảnh trong tuần</h2>
          </div>
          <Badge tone="green">{availability.length} khung giờ chọn</Badge>
        </div>

        <p className="mt-3 text-[0.85rem] text-ink-soft">
          Bấm chọn các buổi bạn sẵn sàng họp nhóm hoặc làm đồ án chung:
        </p>

        <div className="mt-4 grid grid-cols-3 sm:grid-cols-6 gap-2">
          {SHIFTS.map((shift) => {
            const active = availability.includes(shift.id);
            return (
              <button
                key={shift.id}
                type="button"
                onClick={() => toggleSlot(shift.id)}
                className={`rounded-lg py-2.5 px-2 text-center text-[0.78rem] font-600 transition-all cursor-pointer ${
                  active
                    ? "bg-fpt-green/18 text-fpt-green-ink border border-fpt-green/40 shadow-xs"
                    : "bg-ink/[0.04] text-ink-soft hover:bg-ink/[0.08]"
                }`}
              >
                {shift.label}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
