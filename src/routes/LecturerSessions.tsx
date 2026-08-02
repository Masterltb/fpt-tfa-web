import { useState } from "react";
import { CheckCircle2, Layers } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { CourseClassSelector } from "@/components/CourseClassSelector";
import { useCohorts, useRoster } from "@/lib/tfa";

const MODES = [
  {
    id: "hybrid",
    name: "Hybrid Mode (Khuyên dùng)",
    badge: "Flagship",
    desc: "Sinh viên tự ghép nhóm theo ý muốn cho tới hết hạn. AI sẽ tự động lấp khoảng trống & phân bổ các sinh viên lẻ còn lại.",
  },
  {
    id: "lecturer-led",
    name: "Lecturer-Led (Giảng viên chốt)",
    badge: "Toàn bộ AI",
    desc: "Thuật toán OR-Tools tự động chia toàn bộ nhóm dựa trên Team DNA. Giảng viên duyệt & tinh chỉnh thủ công.",
  },
  {
    id: "student-led",
    name: "Student-Led (Tự do)",
    badge: "Thủ công",
    desc: "Sinh viên tự lập nhóm 100%. Giảng viên chỉ xem xét & chốt danh sách chính thức.",
  },
];

export default function LecturerSessions() {
  const [selectedCohortId, setSelectedCohortId] = useState<string>(() => {
    return localStorage.getItem("tfa_selected_cohort_id") || "c1";
  });

  const cohorts = useCohorts();
  const cohort = cohorts.data?.find((c) => c.id === selectedCohortId) ?? cohorts.data?.[0];
  const roster = useRoster(cohort?.id);

  const [selectedMode, setSelectedMode] = useState("hybrid");
  const [minSize, setMinSize] = useState(4);
  const [maxSize, setMaxSize] = useState(5);
  const [deadline, setDeadline] = useState("2026-08-15T23:59");
  const [saved, setSaved] = useState(false);

  function handleSaveSession() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <CourseClassSelector
        activeCohortId={selectedCohortId}
        onSelectCohort={(id) => setSelectedCohortId(id)}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.7rem] font-700 leading-[1.3] text-ink sm:text-[2rem]">
            Phiên gom nhóm & Chế độ chia ⚙️
          </h1>
          <p className="mt-1 text-[0.95rem] text-ink-soft">
            Lớp <span className="font-600 text-ink">{cohort?.name ?? "SWP391 · Summer 2026"}</span> ({roster.data?.length ?? 30} sinh viên)
          </p>
        </div>

        <Button variant="primary" onClick={handleSaveSession} className="shadow-md">
          {saved ? <CheckCircle2 className="size-4" /> : <Layers className="size-4" />}
          {saved ? "Đã lưu cấu hình phiên!" : "Lưu cài đặt phiên"}
        </Button>
      </div>

      {saved && (
        <Card className="border-fpt-green/40 bg-fpt-green/10 p-4 text-[0.9rem] font-600 text-fpt-green-ink">
          ✨ Đã lưu thiết lập phiên gom nhóm thành công!
        </Card>
      )}

      {/* Mode Selection Grid */}
      <div className="space-y-3">
        <h2 className="text-[1.1rem] font-700 text-ink">1. Chọn chế độ gom nhóm (Grouping Mode)</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {MODES.map((mode) => {
            const isSelected = selectedMode === mode.id;
            return (
              <Card
                key={mode.id}
                interactive
                onClick={() => setSelectedMode(mode.id)}
                className={`p-5 flex flex-col justify-between transition-all ${
                  isSelected
                    ? "border-fpt-orange bg-fpt-orange/[0.04] ring-2 ring-fpt-orange/20 shadow-sm"
                    : "border-line bg-surface hover:border-fpt-orange/30"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <Badge tone={isSelected ? "orange" : "neutral"}>{mode.badge}</Badge>
                    {isSelected && <CheckCircle2 className="size-4.5 text-fpt-orange-ink" />}
                  </div>
                  <h3 className="mt-3 text-[1.02rem] font-700 text-ink">{mode.name}</h3>
                  <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink-soft">{mode.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Constraints & Bounds */}
      <Card className="p-5 space-y-4">
        <h2 className="text-[1.1rem] font-700 text-ink border-b border-line pb-3">2. Giới hạn quy mô nhóm (Team Size Bounds)</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[0.88rem] font-600 text-ink">Số thành viên tối thiểu (Min size)</label>
            <input
              type="number"
              value={minSize}
              min={2}
              max={maxSize}
              onChange={(e) => setMinSize(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-line bg-surface p-2.5 text-[0.9rem] font-600 text-ink"
            />
            <p className="mt-1 text-[0.75rem] text-ink-faint">Hard constraint — Không nhóm nào dưới {minSize} sinh viên.</p>
          </div>

          <div>
            <label className="block text-[0.88rem] font-600 text-ink">Số thành viên tối đa (Max size)</label>
            <input
              type="number"
              value={maxSize}
              min={minSize}
              max={8}
              onChange={(e) => setMaxSize(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-line bg-surface p-2.5 text-[0.9rem] font-600 text-ink"
            />
            <p className="mt-1 text-[0.75rem] text-ink-faint">Hard constraint — Không nhóm nào vượt quá {maxSize} sinh viên.</p>
          </div>
        </div>

        {selectedMode === "hybrid" && (
          <div className="pt-3 border-t border-line">
            <label className="block text-[0.88rem] font-600 text-ink">Hạn chót sinh viên tự do đăng ký nhóm (Deadline)</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="mt-1.5 w-full sm:w-[320px] rounded-lg border border-line bg-surface p-2.5 text-[0.9rem] font-600 text-ink"
            />
            <p className="mt-1 text-[0.78rem] text-fpt-orange-ink font-500">
              ⏰ Sau thời điểm này, hệ thống sẽ tự động ghép phần sinh viên còn lại.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
