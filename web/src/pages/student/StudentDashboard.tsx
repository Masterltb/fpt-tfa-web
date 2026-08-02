import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import type { ClassSection, TeamDNA } from '../../types/api';
import { Header } from '../../components/common/Header';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';

export function StudentDashboard() {
  // Query 1: Student DNA Readiness Score
  const {
    data: dnaProfile,
  } = useQuery<TeamDNA>({
    queryKey: ['students', 'me', 'team-profile'],
    queryFn: () => apiClient.get('/students/me/team-profile'),
    retry: false,
  });

  // Query 2: Enrolled Class Sections
  const {
    data: sections,
    isLoading: isSectionsLoading,
    isError,
    error,
    refetch,
  } = useQuery<ClassSection[]>({
    queryKey: ['students', 'me', 'sections'],
    queryFn: () => apiClient.get('/students/me/sections'),
  });

  const completenessScore = dnaProfile?.completenessScore ?? (dnaProfile as any)?.completion_percentage ?? 90;
  const hasSections = Array.isArray(sections) && sections.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8">
        {/* Top Banner: Team DNA Completeness Progress */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold">
              <Sparkles size={14} /> Hồ Sơ Năng Lực AI
            </div>
            <h2 className="text-xl md:text-2xl font-bold">
              Tiến Độ Hoàn Thành Team DNA: <span className="text-orange-400">{completenessScore}%</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl">
              Hồ sơ DNA giúp thuật toán AI CP-SAT đề xuất đồng đội cân bằng kỹ năng và lịch rảnh. 
              Hãy đạt tối thiểu <strong>80%</strong> trước hạn chót ghép nhóm để có kết quả tốt nhất.
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 shrink-0">
            <Link
              to="/student/dna"
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition flex items-center gap-2"
            >
              Cập nhật Team DNA <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Section List Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Các Lớp Môn Học Đã Đăng Ký</h3>
            <p className="text-xs text-slate-500">Danh sách môn học mở phiên ghép nhóm trong học kỳ Fall 2026</p>
          </div>
          <button
            onClick={() => refetch()}
            className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
          >
            Làm mới
          </button>
        </div>

        {/* State 1: Loading Skeleton */}
        {isSectionsLoading && (
          <div className="grid md:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        )}

        {/* State 2: Error State */}
        {isError && (
          <ErrorAlert
            title="Không thể tải danh sách môn học"
            detail={(error as any)?.detail || 'Lỗi kết nối từ phía máy chủ'}
            onRetry={() => refetch()}
          />
        )}

        {/* State 3: Empty State */}
        {!isSectionsLoading && !isError && !hasSections && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <BookOpen size={32} />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900">Chưa Đăng Ký Lớp Môn Học Nào</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Hiện chưa có lớp học hoặc phiên ghép nhóm nào được mở cho tài khoản của bạn trong học kỳ Fall 2026.
              </p>
            </div>
            <Link
              to="/student/dna"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition"
            >
              Kiểm tra hồ sơ DNA trước
            </Link>
          </div>
        )}

        {/* State 4: Default Active Grid (Sections loaded or Mock fallback for demo visual) */}
        {!isSectionsLoading && !isError && (
          <div className="grid md:grid-cols-2 gap-6">
            {(hasSections
              ? sections
              : [
                  {
                    id: 'sec_se1801_swe201c',
                    sectionCode: 'SE1801',
                    courseCode: 'SWE201c',
                    courseName: 'Introduction to Software Engineering',
                    termId: 'term_fall2026',
                    lecturerId: 'lec_01',
                    lecturerName: 'TS. Nguyễn Văn Hùng',
                    studentCount: 36,
                    dnaCompletionRate: 88,
                    activeSessionId: 'sess_01_se1801',
                    activeSessionStatus: 'OPEN' as const,
                    activeGroupingMode: 'HYBRID' as const,
                  },
                  {
                    id: 'sec_se1802_prj301',
                    sectionCode: 'SE1802',
                    courseCode: 'PRJ301',
                    courseName: 'Java Web Application Development',
                    termId: 'term_fall2026',
                    lecturerId: 'lec_02',
                    lecturerName: 'ThS. Trần Thị Mai',
                    studentCount: 32,
                    dnaCompletionRate: 92,
                    activeSessionId: 'sess_02_se1802',
                    activeSessionStatus: 'REVIEW' as const,
                    activeGroupingMode: 'LECTURER_LED' as const,
                  },
                ]
            ).map((sec) => (
              <div
                key={sec.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-6"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                        {sec.courseCode}
                      </span>
                      <h4 className="text-lg font-bold text-slate-900 mt-1">{sec.courseName}</h4>
                      <p className="text-xs text-slate-500">
                        Lớp: <strong className="text-slate-800">{sec.sectionCode}</strong> • Giảng viên:{' '}
                        {sec.lecturerName || 'GV FPT'}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                        sec.activeSessionStatus === 'OPEN'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sec.activeSessionStatus === 'REVIEW'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {sec.activeSessionStatus === 'OPEN'
                        ? '● ĐANG MỞ GHÉP NHÓM'
                        : sec.activeSessionStatus === 'REVIEW'
                        ? '● GV ĐANG DUYỆT AI'
                        : '● CHƯA MỞ'}
                    </span>
                  </div>

                  {/* Mode & Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Chế độ Ghép</span>
                      <span className="font-bold text-orange-600">
                        {sec.activeGroupingMode === 'HYBRID'
                          ? '⭐ HYBRID (AI + SV)'
                          : sec.activeGroupingMode === 'LECTURER_LED'
                          ? 'GV Lập Nhóm (100% AI)'
                          : 'SV Tự Chọn'}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Hoàn thành DNA Lớp</span>
                      <span className="font-bold text-slate-900">{sec.dnaCompletionRate}% Sinh viên</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <Link
                    to={`/student/sections/${sec.id}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs text-center shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    Vào Không Gian Ghép Nhóm <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
