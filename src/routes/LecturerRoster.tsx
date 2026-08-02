import { useState } from "react";
import { Search, Eye, Filter, Bell, Check, UserCheck, Star, Calendar } from "lucide-react";
import { Badge, Button, Card, Initials, Stat } from "@/components/ui";
import { StudentDnaModal } from "@/components/StudentDnaModal";
import { CourseClassSelector } from "@/components/CourseClassSelector";
import { useCohorts, useRoster, type Student } from "@/lib/tfa";

const ROLE_VI: Record<string, { label: string; tone: "orange" | "blue" | "green" | "neutral" }> = {
  leader: { label: "Nhóm trưởng (Leader)", tone: "orange" },
  frontend: { label: "Front-end Developer", tone: "blue" },
  backend: { label: "Back-end Developer", tone: "neutral" },
  qa: { label: "Kiểm thử (QA/QC)", tone: "green" },
  presenter: { label: "Thuyết trình & Docs", tone: "neutral" },
  other: { label: "Khác", tone: "neutral" },
};

export default function LecturerRoster() {
  const [selectedCohortId, setSelectedCohortId] = useState<string>(() => {
    return localStorage.getItem("tfa_selected_cohort_id") || "c1";
  });

  const cohorts = useCohorts();
  const cohort = cohorts.data?.find((c) => c.id === selectedCohortId) ?? cohorts.data?.[0];
  const roster = useRoster(cohort?.id);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusTab, setStatusTab] = useState<"all" | "completed" | "pending">("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [reminded, setReminded] = useState(false);

  const students = roster.data ?? [];
  const completedCount = students.filter((s) => s.skills.length > 0).length;
  const pendingCount = students.length - completedCount;
  const completionRate = students.length ? Math.round((completedCount / students.length) * 100) : 0;

  // Calculate role counts
  const roleCounts: Record<string, number> = {
    leader: 0,
    frontend: 0,
    backend: 0,
    qa: 0,
    presenter: 0,
  };
  students.forEach((s) => {
    if (roleCounts[s.desired_role] !== undefined) {
      roleCounts[s.desired_role]++;
    }
  });

  const filteredStudents = students.filter((s) => {
    const hasDna = s.skills.length > 0;
    const matchesStatus =
      statusTab === "all" ||
      (statusTab === "completed" && hasDna) ||
      (statusTab === "pending" && !hasDna);
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.major.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || s.desired_role === roleFilter;
    return matchesStatus && matchesSearch && matchesRole;
  });

  function handleRemind() {
    setReminded(true);
    setTimeout(() => setReminded(false), 3500);
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* 1. Academic Context Selector */}
      <CourseClassSelector
        activeCohortId={selectedCohortId}
        onSelectCohort={(id) => setSelectedCohortId(id)}
      />

      {/* 2. Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.7rem] font-700 leading-[1.3] text-ink sm:text-[2rem]">
            Tiến độ Team DNA & Danh sách sinh viên 📊
          </h1>
          <p className="mt-1 text-[0.95rem] text-ink-soft">
            Theo dõi tỷ lệ hoàn thiện hồ sơ & kiểm soát cơ cấu vai trò lớp <span className="font-600 text-ink">{cohort?.name ?? "SWP391"}</span>
          </p>
        </div>

        <Button variant="secondary" onClick={handleRemind} disabled={reminded}>
          {reminded ? <Check className="size-4 text-fpt-green-ink" /> : <Bell className="size-4" />}
          {reminded ? "Đã gửi thông báo nhắc nhở!" : `Nhắc nhở ${pendingCount} SV chưa điền`}
        </Button>
      </div>

      {reminded && (
        <Card className="border-fpt-green/40 bg-fpt-green/10 p-4 text-[0.9rem] font-600 text-fpt-green-ink">
          🔔 Đã gửi thông báo nhắc nhở qua Email & App cho {pendingCount} sinh viên chưa hoàn thành Hồ sơ Team DNA!
        </Card>
      )}

      {/* 3. Progress Stat Cards & Role Balance Audit */}
      <div className="space-y-4">
        <Card className="grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x">
          <Stat label="Tổng số sinh viên" value={String(students.length)} tone="blue" />
          <Stat label="Đã hoàn thành DNA" value={`${completedCount}/${students.length}`} tone="green" />
          <Stat label="Tỷ lệ hoàn thành" value={`${completionRate}%`} tone={completionRate >= 80 ? "green" : "orange"} />
          <Stat label="Chưa nộp DNA" value={`${pendingCount} sinh viên`} tone={pendingCount > 0 ? "orange" : "green"} />
        </Card>

        {/* Role Balance Visual Audit Bar */}
        <Card className="p-5">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <div className="flex items-center gap-2">
              <UserCheck className="size-4.5 text-fpt-orange-ink" />
              <h2 className="text-[1.02rem] font-700 text-ink">Cơ cấu vai trò đăng ký (Role Distribution Audit)</h2>
            </div>
            <span className="text-[0.78rem] text-ink-soft">Dựa trên {students.length} sinh viên</span>
          </div>

          <div className="mt-4 space-y-2">
            {/* Visual Segments Bar */}
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-ink/[0.06]">
              {students.length > 0 && (
                <>
                  <div style={{ width: `${(roleCounts.leader / students.length) * 100}%` }} className="bg-fpt-orange" title="Leader" />
                  <div style={{ width: `${(roleCounts.frontend / students.length) * 100}%` }} className="bg-fpt-blue" title="Frontend" />
                  <div style={{ width: `${(roleCounts.backend / students.length) * 100}%` }} className="bg-ink" title="Backend" />
                  <div style={{ width: `${(roleCounts.qa / students.length) * 100}%` }} className="bg-fpt-green" title="QA" />
                  <div style={{ width: `${(roleCounts.presenter / students.length) * 100}%` }} className="bg-amber-400" title="Presenter" />
                </>
              )}
            </div>

            {/* Legend Labels */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[0.78rem] pt-1">
              <span className="inline-flex items-center gap-1.5 font-600 text-ink">
                <span className="size-2.5 rounded-full bg-fpt-orange" /> Leader: {roleCounts.leader} SV
              </span>
              <span className="inline-flex items-center gap-1.5 font-600 text-ink">
                <span className="size-2.5 rounded-full bg-fpt-blue" /> Front-end: {roleCounts.frontend} SV
              </span>
              <span className="inline-flex items-center gap-1.5 font-600 text-ink">
                <span className="size-2.5 rounded-full bg-ink" /> Back-end: {roleCounts.backend} SV
              </span>
              <span className="inline-flex items-center gap-1.5 font-600 text-ink">
                <span className="size-2.5 rounded-full bg-fpt-green" /> QA/Tester: {roleCounts.qa} SV
              </span>
              <span className="inline-flex items-center gap-1.5 font-600 text-ink">
                <span className="size-2.5 rounded-full bg-amber-400" /> Thuyết trình: {roleCounts.presenter} SV
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. Toolbar & Filter Controls */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-line">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 rounded-xl bg-ink/[0.04] p-1">
            <button
              type="button"
              onClick={() => setStatusTab("all")}
              className={`rounded-lg px-3 py-1.5 text-[0.82rem] font-600 transition-colors cursor-pointer ${
                statusTab === "all" ? "bg-surface text-ink shadow-xs" : "text-ink-soft hover:text-ink"
              }`}
            >
              Tất cả ({students.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusTab("completed")}
              className={`rounded-lg px-3 py-1.5 text-[0.82rem] font-600 transition-colors cursor-pointer ${
                statusTab === "completed" ? "bg-surface text-fpt-green-ink shadow-xs" : "text-ink-soft hover:text-ink"
              }`}
            >
              Đã điền DNA ({completedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusTab("pending")}
              className={`rounded-lg px-3 py-1.5 text-[0.82rem] font-600 transition-colors cursor-pointer ${
                statusTab === "pending" ? "bg-surface text-fpt-orange-ink shadow-xs" : "text-ink-soft hover:text-ink"
              }`}
            >
              Chưa điền ({pendingCount})
            </button>
          </div>

          {/* Search & Role Select */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên, MSSV, chuyên ngành..."
                className="w-full rounded-lg border border-line bg-surface py-1.5 pl-9 pr-3 text-[0.85rem] text-ink focus:border-fpt-blue focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Filter className="size-4 text-ink-faint" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-lg border border-line bg-surface py-1.5 px-2.5 text-[0.85rem] font-500 text-ink focus:outline-none cursor-pointer"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="leader">Nhóm trưởng</option>
                <option value="frontend">Front-end</option>
                <option value="backend">Back-end</option>
                <option value="qa">Kiểm thử (QA)</option>
                <option value="presenter">Thuyết trình</option>
              </select>
            </div>
          </div>
        </div>

        {/* 5. Roster Grid */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredStudents.map((student) => {
            const hasDna = student.skills.length > 0;
            const roleInfo = ROLE_VI[student.desired_role] || { label: student.desired_role, tone: "neutral" };
            return (
              <div
                key={student.id}
                className="flex flex-col justify-between rounded-xl border border-line bg-surface p-4 transition-all hover:border-fpt-blue/40 hover:shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Initials name={student.name} tone={hasDna ? "blue" : "orange"} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-[0.9rem] font-700 text-ink">{student.name}</p>
                          <span className="shrink-0 rounded bg-ink/[0.05] px-1 py-0.2 text-[0.68rem] font-600 text-ink-soft tabular-nums">
                            {student.id}
                          </span>
                        </div>
                        <p className="truncate text-[0.75rem] text-ink-faint mt-0.5">{student.major}</p>
                      </div>
                    </div>
                    <Badge tone={hasDna ? "green" : "orange"} className="shrink-0 text-[0.68rem]">
                      {hasDna ? "Đã có DNA" : "Chưa nộp"}
                    </Badge>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[0.78rem]">
                    <Badge tone={roleInfo.tone} className="text-[0.7rem]">
                      {roleInfo.label}
                    </Badge>
                    <span className="text-ink-faint">
                      {student.experience_years > 0 ? `${student.experience_years} năm KN` : "Mới bắt đầu"}
                    </span>
                  </div>

                  <div className="mt-2.5 space-y-1">
                    {student.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {student.skills.slice(0, 3).map((sk) => (
                          <span key={sk.name} className="inline-flex items-center gap-1 rounded bg-ink/[0.045] px-1.5 py-0.5 text-[0.68rem] text-ink-soft">
                            {sk.name} <span className="font-700 text-ink">{sk.proficiency}/5</span>
                            <Star className="size-2.5 fill-fpt-orange text-fpt-orange" />
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[0.75rem] italic text-ink-faint">Chưa cập nhật kỹ năng chuyên môn</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[0.72rem] text-ink-soft font-500">
                    <Calendar className="size-3 text-fpt-green-ink" /> {student.availability.length} khung rảnh
                  </span>
                  <Button variant="ghost" className="py-1 text-[0.75rem] text-fpt-blue-ink" onClick={() => setSelectedStudent(student)}>
                    <Eye className="size-3.5" /> Xem hồ sơ DNA
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Student DNA Modal */}
      <StudentDnaModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
    </div>
  );
}
