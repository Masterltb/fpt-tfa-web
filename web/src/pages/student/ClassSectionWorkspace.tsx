import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import type { ClassSection } from '../../types/api';
import { Header } from '../../components/common/Header';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { Users, Clock, Sparkles, ArrowLeft } from 'lucide-react';

export function ClassSectionWorkspace() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MY_TEAM'>('OVERVIEW');

  // Query section info
  const {
    data: section,
    isLoading: isSectionLoading,
    isError,
    error,
    refetch,
  } = useQuery<ClassSection>({
    queryKey: ['sections', sectionId],
    queryFn: () => apiClient.get(`/sections/${sectionId}`),
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        {/* Back navigation */}
        <div>
          <Link
            to="/student/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft size={14} /> Quay lại danh sách lớp học
          </Link>
        </div>

        {/* State 1: Loading */}
        {isSectionLoading && (
          <div className="space-y-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        )}

        {/* State 2: Error */}
        {isError && (
          <ErrorAlert
            title="Không thể tải thông tin lớp học"
            detail={(error as any)?.detail || 'Lỗi kết nối từ phía máy chủ'}
            onRetry={() => refetch()}
          />
        )}

        {/* State 3: Active Loaded content (with mock fallback for visual complete inspection) */}
        {!isSectionLoading && !isError && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                    {section?.courseCode || 'SWE201c'}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    Lớp: <strong className="text-slate-800">{section?.sectionCode || 'SE1801'}</strong>
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  {section?.courseName || 'Introduction to Software Engineering'}
                </h2>
                <p className="text-xs text-slate-500">
                  Giảng viên phụ trách: <strong className="text-slate-700">{section?.lecturerName || 'TS. Nguyễn Văn Hùng'}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to={`/student/sections/${sectionId || 'sec_se1801_swe201c'}/recommendations`}
                  className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-2"
                >
                  <Sparkles size={16} /> Xem AI Gợi Ý Bạn Học
                </Link>
              </div>
            </div>

            {/* Sub-navigation Tabs */}
            <div className="flex border-b border-slate-200 text-xs font-semibold gap-6">
              <button
                onClick={() => setActiveTab('OVERVIEW')}
                className={`py-3 border-b-2 transition ${
                  activeTab === 'OVERVIEW'
                    ? 'border-orange-600 text-orange-600 font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Tổng Quan Phiên Ghép
              </button>
              <button
                onClick={() => setActiveTab('MY_TEAM')}
                className={`py-3 border-b-2 transition ${
                  activeTab === 'MY_TEAM'
                    ? 'border-orange-600 text-orange-600 font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Nhóm Của Tôi (My Team)
              </button>
            </div>

            {/* Tab Content: OVERVIEW */}
            {activeTab === 'OVERVIEW' && (
              <div className="grid md:grid-cols-3 gap-6">
                {/* 2 cols: Grouping Mode & Rules */}
                <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Cấu Hình Phiên Ghép Nhóm (Lecturer Config)</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Giảng viên đã quy định các tiêu chuẩn và ràng buộc cho lớp này per docs/constitution.md.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Chế Độ Ghép Nhóm</span>
                      <p className="text-sm font-bold text-orange-600">⭐ HYBRID (Sinh Viên + AI)</p>
                      <p className="text-xs text-slate-600">
                        Sinh viên tự tạo hoặc gia nhập nhóm tự do trước hạn chót. Sau deadline, AI CP-SAT tự động ghép bổ sung vào các nhóm chưa đủ thành viên.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Quy Mô Nhóm (Team Size)</span>
                      <p className="text-sm font-bold text-slate-900">4 - 6 Thành viên / Nhóm</p>
                      <p className="text-xs text-slate-600">
                        Hiến pháp cấm mọi thao tác phá vỡ giới hạn này mà không có chấp thuận từ Giảng viên.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                    <strong className="flex items-center gap-1.5">
                      <Clock size={16} className="text-amber-600" /> Hạn Chót Tự Chọn Nhóm: 23:59 — Chủ Nhật, 15/09/2026
                    </strong>
                    <p className="text-amber-800">
                      Sau thời điểm này, phiên ghép nhóm sẽ chuyển sang trạng thái <strong>FROZEN</strong> để thuật toán AI chạy phân rã tối ưu hóa cho toàn bộ sinh viên chưa có nhóm.
                    </p>
                  </div>
                </div>

                {/* 1 col: AI Recommendations shortcut banner */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-md space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                      <Sparkles size={22} />
                    </div>
                    <h3 className="font-bold text-base">Gợi Ý Đồng Đội Từ AI</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Dựa trên <strong>Hồ Sơ Team DNA</strong> của bạn, hệ thống AI đã phân tích và tìm ra 8 bạn học có kỹ năng bổ trợ và thời gian chung phù hợp nhất.
                    </p>
                  </div>

                  <Link
                    to={`/student/sections/${sectionId || 'sec_se1801_swe201c'}/recommendations`}
                    className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs text-center shadow-md transition block"
                  >
                    Xem Ngay Danh Sách AI Gợi Ý
                  </Link>
                </div>
              </div>
            )}

            {/* Tab Content: MY_TEAM */}
            {activeTab === 'MY_TEAM' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
                  <Users size={28} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900">Bạn Chưa Gia Nhập Nhóm Nào</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Bạn có thể tự tạo nhóm mới, xin gia nhập các nhóm đang tuyển thành viên, hoặc xem gợi ý từ AI để tìm đồng đội phù hợp.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Link
                    to={`/student/sections/${sectionId || 'sec_se1801_swe201c'}/recommendations`}
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition shadow-sm"
                  >
                    Tìm Đồng Đội Theo Gợi Ý AI
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
