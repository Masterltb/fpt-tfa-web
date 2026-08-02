import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import type { Recommendation } from '../../types/api';
import { Header } from '../../components/common/Header';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { Sparkles, UserPlus, Check, ArrowLeft, ShieldCheck } from 'lucide-react';

export function AiRecommendations() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const [invitedIds, setInvitedIds] = useState<string[]>([]);

  // Query AI recommendations
  const {
    data: recommendations,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Recommendation[]>({
    queryKey: ['sections', sectionId, 'recommendations'],
    queryFn: () => apiClient.get(`/grouping-sessions/sess_${sectionId}/recommendations`),
    retry: false,
  });

  const handleInvite = (targetStudentId: string) => {
    setInvitedIds((prev) => [...prev, targetStudentId]);
  };

  // Fallback mock recommendations for demo visual inspection per Tech Lead requirements
  const defaultRecommendations: Recommendation[] = [
    {
      targetStudentId: 'stu_02',
      targetStudentName: 'Trần Văn Minh',
      matchScore: 94,
      reasons: [
        'Kỹ năng bổ trợ tuyệt vời: Minh mạnh Frontend (React 5★), bạn mạnh Backend (Python 4★).',
        'Trùng 3 khung giờ làm việc: Tối Thứ 2, Tối Thứ 4 & Cả ngày Thứ 7.',
        'Cùng mục tiêu điểm số A (8.5 - 10.0) và mức độ cam kết Cao.',
      ],
      complementarySkills: ['React / TypeScript', 'UI-UX Figma', 'Tailwind CSS'],
    },
    {
      targetStudentId: 'stu_03',
      targetStudentName: 'Lê Hoàng Yến',
      matchScore: 89,
      reasons: [
        'Bổ sung vai trò Project Manager / Agile Scrum Master cho nhóm.',
        'Kinh nghiệm viết tài liệu SRS và chuẩn bị slide thuyết trình bảo vệ đồ án.',
        'Trùng lịch rảnh cuối tuần (Thứ 7 & Chủ Nhật).',
      ],
      complementarySkills: ['Project Management', 'Business Analysis', 'SQL Database'],
    },
    {
      targetStudentId: 'stu_04',
      targetStudentName: 'Phạm Đăng Khoa',
      matchScore: 86,
      reasons: [
        'Chuyên gia DevOps & Docker: Xử lý triển khai CI/CD và cấu hình cloud server.',
        'Hỗ trợ tốt kỹ năng lập trình Backend với Node.js / Express.',
      ],
      complementarySkills: ['Docker / CI-CD', 'Linux / Bash', 'Node.js'],
    },
  ];

  const list = Array.isArray(recommendations) && recommendations.length > 0
    ? recommendations
    : defaultRecommendations;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        {/* Back navigation */}
        <div>
          <Link
            to={`/student/sections/${sectionId || 'sec_se1801_swe201c'}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft size={14} /> Quay lại không gian lớp học
          </Link>
        </div>

        {/* Top Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
              <Sparkles size={14} /> AI Matching Engine • Explainable XAI
            </div>
            <h2 className="text-xl font-bold text-slate-900">Gợi Ý Đồng Đội Cân Bằng Nhất</h2>
            <p className="text-xs text-slate-500 max-w-2xl">
              Thuật toán AI CP-SAT phân tích kỹ năng, thời gian chung và vai trò mong muốn để đưa ra lời giải thích minh bạch tại sao hai bạn là một cặp hoàn hảo.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Đảm bảo quyền riêng tư PII per <strong>docs/rbac.md</strong></span>
          </div>
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
            title="Không thể tải gợi ý từ AI"
            detail={(error as any)?.detail || 'Lỗi xử lý thuật toán hoặc kết nối máy chủ.'}
            onRetry={() => refetch()}
          />
        )}

        {/* State 3: Recommendation Cards Grid */}
        {!isLoading && !isError && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((item) => {
              const isInvited = invitedIds.includes(item.targetStudentId);
              return (
                <div
                  key={item.targetStudentId}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-6"
                >
                  <div className="space-y-4">
                    {/* Student Identity & Match Score badge */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 font-bold text-sm flex items-center justify-center">
                          {item.targetStudentName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-slate-900 leading-tight">
                            {item.targetStudentName}
                          </h4>
                          <span className="text-[11px] text-slate-400 font-semibold">
                            ID: {item.targetStudentId}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-orange-600 text-white text-xs font-black shadow-xs">
                        {item.matchScore}% Match
                      </span>
                    </div>

                    {/* Complementary Skills Tags */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Kỹ Năng Nổi Bật Bổ Trợ
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.complementarySkills.map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* XAI Explainable Rationale Box (Constitution requirement) */}
                    <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200/80 space-y-2">
                      <span className="text-[11px] font-bold text-orange-900 flex items-center gap-1.5">
                        <Sparkles size={13} className="text-orange-600" /> Lý Do AI Gợi Ý (XAI Rationale):
                      </span>
                      <ul className="space-y-1 text-xs text-orange-800/90 list-disc pl-4 leading-relaxed">
                        {item.reasons.map((r: string, idx: number) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      disabled={isInvited}
                      onClick={() => handleInvite(item.targetStudentId)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm ${
                        isInvited
                          ? 'bg-emerald-100 text-emerald-800 cursor-default'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {isInvited ? (
                        <>
                          <Check size={16} /> Đã gửi lời mời ghép nhóm
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} /> Mời Gia Nhập Nhóm
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
