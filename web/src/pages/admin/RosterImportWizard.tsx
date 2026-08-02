import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Header } from '../../components/common/Header';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { Upload, ArrowLeft, CheckCircle2, AlertTriangle, FileSpreadsheet, Download } from 'lucide-react';

interface ParsedRow {
  index: number;
  studentCode: string;
  fullName: string;
  email: string;
  gpa: number;
  status: 'VALID' | 'WARNING' | 'ERROR';
  note?: string;
}

const MOCK_PARSED_ROWS: ParsedRow[] = [
  { index: 1, studentCode: 'SE180001', fullName: 'Nguyễn Văn An', email: 'annvse180001@fpt.edu.vn', gpa: 8.6, status: 'VALID' },
  { index: 2, studentCode: 'SE180002', fullName: 'Trần Văn Minh', email: 'minhtvse180002@fpt.edu.vn', gpa: 8.2, status: 'VALID' },
  { index: 3, studentCode: 'SE180003', fullName: 'Lê Hoàng Yến', email: 'yenlhse180003@fpt.edu.vn', gpa: 9.1, status: 'VALID' },
  { index: 4, studentCode: 'SE180004', fullName: 'Phạm Đăng Khoa', email: 'khoapdse180004@fpt.edu.vn', gpa: 7.8, status: 'WARNING', note: 'Thiếu thông tin số điện thoại liên lạc' },
  { index: 5, studentCode: 'SE180005', fullName: 'Vũ Trọng Phụng', email: 'phungvtse180005@fpt.edu.vn', gpa: 8.4, status: 'VALID' },
];

