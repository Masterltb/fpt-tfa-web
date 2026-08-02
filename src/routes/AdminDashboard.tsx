import { Building, Calendar, BookOpen, Users, Plus } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";

const HIERARCHY = [
  { level: "Cơ sở (Campus)", value: "5 cơ sở", detail: "Hà Nội, TP.HCM, Đà Nẵng, Cần Thơ, Quy Nhơn", icon: Building, color: "blue" as const },
  { level: "Học kỳ (Term)", value: "Summer 2026", detail: "Đang diễn ra (15/05/2026 - 30/08/2026)", icon: Calendar, color: "green" as const },
  { level: "Môn học (Course)", value: "SWP391", detail: "Software Development Project", icon: BookOpen, color: "orange" as const },
  { level: "Lớp học (Class Section)", value: "12 lớp học", detail: "SE1801 - SE1812", icon: Users, color: "purple" as const },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.7rem] font-700 leading-[1.3] text-ink sm:text-[2rem]">
            Quản trị hệ thống TFA 🛡️
          </h1>
          <p className="mt-1 text-[0.95rem] text-ink-soft">
            Cấu trúc phân cấp đào tạo FPT University: <span className="font-600 text-ink">Campus → Term → Course → ClassSection → GroupingSession</span>
          </p>
        </div>

        <Button variant="primary" className="shadow-md">
          <Plus className="size-4" /> Tạo học kỳ mới
        </Button>
      </div>

      {/* Hierarchy Stat Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {HIERARCHY.map((item) => (
          <Card key={item.level} className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[0.82rem] font-700 text-ink-soft uppercase tracking-wider">{item.level}</span>
                <item.icon className="size-5 text-fpt-blue-ink" />
              </div>
              <h3 className="mt-3 text-[1.4rem] font-700 text-ink">{item.value}</h3>
              <p className="mt-1 text-[0.8rem] text-ink-faint">{item.detail}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Active Campuses & Terms List */}
      <Card className="p-5">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h2 className="text-[1.1rem] font-700 text-ink">Danh sách cơ sở & Lớp học đang hoạt động</h2>
            <p className="text-[0.82rem] text-ink-soft">Hệ thống xếp nhóm tự động TFA - FPT University</p>
          </div>
          <Badge tone="green">Đang chạy 12 phiên gom nhóm</Badge>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {["FPT University Hà Nội (HOLA)", "FPT University TP.HCM (HCMC)", "FPT University Đà Nẵng", "FPT University Cần Thơ", "FPT University Quy Nhơn"].map((campus, idx) => (
            <div key={campus} className="rounded-xl border border-line p-4 bg-surface flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[0.92rem] font-700 text-ink">{campus}</span>
                  <Badge tone="blue">Cơ sở {idx + 1}</Badge>
                </div>
                <p className="mt-2 text-[0.82rem] text-ink-soft">Môn SWP391 · 3 lớp học · 95 sinh viên</p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-line flex items-center justify-between text-[0.78rem] text-ink-faint">
                <span>Trạng thái: Hoạt động</span>
                <span className="font-600 text-fpt-green-ink">Hoàn tất 100%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
