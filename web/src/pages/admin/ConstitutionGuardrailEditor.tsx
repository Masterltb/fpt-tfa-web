import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Header } from '../../components/common/Header';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { ShieldCheck, ArrowLeft, CheckCircle2, Lock, AlertOctagon, Save } from 'lucide-react';

export function ConstitutionGuardrailEditor() {
  const [minTeamSize, setMinTeamSize] = useState(4);
  const [maxTeamSize, setMaxTeamSize] = useState(6);
  const [noStudentLeftBehind, setNoStudentLeftBehind] = useState(true);
  const [excludeSensitiveAttributes] = useState(true);
  const [requireLecturerApproval] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: (payload: any) => apiClient.put('/admin/constitution', payload),
    onSuccess: () => {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    },
  });

  const handleSave = () => {
    mutation.mutate({
      minTeamSize,
      maxTeamSize,
      noStudentLeftBehind,
      excludeSensitiveAttributes,
      requireLecturerApproval,
      version: 'v2026.08.02-locked',
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

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold mb-1">
                <ShieldCheck size={14} /> FPT TFA Constitution Guardrail Engine
              </div>
              <h2 className="text-xl font-black text-slate-900">
                Cấu Hình Luật Hiến Pháp Bất Biến (docs/constitution.md)
              </h2>
              <p className="text-xs text-slate-500">
                Các quy định tại đây là <strong>Hard Constraints</strong> được bộ giải OR-Tools CP-SAT thi hành tuyệt đối cho toàn bộ các cơ sở FPT.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold flex items-center gap-1">
                <Lock size={14} /> STRICT GOVERNANCE LOCKED
              </span>
            </div>
          </div>

          {/* Alert banner */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
            <AlertOctagon size={20} className="text-amber-600 shrink-0" />
            <div>
              <strong>Quy định không thể vi phạm:</strong> Bất kỳ sửa đổi nào tại trang này sẽ áp dụng lập tức cho tất cả các phiên ghép nhóm đang mở trong học kỳ Fall 2026.
            </div>
          </div>

          {/* Constraints Editor Section */}
          <div className="space-y-6">
            {/* Rule 1: Team size */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">1. Quy Mô Nhóm Chuẩn (Team Size Boundaries)</h3>
                  <p className="text-xs text-slate-500">Quy định số thành viên tối thiểu và tối đa cho mỗi nhóm môn học.</p>
                </div>
                <span className="text-xs font-bold text-slate-700">Hiến pháp hiện tại: 4 - 6 người</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Số Sinh Viên Tối Thiểu (Min Size)</label>
                  <input
                    type="number"
                    min="3"
                    max="5"
                    value={minTeamSize}
                    onChange={(e) => setMinTeamSize(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Số Sinh Viên Tối Đa (Max Size)</label>
                  <input
                    type="number"
                    min="5"
                    max="8"
                    value={maxTeamSize}
                    onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Rule 2: No Student Left Behind */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900">2. Ràng Buộc "No Student Left Behind"</h3>
                <p className="text-xs text-slate-600">
                  Thuật toán CP-SAT bắt buộc phải xếp 100% sinh viên trong lớp vào nhóm hợp lệ; không được để lại sinh viên lẻ. Nếu không thể thỏa mãn, bộ giải báo lỗi Infeasible.
                </p>
              </div>
              <input
                type="checkbox"
                checked={noStudentLeftBehind}
                onChange={(e) => setNoStudentLeftBehind(e.target.checked)}
                className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500"
              />
            </div>

            {/* Rule 3: Anti-discrimination */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900">3. Cấm Tín Hiệu Nhạy Cảm (Anti-Discrimination Filter)</h3>
                <p className="text-xs text-slate-600">
                  Theo <strong>docs/constitution.md</strong>: Tuyệt đối không sử dụng các thuộc tính giới tính, dân tộc, tôn giáo hay sức khỏe trong phương trình tối ưu hóa.
                </p>
              </div>
              <input
                type="checkbox"
                checked={excludeSensitiveAttributes}
                disabled
                className="w-5 h-5 rounded text-purple-600 bg-slate-200 cursor-not-allowed"
                title="Ràng buộc này được khóa cứng bởi hệ thống FPT Edu"
              />
            </div>

            {/* Rule 4: Human-in-the-Loop */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900">4. Phê Duyệt Bởi Giảng Viên (Lecturer Human Gate)</h3>
                <p className="text-xs text-slate-600">
                  AI chỉ đề xuất (AI Recommends — Lecturers Decide). Không cho phép tự động công bố (No Auto-Publish without explicit Lecturer Override approval).
                </p>
              </div>
              <input
                type="checkbox"
                checked={requireLecturerApproval}
                disabled
                className="w-5 h-5 rounded text-purple-600 bg-slate-200 cursor-not-allowed"
                title="Quy tắc Human-in-the-Loop là bất biến"
              />
            </div>
          </div>

          {/* Action and feedback */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            {saveSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Đã lưu & khóa cứng các quy định hiến pháp cho toàn bộ hệ thống FPT TFA!
              </div>
            )}

            {mutation.isError && (
              <ErrorAlert
                title="Không thể cập nhật luật hiến pháp"
                detail={(mutation.error as any)?.detail || 'Lỗi kết nối hoặc quyền Admin chưa đủ.'}
                onRetry={handleSave}
              />
            )}

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={mutation.isPending}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
              >
                <Save size={16} /> {mutation.isPending ? 'Đang lưu...' : 'Lưu & Khóa Cứng Luật Hiến Pháp'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