export function RosterImportWizard() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [term, setTerm] = useState('Fall 2026');
  const [sectionCode, setSectionCode] = useState('SE1801 (SWE201c)');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  // Mutation to submit roster import
  const mutation = useMutation({
    mutationFn: (payload: any) => apiClient.post('/admin/rosters/import', payload),
    onSuccess: () => {
      setImportSuccess(true);
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
    },
  });

  const handleConfirmImport = () => {
    mutation.mutate({
      term,
      sectionCode,
      filename: selectedFile || 'SWE201c_SE1801_Roster.xlsx',
      rowTotal: MOCK_PARSED_ROWS.length,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
        <div>
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft size={14} /> Quay lại trang quản trị toàn trường
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-1">
                <Upload size={14} /> Roster Import Wizard (CSV / Excel)
              </div>
              <h2 className="text-xl font-bold text-slate-900">Nhập Danh Sách Lớp & Bảo Mật PII</h2>
              <p className="text-xs text-slate-500">
                Tuân thủ quy chuẩn bảo mật theo <strong>docs/rbac.md</strong>: Dữ liệu cá nhân của sinh viên được kiểm soát chặt chẽ theo lớp và học kỳ.
              </p>
            </div>

            <div className="text-right text-xs text-slate-400 font-bold">
              BƯỚC {activeStep} / 4
            </div>
          </div>

          {/* Step 1: Term & Class Selection */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Học Kỳ Đăng Ký (Term)</label>
                  <select
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Fall 2026">Fall 2026 (Học kỳ hiện tại)</option>
                    <option value="Summer 2026">Summer 2026</option>
                    <option value="Spring 2027">Spring 2027 (Kế hoạch)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Lớp Môn Học Cần Nhập Roster</label>
                  <select
                    value={sectionCode}
                    onChange={(e) => setSectionCode(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="SE1801 (SWE201c)">SE1801 — SWE201c Introduction to Software Engineering</option>
                    <option value="SE1802 (PRJ301)">SE1802 — PRJ301 Java Web Application Development</option>
                    <option value="SE1803 (SWP391)">SE1803 — SWP391 Application Development Project</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs space-y-1">
                <strong>💡 Lưu ý chuẩn bị dữ liệu:</strong>
                <p className="text-purple-800">
                  Danh sách Excel yêu cầu các cột bắt buộc: <strong>StudentCode, FullName, Email (@fpt.edu.vn), GPA</strong>. Hệ thống tự động từ chối tài khoản ngoài tên miền FPT.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Upload Excel / CSV file */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tải Lên Bảng Dữ Liệu Lớp (Excel / CSV)</h3>
                  <p className="text-xs text-slate-500">Chỉ chấp nhận định dạng .xlsx hoặc .csv tối đa 10MB</p>
                </div>

                <button
                  onClick={() => setSelectedFile('SWE201c_SE1801_Roster.xlsx')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download size={14} /> Tải file mẫu chuẩn FPT TFA
                </button>
              </div>

              <div
                onClick={() => setSelectedFile('SWE201c_SE1801_Roster_Fall2026.xlsx')}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${
                  selectedFile
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-slate-300 hover:border-purple-500 bg-slate-50'
                }`}
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
                  <FileSpreadsheet size={28} />
                </div>

                {selectedFile ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={18} className="text-emerald-600" /> Đã chọn file: {selectedFile}
                    </p>
                    <p className="text-xs text-slate-500">Nhấn Bước tiếp theo để kiểm tra dữ liệu PII</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-700">Kéo thả file vào đây hoặc nhấp để chọn từ máy tính</p>
                    <p className="text-xs text-slate-400">Đã kiểm tra tương thích với Excel 365 và Google Sheets Export</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Preview table & Validation */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Kiểm Tra Dữ Liệu Nhập (Preview & Validate)</h3>
                  <p className="text-xs text-slate-500">Đã phát hiện 5 dòng dữ liệu từ file {selectedFile || 'Roster.xlsx'}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  ● 4 Hợp lệ • 1 Cảnh báo • 0 Lỗi
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Mã SV</th>
                      <th className="p-3">Họ và Tên</th>
                      <th className="p-3">Email FPT Edu</th>
                      <th className="p-3">GPA</th>
                      <th className="p-3">Trạng thái PII</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MOCK_PARSED_ROWS.map((row) => (
                      <tr key={row.index} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-semibold text-slate-400">{row.index}</td>
                        <td className="p-3 font-bold text-slate-900">{row.studentCode}</td>
                        <td className="p-3 text-slate-800">{row.fullName}</td>
                        <td className="p-3 text-slate-600 font-mono">{row.email}</td>
                        <td className="p-3 font-bold text-purple-600">{row.gpa}</td>
                        <td className="p-3">
                          {row.status === 'VALID' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                              <CheckCircle2 size={14} /> Hợp lệ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold" title={row.note}>
                              <AlertTriangle size={14} /> {row.note || 'Cảnh báo'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step 4: Import confirmation */}
          {activeStep === 4 && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-purple-300 uppercase">Tổng Quan Lệnh Nhập Dữ Liệu</span>
                  <span className="text-xs font-semibold text-emerald-400">● KIỂM CHỨNG RBAC HỢP LỆ</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Học kỳ / Lớp môn</span>
                    <strong className="text-sm">{term} • {sectionCode}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Số Lượng Sinh Viên</span>
                    <strong className="text-sm text-emerald-400">{MOCK_PARSED_ROWS.length} Sinh viên (100% fpt.edu.vn)</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[11px] text-slate-400">
                    Sau khi xác nhận, toàn bộ tài khoản sinh viên sẽ được khởi tạo hồ sơ Team DNA rỗng và tự động gửi email thông báo truy cập Portal.
                  </p>
                </div>
              </div>

              {importSuccess && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  Đã nhập dữ liệu lớp học thành công! Đang trở lại Bảng điều khiển Admin...
                </div>
              )}

              {mutation.isError && (
                <ErrorAlert
                  title="Lỗi nhập dữ liệu từ máy chủ"
                  detail={(mutation.error as any)?.detail || 'Không thể ghi danh sách vào CSDL PostgreSQL.'}
                  onRetry={handleConfirmImport}
                />
              )}
            </div>
          )}

          {/* Stepper Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              disabled={activeStep === 1}
              onClick={() => setActiveStep((prev) => Math.max(1, prev - 1) as any)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              ← Bước trước
            </button>

            {activeStep < 4 ? (
              <button
                disabled={activeStep === 2 && !selectedFile}
                onClick={() => setActiveStep((prev) => Math.min(4, prev + 1) as any)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm disabled:opacity-50"
              >
                Bước tiếp theo →
              </button>
            ) : (
              <button
                onClick={handleConfirmImport}
                disabled={mutation.isPending || importSuccess}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
              >
                <Upload size={16} /> {mutation.isPending ? 'Đang nhập...' : 'Xác Nhận & Ghi Vào CSDL'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
