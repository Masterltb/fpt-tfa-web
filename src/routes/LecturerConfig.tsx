import { useState } from "react";
import { Sliders, ShieldAlert, Check, Save, Trash2 } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { CourseClassSelector } from "@/components/CourseClassSelector";
import { useCohorts } from "@/lib/tfa";

export default function LecturerConfig() {
  const [selectedCohortId, setSelectedCohortId] = useState<string>(() => {
    return localStorage.getItem("tfa_selected_cohort_id") || "c1";
  });

  const cohorts = useCohorts();
  const cohort = cohorts.data?.find((c) => c.id === selectedCohortId) ?? cohorts.data?.[0];

  const [competencyWeight, setCompetencyWeight] = useState(40);
  const [scheduleWeight, setScheduleWeight] = useState(35);
  const [roleWeight, setRoleWeight] = useState(25);

  const [mustPairs, setMustPairs] = useState<[string, string][]>([["SE170123", "SE170456"]]);
  const [cannotPairs, setCannotPairs] = useState<[string, string][]>([["SE170888", "SE170999"]]);
  const [saved, setSaved] = useState(false);

  function handleSave() {
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
            Cấu hình Tiêu chí & Ràng buộc AI 🎛️
          </h1>
          <p className="mt-1 text-[0.95rem] text-ink-soft">
            Điều chỉnh trọng số thuật toán OR-Tools CP-SAT cho lớp <span className="font-600 text-ink">{cohort?.name ?? "SWP391"}</span>
          </p>
        </div>

        <Button variant="primary" onClick={handleSave} className="shadow-md">
          {saved ? <Check className="size-4" /> : <Save className="size-4" />}
          {saved ? "Đã lưu cấu hình AI!" : "Lưu tiêu chí & ràng buộc"}
        </Button>
      </div>

      {saved && (
        <Card className="border-fpt-green/40 bg-fpt-green/10 p-4 text-[0.9rem] font-600 text-fpt-green-ink">
          ✨ Đã lưu cấu hình thuật toán thành công! Lần xếp nhóm tiếp theo sẽ áp dụng các trọng số mới này.
        </Card>
      )}

      {/* 1. Algorithm Weights Sliders */}
      <Card className="p-5 space-y-5">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="size-5 text-fpt-orange-ink" />
            <h2 className="text-[1.1rem] font-700 text-ink">1. Trọng số thuật toán gợi ý (Weight Distribution)</h2>
          </div>
          <Badge tone="orange">Tổng: {competencyWeight + scheduleWeight + roleWeight}%</Badge>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-[0.9rem] font-600 text-ink">
              <span>Đồng đều trình độ & năng lực kỹ năng</span>
              <span className="font-700 text-fpt-blue-ink">{competencyWeight}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={competencyWeight}
              onChange={(e) => setCompetencyWeight(Number(e.target.value))}
              className="mt-2 w-full accent-fpt-blue cursor-pointer"
            />
            <p className="text-[0.78rem] text-ink-faint">Ưu tiên chia các sinh viên giỏi và yếu đều vào từng nhóm.</p>
          </div>

          <div>
            <div className="flex justify-between text-[0.9rem] font-600 text-ink">
              <span>Trùng lịch học tập rảnh trong tuần</span>
              <span className="font-700 text-fpt-green-ink">{scheduleWeight}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={scheduleWeight}
              onChange={(e) => setScheduleWeight(Number(e.target.value))}
              className="mt-2 w-full accent-fpt-green cursor-pointer"
            />
            <p className="text-[0.78rem] text-ink-faint">Tối đa hóa các khung giờ rảnh chung để cả nhóm dễ họp đồ án.</p>
          </div>

          <div>
            <div className="flex justify-between text-[0.9rem] font-600 text-ink">
              <span>Đa dạng hóa vai trò (Leader, FE, BE, QA, Presenter)</span>
              <span className="font-700 text-fpt-orange-ink">{roleWeight}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={roleWeight}
              onChange={(e) => setRoleWeight(Number(e.target.value))}
              className="mt-2 w-full accent-fpt-orange cursor-pointer"
            />
            <p className="text-[0.78rem] text-ink-faint">Đảm bảo mỗi nhóm đều phủ đủ 5 vai trò cần thiết.</p>
          </div>
        </div>
      </Card>

      {/* 2. Hard Constraints (Must-Pair & Cannot-Pair) */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-line pb-3">
          <ShieldAlert className="size-5 text-fpt-red" />
          <h2 className="text-[1.1rem] font-700 text-ink">2. Ràng buộc cứng (Hard Constraints - Inviolable Rules)</h2>
        </div>

        <p className="text-[0.85rem] text-ink-soft">
          Ràng buộc cứng là quy tắc bắt buộc 100% — thuật toán OR-Tools tuyệt đối không vi phạm.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Must Pair */}
          <div className="rounded-xl border border-line p-4 bg-surface">
            <div className="flex items-center justify-between">
              <span className="text-[0.92rem] font-700 text-ink">Cặp bắt buộc cùng nhóm (Must-Pair)</span>
              <Badge tone="green">Bắt buộc</Badge>
            </div>
            <p className="mt-1 text-[0.78rem] text-ink-soft">Ví dụ: 2 sinh viên làm chung dự án đợt trước.</p>

            <div className="mt-3 space-y-2">
              {mustPairs.map(([s1, s2], idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 rounded-lg bg-ink/[0.04] p-2 text-[0.82rem] font-600 text-ink">
                  <span>{s1} 🔗 {s2}</span>
                  <button type="button" onClick={() => setMustPairs(mustPairs.filter((_, i) => i !== idx))} className="text-ink-faint hover:text-fpt-red cursor-pointer">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cannot Pair */}
          <div className="rounded-xl border border-line p-4 bg-surface">
            <div className="flex items-center justify-between">
              <span className="text-[0.92rem] font-700 text-ink">Cặp tuyệt đối không chung nhóm (Cannot-Pair)</span>
              <Badge tone="danger">Cấm xếp chung</Badge>
            </div>
            <p className="mt-1 text-[0.78rem] text-ink-soft">Ví dụ: Tránh mâu thuẫn cá nhân hoặc trùng đề tài cũ.</p>

            <div className="mt-3 space-y-2">
              {cannotPairs.map(([s1, s2], idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 rounded-lg bg-fpt-red/[0.08] p-2 text-[0.82rem] font-600 text-fpt-red-ink">
                  <span>{s1} 🚫 {s2}</span>
                  <button type="button" onClick={() => setCannotPairs(cannotPairs.filter((_, i) => i !== idx))} className="text-ink-faint hover:text-fpt-red cursor-pointer">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
