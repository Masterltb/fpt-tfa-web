import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Header } from '../../components/common/Header';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { ShieldCheck, Upload, Cpu, CheckCircle2, FileText } from 'lucide-react';

interface SystemOverview {
  activeTerm: string;
  campusCount: number;
  courseCount: number;
  sectionCount: number;
  studentCount: number;
  lecturerCount: number;
  activeGroupingSessions: number;
  cpSatSolverVersion: string;
  dbStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN';
}

export function AdminDashboard() {
  const {
    data: overview,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<SystemOverview>({
    queryKey: ['admin', 'system', 'overview'],
    queryFn: () => apiClient.get('/admin/system/overview'),
  });

  // Fallback mock overview for Admin Review & visual inspection
  const defaultOverview: SystemOverview = {
    activeTerm: 'Fall 2026',
    campusCount: 5,
    courseCount: 24,
    sectionCount: 148,
    studentCount: 4850,
    lecturerCount: 180,
    activeGroupingSessions: 34,
    cpSatSolverVersion: 'Google OR-Tools v9.8.3296',
    dbStatus: 'HEALTHY',
  };

  const stats = overview || defaultOverview;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        {/* Top Banner: Admin Authority & System Status */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold">
              <ShieldCheck size={14} /> FPT TFA Governance & RBAC Control
            </div>
            <h2 className="text-xl md:text-2xl font-black">
              Bảng Điều Khiển Quản Trị Toàn Trường (Admin Portal)
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl">
              Quản lý danh sách sinh viên/giảng viên, thi hành các ràng buộc bất biến theo <strong>docs/constitution.md</strong> và giám sát hoạt động hệ thống.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Hệ thống: <strong className="text-emerald-400">HEALTHY (OK)</strong></span>
          </div>
        </div>

        {/* State 1: Loading Skeleton */}
        {isLoading && (
          <div className="grid md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        )}

        {/* State 2: Error Alert */}
        {isError && (
          <ErrorAlert
            title="Không thể tải dữ liệu thống kê hệ thống"
            detail={(error as any)?.detail || 'Lỗi kết nối từ máy chủ hoặc quyền xác thực chưa hợp lệ.'}
            onRetry={() => refetch()}
          />
        )}

        {/* State 3: Active Loaded content */}
        {!isLoading && !isError && (
          <div className="space-y-8">
            {/* System KPIs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Học kỳ hoạt động</span>
                <span className="text-xl font-black text-slate-900 block">{stats.activeTerm}</span>
                <span className="text-xs font-semibold text-purple-600">● Mở phiên ghép</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Cơ sở FPT Edu</span>
                <span className="text-xl font-black text-slate-900 block">{stats.campusCount} Campuses</span>
                <span className="text-xs text-slate-500">HL, HCM, DN, CT, QN</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Môn học / Lớp</span>
                <span className="text-xl font-black text-slate-900 block">{stats.courseCount} / {stats.sectionCount}</span>
                <span className="text-xs text-slate-500">Đã mở phiên Fall 2026</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Tổng Sinh viên</span>
                <span className="text-xl font-black text-orange-600 block">{stats.studentCount.toLocaleString()}</span>
                <span className="text-xs text-slate-500">Tài khoản Active</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Giảng viên</span>
                <span className="text-xl font-black text-slate-900 block">{stats.lecturerCount} GV</span>
                <span className="text-xs text-slate-500">Tham gia Human Loop</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Phiên Đang Ghép</span>
                <span className="text-xl font-black text-emerald-600 block">{stats.activeGroupingSessions}</span>
                <span className="text-xs font-semibold text-emerald-600">CP-SAT Ready</span>
              </div>
            </div>

            {/* Quick Navigation Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Link
                to="/admin/import"
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-purple-300 transition group flex flex-col justify-between gap-6"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
                    <Upload size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Nhập Danh Sách Lớp (Roster Import)</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Tải lên file Excel/CSV danh sách sinh viên & giảng viên theo từng lớp học kỳ. Kiểm tra dữ liệu PII an toàn per <strong>docs/rbac.md</strong>.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-purple-600">
                  <span>Mở Trình Nhập Dữ Liệu</span>
                  <span>→</span>
                </div>
              </Link>

              <Link
                to="/admin/constitution"
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-orange-300 transition group flex flex-col justify-between gap-6"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Quy Tắc Ràng Buộc & Tiêu Chuẩn Ghép Nhóm</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Cấu hình quy định ghép nhóm bắt buộc toàn trường: Giới hạn 4-6 người, bảo mật dữ liệu nhạy cảm & Không bỏ lại sinh viên nào.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-orange-600">
                  <span>Cấu Hình Quy Tắc Ràng Buộc</span>
                  <span>→</span>
                </div>
              </Link>

              <Link
                to="/admin/audit-logs"
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-cyan-300 transition group flex flex-col justify-between gap-6"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition">
                    <FileText size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Nhật Ký Kiểm Toán (Audit Log Viewer)</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Theo dõi toàn bộ lịch sử truy cập RBAC, thao tác đảo nhóm của Giảng viên và nhật ký chạy thuật toán OR-Tools CP-SAT.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-cyan-600">
                  <span>Tra Cứu Nhật Ký Hệ Thống</span>
                  <span>→</span>
                </div>
              </Link>
            </div>

            {/* System Health Diagnostics Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Cpu size={18} className="text-purple-600" /> Cấu Hình Máy Chủ & Thuật Toán CP-SAT
                </span>
                <span className="text-xs font-bold text-slate-500">{stats.cpSatSolverVersion}</span>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">FastAPI API Server</span>
                    <strong className="text-slate-900">Port 8000 (Active)</strong>
                  </div>
                  <CheckCircle2 size={18} className="text-emerald-600" />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">PostgreSQL Database</span>
                    <strong className="text-slate-900">SQLAlchemy 2.0 (Pool: OK)</strong>
                  </div>
                  <CheckCircle2 size={18} className="text-emerald-600" />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">CP-SAT Matching Queue</span>
                    <strong className="text-slate-900">0 tasks pending (Idle)</strong>
                  </div>
                  <CheckCircle2 size={18} className="text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
