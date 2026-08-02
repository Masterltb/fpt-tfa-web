import { useState } from "react";
import { FileSpreadsheet, Upload, Check, Download, CheckCircle2 } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";

const MOCK_PREVIEW = [
  { id: "SE180101", name: "Nguyễn Văn An", major: "Kỹ thuật phần mềm", email: "annv@fpt.edu.vn", role: "backend" },
  { id: "SE180102", name: "Trần Thị Bình", major: "Kỹ thuật phần mềm", email: "binhtt@fpt.edu.vn", role: "frontend" },
  { id: "SE180103", name: "Lê Hoàng Cường", major: "An toàn thông tin", email: "cuonglh@fpt.edu.vn", role: "qa" },
  { id: "SE180104", name: "Phạm Minh Đức", major: "Thiết kế đồ họa", email: "ducpm@fpt.edu.vn", role: "presenter" },
  { id: "SE180105", name: "Vũ Phương Thảo", major: "Kỹ thuật phần mềm", email: "thaovp@fpt.edu.vn", role: "leader" },
];

export default function AdminImport() {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [imported, setImported] = useState(false);

  function handleSimulateUpload() {
    setFileUploaded(true);
  }

  function handleConfirmImport() {
    setImported(true);
    setTimeout(() => setImported(false), 3500);
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.7rem] font-700 leading-[1.3] text-ink sm:text-[2rem]">
            Import Danh sách Sinh viên CSV / Excel 📁
          </h1>
          <p className="mt-1 text-[0.95rem] text-ink-soft">
            Tải lên danh sách sinh viên theo từng Lớp học (Class Section) và Học kỳ (Term)
          </p>
        </div>

        <Button variant="secondary">
          <Download className="size-4" /> Tải file mẫu (.xlsx)
        </Button>
      </div>

      {imported && (
        <Card className="border-fpt-green/40 bg-fpt-green/10 p-4 text-[0.9rem] font-600 text-fpt-green-ink flex items-center gap-2">
          <CheckCircle2 className="size-5 shrink-0" />
          Đã nạp thành công 30 sinh viên vào lớp SE1801 (Môn SWP391 · Summer 2026)!
        </Card>
      )}

      {/* Upload Zone */}
      <Card className="p-8 text-center border-dashed border-2 border-line hover:border-fpt-orange/50 transition-colors bg-ink/[0.01]">
        <div className="flex flex-col items-center justify-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-fpt-orange/12 text-fpt-orange-ink mb-3">
            <Upload className="size-7" />
          </div>
          <h3 className="text-[1.1rem] font-700 text-ink">Kéo thả file CSV hoặc Excel vào đây</h3>
          <p className="mt-1 text-[0.85rem] text-ink-soft max-w-[45ch]">
            Hỗ trợ định dạng `.csv`, `.xlsx`, `.xls` — chứa các cột MSSV, Họ tên, Chuyên ngành và Email sinh viên FPT.
          </p>

          <Button variant="primary" onClick={handleSimulateUpload} className="mt-4 shadow-md">
            <FileSpreadsheet className="size-4" /> Chọn file từ máy tính
          </Button>
        </div>
      </Card>

      {/* Preview Table */}
      {fileUploaded && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h2 className="text-[1.05rem] font-700 text-ink">Xem trước dữ liệu (Preview 5/30 bản ghi)</h2>
              <p className="text-[0.82rem] text-ink-soft">File: <span className="font-600 text-ink">Danh_sach_SE1801_SWP391.xlsx</span></p>
            </div>
            <Button variant="primary" onClick={handleConfirmImport} disabled={imported}>
              <Check className="size-4" /> Xác nhận Import vào cơ sở dữ liệu
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[0.88rem]">
              <thead>
                <tr className="border-b border-line bg-ink/[0.03] text-ink-soft font-600">
                  <th className="py-2.5 px-3">MSSV</th>
                  <th className="py-2.5 px-3">Họ và Tên</th>
                  <th className="py-2.5 px-3">Chuyên ngành</th>
                  <th className="py-2.5 px-3">Email FPT</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {MOCK_PREVIEW.map((row) => (
                  <tr key={row.id} className="hover:bg-ink/[0.02]">
                    <td className="py-2.5 px-3 font-700 text-ink tabular-nums">{row.id}</td>
                    <td className="py-2.5 px-3 font-600 text-ink">{row.name}</td>
                    <td className="py-2.5 px-3 text-ink-soft">{row.major}</td>
                    <td className="py-2.5 px-3 text-ink-faint">{row.email}</td>
                    <td className="py-2.5 px-3">
                      <Badge tone="green" className="text-[0.7rem]">Hợp lệ</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
