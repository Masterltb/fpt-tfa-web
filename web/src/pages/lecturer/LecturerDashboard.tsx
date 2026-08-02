import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import type { ClassSection } from '../../types/api';
import { Header } from '../../components/common/Header';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { PlusCircle, BookOpen, ShieldCheck, Play, Sparkles } from 'lucide-react';

export function LecturerDashboard() {
  const {
    data: sections,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ClassSection[]>({
    queryKey: ['lecturers', 'me', 'sections'],
    queryFn: () => apiClient.get('/lecturers/me/sections'),
  });

  const hasSections = Array.isArray(sections) && sections.length > 0;

  // Fallback mock sections for Lecturer review & visual inspection
  const defaultSections: ClassSection[] = [
    {
      id: 'sec_se1801_swe201c',
      sectionCode: 'SE1801',
      courseCode: 'SWE201c',
      courseName: 'Introduction to Software Engineering',
      termId: 'term_fall2026',
      lecturerId: 'lec_01',
      lecturerName: 'TS. Nguyễn Văn Hùng',
      studentCount: 36,
      dnaCompletionRate: 92,
      activeSessionId: 'sess_01_se1801',
      activeSessionStatus: 'REVIEW',
      activeGroupingMode: 'HYBRID',
    },
    {
      id: 'sec_se1802_prj301',
      sectionCode: 'SE1802',
      courseCode: 'PRJ301',
      courseName: 'Java Web Application Development',
      termId: 'term_fall2026',
      lecturerId: 'lec_01',
      lecturerName: 'TS. Nguyễn Văn Hùng',
      studentCount: 32,
      dnaCompletionRate: 88,
      activeSessionId: 'sess_02_se1802',
      activeSessionStatus: 'OPEN',
      activeGroupingMode: 'LECTURER_LED',
    },
    {
      id: 'sec_se1803_swp391',
      sectionCode: 'SE1803',
      courseCode: 'SWP391',
      courseName: 'Application Development Project',
      termId: 'term_fall2026',
      lecturerId: 'lec_01',
      lecturerName: 'TS. Nguyễn Văn Hùng',
      studentCount: 40,
      dnaCompletionRate: 75,
      activeSessionStatus: 'DRAFT',
    },
  ];

  const displaySections = hasSections ? sections : defaultSections;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8">
        {/* Top Banner: Lecturer Authority & Human-in-the-Loop */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold">
              <ShieldCheck size={14} /> Human-in-the-Loop Authority
            </div>
            <h2 className="text-xl md:text-2xl font-black">
              Quản Lý Phiên Ghép Nhóm & Điều Chỉnh AI
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl">
              Quyền hạn tối cao theo <strong>docs/constitution.md</strong>: AI CP-SAT chỉ đóng vai trò khuyến nghị, Giảng viên quyết định phê duyệt và công bố nhóm cuối cùng.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              to="/lecturer/sessions/new"
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition flex items-center gap-2"
            >
              <PlusCircle size={16} /> Tạo Phiên Ghép Nhóm Mới
            </Link>
          </div>
        </div>

        {/* Header List */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Danh Sách Lớp Môn Học Phụ Trách</h3>
            <p className="text-xs text-slate-500">Quản lý cấu hình ghép nhóm, kích hoạt chạy CP-SAT và duyệt nhóm</p>
          </div>
          <button
            onClick={() => refetch()}
            className="text-xs text-orange-600 hover:text-orange-700 font-semibold transition"
          >
            Làm mới dữ liệu
          </button>
        </div>

        {/* State 1: Loading Skeleton */}
        {isLoading && (
          <div className="grid md:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        )}

        {/* State 2: Error Alert */}
        {isError && (
          <ErrorAlert
            title="Không thể tải danh sách lớp học của Giảng viên"
            detail={(error as any)?.detail || 'Lỗi kết nối hoặc quyền xác thực chưa hợp lệ.'}
            onRetry={() => refetch()}
          />
        )}

        {/* State 3: Empty State */}
        {!isLoading && !isError && displaySections.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <BookOpen size={32} />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900">Chưa Phụ Trách Lớp Môn Học Nào</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Tài khoản Giảng viên của bạn hiện chưa được phân công lớp nào trong học kỳ Fall 2026.
              </p>
            </div>
          </div>
        )}

        {/* State 4: Default Display Grid */}
        {!isLoading && !isError && displaySections.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displaySections.map((sec) => (
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
                        Lớp: <strong className="text-slate-800">{sec.sectionCode}</strong> • {sec.studentCount} Sinh viên
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                        sec.activeSessionStatus === 'REVIEW'
                          ? 'bg-amber-100 text-amber-800'
                          : sec.activeSessionStatus === 'OPEN'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sec.activeSessionStatus === 'PUBLISHED'
                          ? 'bg-cyan-100 text-cyan-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {sec.activeSessionStatus === 'REVIEW'
                        ? '● CHỜ GV DUYỆT'
                        : sec.activeSessionStatus === 'OPEN'
                        ? '● ĐANG MỞ GHÉP'
                        : sec.activeSessionStatus === 'PUBLISHED'
                        ? '● ĐÃ CÔNG BỐ'
                        : '● CHƯA TẠO PHIÊN'}
                    </span>
                  </div>

                  {/* DNA Progress & Mode Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Chế độ Ghép</span>
                      <span className="font-bold text-orange-600">
                        {sec.activeGroupingMode === 'HYBRID'
                          ? '⭐ HYBRID'
                          : sec.activeGroupingMode === 'LECTURER_LED'
                          ? 'GV Lập Nhóm (100% AI)'
                          : sec.activeGroupingMode === 'STUDENT_LED'
                          ? 'SV Tự Nhóm'
                          : 'Chưa chọn'}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Tỷ lệ nộp DNA</span>
                      <span className="font-bold text-slate-900">{sec.dnaCompletionRate}% Sinh viên</span>
                    </div>
                  </div>
                </div>

                {/* Lecturer Context Actions */}
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  {sec.activeSessionStatus === 'REVIEW' ? (
                    <Link
                      to={`/lecturer/sessions/${sec.activeSessionId || sec.id}/override`}
                      className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs text-center shadow-sm transition flex items-center justify-center gap-1.5"
                    >
                      <Sparkles size={14} /> Duyệt & Đảo Nhóm (Override Studio)
                    </Link>
                  ) : sec.activeSessionStatus === 'OPEN' ? (
                    <Link
                      to={`/lecturer/sessions/${sec.activeSessionId || sec.id}/matching`}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center shadow-sm transition flex items-center justify-center gap-1.5"
                    >
                      <Play size={14} /> Kích Hoạt Chạy AI CP-SAT
                    </Link>
                  ) : (
                    <Link
                      to="/lecturer/sessions/new"
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs text-center transition flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle size={14} /> Cấu Hình Phiên Ghép Nhóm
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
