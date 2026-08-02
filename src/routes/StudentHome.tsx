import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Dna, UserCheck, Sparkles, Search,
  ArrowRight, CheckCircle2, AlertCircle, Globe
} from "lucide-react";
import { Badge, Button, Card, Initials } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { useCohorts, useRoster } from "@/lib/tfa";

const ROLE_VI: Record<string, string> = {
  backend: "Back-end Developer",
  frontend: "Front-end Developer",
  presenter: "Thuyết trình & Docs",
  qa: "Kiểm thử (QA/QC)",
  leader: "Nhóm trưởng",
  other: "Thành viên",
};

export default function StudentHome() {
  const { principal } = useAuth();
  const cohorts = useCohorts();
  const cohort = cohorts.data?.[0];
  const roster = useRoster(cohort?.id);
  const [searchTerm, setSearchTerm] = useState("");

  const me = roster.data?.find((s) => s.id === principal?.uid || s.name.includes(principal?.uid ?? ""));
  const isProfileComplete = Boolean(me && me.skills.length > 0 && me.desired_role);

  const filteredRoster = (roster.data ?? []).filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.major.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.7rem] font-700 leading-[1.3] tracking-[-0.01em] text-ink sm:text-[2rem]">
            Xin chào, {me?.name ?? principal?.uid} 👋
          </h1>
          <p className="mt-1 text-[0.95rem] text-ink-soft">
            Lớp <span className="font-600 text-ink">{cohort?.name ?? "SE1801 · Summer 2026"}</span> — Chế độ ghép nhóm: <span className="font-600 text-fpt-orange-ink">Hybrid (Tự chọn + AI hỗ trợ)</span>
          </p>
        </div>

        <Link to="/student/profile">
          <Button variant="primary" className="shadow-md">
            <Dna className="size-4" />
            {isProfileComplete ? "Cập nhật Hồ sơ DNA" : "Điền Hồ sơ Team DNA ngay"}
          </Button>
        </Link>
      </div>

      {/* Rules Notice Banner */}
      <Card className="p-4 bg-fpt-blue/[0.04] border-fpt-blue/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-fpt-blue/15 text-fpt-blue-ink">
            <Globe className="size-4.5" />
          </div>
          <div>
            <h3 className="text-[0.92rem] font-700 text-ink">Quy định ghép nhóm theo môn học tại FPT University</h3>
            <p className="text-[0.82rem] text-ink-soft mt-0.5">
              <b>Đồ án tốt nghiệp (SEP490/CAP490) & EXE</b>: Được ghép nhóm liên lớp. <b>Môn học thường (SWP391/PRN231)</b>: Yêu cầu cùng Lớp học phần.
            </p>
          </div>
        </div>
        <Link to="/student/my-team" className="shrink-0">
          <Button variant="secondary" className="py-1.5 text-[0.8rem]">
            Vào nhóm dự thảo <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </Card>

      {/* DNA Profile Completion Alert Banner */}
      {!isProfileComplete || !me ? (
        <Card className="border-fpt-orange/40 bg-gradient-to-r from-[#fffbf7] to-[#fef6f2] p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-fpt-orange/15 text-fpt-orange-ink">
                <AlertCircle className="size-5" />
              </div>
              <div>
                <h3 className="text-[1.02rem] font-700 text-ink">Hồ sơ Team DNA của bạn chưa hoàn tất</h3>
                <p className="mt-0.5 text-[0.88rem] text-ink-soft">
                  Hãy cập nhật 5 kỹ năng chuyên môn, vai trò mong muốn và lịch rảnh để AI đề xuất đồng đội phù hợp nhất!
                </p>
              </div>
            </div>
            <Link to="/student/profile" className="shrink-0">
              <Button variant="secondary" className="border-fpt-orange/30 text-fpt-orange-ink hover:bg-fpt-orange/10">
                Điền ngay <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="border-fpt-green/40 bg-gradient-to-r from-[#f6fcf8] to-[#f0f9f4] p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-fpt-green/15 text-fpt-green-ink">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <h3 className="text-[1.02rem] font-700 text-ink">Hồ sơ Team DNA đã sẵn sàng ✨</h3>
                <p className="mt-0.5 text-[0.88rem] text-ink-soft">
                  Vai trò đăng ký: <span className="font-600 text-ink">{ROLE_VI[me.desired_role] ?? me.desired_role}</span> · {me.skills.length} kỹ năng đã cập nhật.
                </p>
              </div>
            </div>
            <Link to="/student/recommendations" className="shrink-0">
              <Button variant="primary" className="bg-fpt-green hover:bg-fpt-green/90 text-white">
                <Sparkles className="size-4" /> Xem gợi ý ghép nhóm
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Quick Action Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card interactive className="p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex size-9 items-center justify-center rounded-lg bg-fpt-blue/12 text-fpt-blue-ink">
                <Dna className="size-4.5" />
              </span>
              <Badge tone={isProfileComplete ? "green" : "orange"}>
                {isProfileComplete ? "Hoàn tất" : "Cần bổ sung"}
              </Badge>
            </div>
            <h3 className="mt-3 text-[1rem] font-700 text-ink">Hồ sơ Team DNA</h3>
            <p className="mt-1 text-[0.82rem] text-ink-soft">Chuyên môn, vai trò & khung giờ rảnh của bạn.</p>
          </div>
          <Link to="/student/profile" className="mt-4 inline-flex items-center gap-1 text-[0.82rem] font-600 text-fpt-blue-ink hover:underline">
            Quản lý hồ sơ <ArrowRight className="size-3.5" />
          </Link>
        </Card>

        <Card interactive className="p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex size-9 items-center justify-center rounded-lg bg-fpt-orange/12 text-fpt-orange-ink">
                <UserCheck className="size-4.5" />
              </span>
              <Badge tone="neutral">Nhóm dự thảo</Badge>
            </div>
            <h3 className="mt-3 text-[1rem] font-700 text-ink">Nhóm của tôi</h3>
            <p className="mt-1 text-[0.82rem] text-ink-soft">Tự tạo hoặc gia nhập nhóm (nhập mã / mã liên lớp).</p>
          </div>
          <Link to="/student/my-team" className="mt-4 inline-flex items-center gap-1 text-[0.82rem] font-600 text-fpt-orange-ink hover:underline">
            Vào nhóm của tôi <ArrowRight className="size-3.5" />
          </Link>
        </Card>

        <Card interactive className="p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex size-9 items-center justify-center rounded-lg bg-fpt-green/12 text-fpt-green-ink">
                <Sparkles className="size-4.5" />
              </span>
              <Badge tone="green">OR-Tools AI</Badge>
            </div>
            <h3 className="mt-3 text-[1rem] font-700 text-ink">Gợi ý ghép nhóm AI</h3>
            <p className="mt-1 text-[0.82rem] text-ink-soft">Tìm đồng đội bù trừ kỹ năng và trùng lịch rảnh.</p>
          </div>
          <Link to="/student/recommendations" className="mt-4 inline-flex items-center gap-1 text-[0.82rem] font-600 text-fpt-green-ink hover:underline">
            Khám phá gợi ý <ArrowRight className="size-3.5" />
          </Link>
        </Card>
      </div>

      {/* Roster Table */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-line">
          <div>
            <h2 className="text-[1.05rem] font-700 text-ink">Danh sách sinh viên trong học kỳ</h2>
            <p className="text-[0.82rem] text-ink-soft">Tìm kiếm bạn học cùng khóa/ngành để trao đổi & mời vào nhóm dự thảo</p>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, MSSV, ngành..."
              className="w-full rounded-lg border border-line bg-surface py-1.5 pl-9 pr-3 text-[0.85rem] text-ink placeholder:text-ink-faint focus:border-fpt-blue focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {(filteredRoster ?? []).map((s) => {
            const hasDna = s.skills.length > 0;
            return (
              <div
                key={s.id}
                className="group flex items-center justify-between gap-3 rounded-xl border border-line/60 bg-surface/50 p-3 transition-all hover:border-fpt-blue/40 hover:bg-surface hover:shadow-sm"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Initials name={s.name} tone={hasDna ? "blue" : "orange"} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-[0.88rem] font-600 text-ink">{s.name}</p>
                      <span className="shrink-0 rounded bg-ink/[0.05] px-1 py-0.2 text-[0.68rem] font-600 text-ink-soft tabular-nums">
                        {s.id}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[0.75rem] text-ink-faint">
                      {s.major} · <span className="text-ink-soft">{ROLE_VI[s.desired_role] ?? s.desired_role}</span>
                    </p>
                  </div>
                </div>

                <Badge tone={hasDna ? "green" : "neutral"} className="shrink-0 text-[0.68rem]">
                  {hasDna ? "Đã có DNA" : "Chưa điền"}
                </Badge>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
