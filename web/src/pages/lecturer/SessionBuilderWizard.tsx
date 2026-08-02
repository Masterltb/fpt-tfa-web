import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import type { GroupingMode } from '../../types/api';
import { Header } from '../../components/common/Header';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { Sparkles, ArrowLeft, ShieldCheck, CheckCircle2, Play } from 'lucide-react';

export function SessionBuilderWizard() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // Form state
  const [selectedSectionCode, setSelectedSectionCode] = useState('SE1801 (SWE201c)');
  const [mode, setMode] = useState<GroupingMode>('HYBRID');
  const [minSize, setMinSize] = useState<number>(4);
  const [maxSize, setMaxSize] = useState<number>(6);
  const [targetSize, setTargetSize] = useState<number>(5);

  // CP-SAT Solver Weights (0-100 sliders)
  const [weightSkillBalance, setWeightSkillBalance] = useState(85);
  const [weightScheduleOverlap, setWeightScheduleOverlap] = useState(90);
  const [weightRoleCoverage, setWeightRoleCoverage] = useState(80);
  const [weightGpaHomogeneity, setWeightGpaHomogeneity] = useState(70);

  const [createSuccess, setCreateSuccess] = useState(false);

  // Mutation to create new Grouping Session
  const mutation = useMutation({
    mutationFn: (payload: any) => apiClient.post('/grouping-sessions', payload),
    onSuccess: () => {
      setCreateSuccess(true);
      setTimeout(() => {
        navigate('/lecturer/dashboard');
      }, 1500);
    },
  });

  const handleLaunch = () => {
    const sectionId = selectedSectionCode.includes('SE1801')
      ? 'sec_se1801_swe201c'
      : selectedSectionCode.includes('SE1802')
      ? 'sec_se1802_prj301'
      : 'sec_se1803_swp391';

    mutation.mutate({
      class_section_id: sectionId,
      name: `Phiên Ghép Nhóm ${selectedSectionCode}`,
      mode,
      team_min_size: minSize,
      team_max_size: maxSize,
      weights: {
        skillBalance: weightSkillBalance,
        scheduleOverlap: weightScheduleOverlap,
        roleCoverage: weightRoleCoverage,
        gpaHomogeneity: weightGpaHomogeneity,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        <div>
          <Link
            to="/lecturer/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft size={14} /> Quay lại trang quản trị Giảng viên
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold mb-1">
                <Sparkles size={14} /> Wizard Khởi Tạo Phiên Ghép Nhóm
              </div>
              <h2 className="text-xl font-bold text-slate-900">Cấu Hình Quy Định & Thuật Toán CP-SAT</h2>
              <p className="text-xs text-slate-500">
                Tuân thủ quy định tại <strong>docs/constitution.md</strong>: Giảng viên chịu trách nhiệm kiểm soát quy mô và ràng buộc môn học.
              </p>
            </div>

            <div className="text-right text-xs text-slate-400 font-bold">
              BƯỚC {activeStep} / 4
            </div>
          </div>

          {/* Step 1: Section & Grouping Mode */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Chọn Lớp Môn Học Phụ Trách</label>
                <select
                  value={selectedSectionCode}
                  onChange={(e) => setSelectedSectionCode(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="SE1801 (SWE201c)">SE1801 — SWE201c Introduction to Software Engineering (36 SV)</option>
                  <option value="SE1802 (PRJ301)">SE1802 — PRJ301 Java Web Application Development (32 SV)</option>
                  <option value="SE1803 (SWP391)">SE1803 — SWP391 Application Development Project (40 SV)</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 block">Chế Độ Ghép Nhóm (Grouping Mode)</label>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    {
                      id: 'HYBRID',
                      title: '⭐ HYBRID (Khuyến nghị)',
                      desc: 'Sinh viên tự tạo nhóm tự do trước hạn chót. Sau đó AI CP-SAT phân bổ sinh viên lẻ vào nhóm chưa đủ người.',
                    },
                    {
                      id: 'LECTURER_LED',
                      title: 'GV Lập Nhóm (100% AI)',
                      desc: 'AI chạy tối ưu hóa toàn bộ lớp thành các nhóm cân bằng nhất, không cho phép tự chọn.',
                    },
                    {
                      id: 'STUDENT_LED',
                      title: 'SV Tự Chọn (100% Student)',
                      desc: 'Sinh viên tự lập nhóm và gửi duyệt; GV chỉ duyệt nhóm đạt chuẩn quy mô theo quy định.',
                    },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id as GroupingMode)}
                      className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                        mode === m.id
                          ? 'border-orange-600 bg-orange-50/80 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-900 block">{m.title}</span>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{m.desc}</p>
                      </div>
                      {mode === m.id && (
                        <div className="pt-2 text-orange-600">
                          <CheckCircle2 size={16} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Team Size Constraints */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Quy Mô Nhóm theo Quy Định (docs/constitution.md)</h3>
                <p className="text-xs text-slate-500">
                  Ràng buộc cứng: AI CP-SAT sẽ từ chối nghiệm nếu không thỏa mãn số lượng tối thiểu/tối đa.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Số Thành Viên Tối Thiểu (Min)</label>
                  <input
                    type="number"
                    value={minSize}
                    onChange={(e) => setMinSize(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-sm font-black text-center"
                  />
                  <span className="text-[10px] text-slate-400 block">Chuẩn FPT: tối thiểu 4 sinh viên</span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Số Thành Viên Tối Đa (Max)</label>
                  <input
                    type="number"
                    value={maxSize}
                    onChange={(e) => setMaxSize(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-sm font-black text-center"
                  />
                  <span className="text-[10px] text-slate-400 block">Chuẩn FPT: tối đa 6 sinh viên</span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Quy Mô Mục Tiêu (Target)</label>
                  <input
                    type="number"
                    value={targetSize}
                    onChange={(e) => setTargetSize(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-sm font-black text-center"
                  />
                  <span className="text-[10px] text-slate-400 block">AI hướng tới nhóm {targetSize} người</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs flex items-center gap-3">
                <ShieldCheck size={20} className="text-cyan-600 shrink-0" />
                <span>
                  <strong>Kiểm chứng quy định:</strong> Quy mô 4 - 6 thành viên hoàn toàn hợp lệ cho môn học {selectedSectionCode}.
                </span>
              </div>
            </div>
          )}

          {/* Step 3: CP-SAT Optimization Skill Weights */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Điều Chỉnh Trọng Số Thuật Toán CP-SAT (0 - 100)</h3>
                <p className="text-xs text-slate-500">
                  Cấu hình hàm mục tiêu tối ưu hóa (Objective Function) theo đặc thù môn học.
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">Cân Bằng Kỹ Năng Kỹ Thuật (Frontend / Backend / DB)</span>
                    <span className="text-orange-600">{weightSkillBalance}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weightSkillBalance}
                    onChange={(e) => setWeightSkillBalance(Number(e.target.value))}
                    className="w-full accent-orange-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">Trùng Khớp Lịch Rảnh Làm Việc Chung (Schedule Overlap)</span>
                    <span className="text-emerald-600">{weightScheduleOverlap}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weightScheduleOverlap}
                    onChange={(e) => setWeightScheduleOverlap(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">Độ Phủ Vị Trí (Role Coverage: Dev / QA / BA)</span>
                    <span className="text-cyan-600">{weightRoleCoverage}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weightRoleCoverage}
                    onChange={(e) => setWeightRoleCoverage(Number(e.target.value))}
                    className="w-full accent-cyan-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">Đồng Nhất Mục Tiêu Điểm Số (GPA Homogeneity)</span>
                    <span className="text-purple-600">{weightGpaHomogeneity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weightGpaHomogeneity}
                    onChange={(e) => setWeightGpaHomogeneity(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Final Review & Launch */}
          {activeStep === 4 && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-orange-400 uppercase">Tổng Quan Cấu Hình Phiên</span>
                  <span className="text-xs font-semibold text-emerald-400">● SẴN SÀNG KHỞI TẠO</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Lớp Môn Học</span>
                    <strong className="text-sm">{selectedSectionCode}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Chế độ Ghép Nhóm</span>
                    <strong className="text-sm text-orange-400">{mode}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Ràng buộc Quy Mô (Min - Max)</span>
                    <strong className="text-sm">{minSize} - {maxSize} (Mục tiêu: {targetSize})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Trọng số Kỹ Năng / Lịch Rảnh</span>
                    <strong className="text-sm">{weightSkillBalance}% / {weightScheduleOverlap}%</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[11px] text-slate-400">
                    Sau khi bấm Khởi tạo, phiên sẽ mở cho sinh viên nộp hồ sơ Team DNA. Giảng viên có thể chạy thuật toán AI CP-SAT bất cứ lúc nào.
                  </p>
                </div>
              </div>

              {createSuccess && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  Đã khởi tạo phiên ghép nhóm thành công! Đang chuyển về bảng điều khiển...
                </div>
              )}

              {mutation.isError && (
                <ErrorAlert
                  title="Lỗi khởi tạo phiên ghép nhóm"
                  detail={(mutation.error as any)?.detail || 'Không thể gửi yêu cầu lên máy chủ.'}
                  onRetry={handleLaunch}
                />
              )}
            </div>
          )}

          {/* Stepper Navigation */}
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
                onClick={() => setActiveStep((prev) => Math.min(4, prev + 1) as any)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm"
              >
                Bước tiếp theo →
              </button>
            ) : (
              <button
                onClick={handleLaunch}
                disabled={mutation.isPending || createSuccess}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
              >
                <Play size={16} /> {mutation.isPending ? 'Đang khởi tạo...' : 'Khởi Tạo Phiên Ghép Nhóm'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
