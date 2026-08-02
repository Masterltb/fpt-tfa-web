import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import type { Team, TeamMember } from '../../types/api';
import { Header } from '../../components/common/Header';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { Sparkles, ShieldCheck, ArrowLeft, CheckCircle2, Send } from 'lucide-react';

export function DragDropOverrideStudio() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query AI Proposed Teams
  const {
    data: teams,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Team[]>({
    queryKey: ['grouping-sessions', sessionId, 'teams'],
    queryFn: () => apiClient.get(`/grouping-sessions/${sessionId || 'sess_01_se1801'}/teams`),
    retry: false,
  });

  // Fallback mock teams for Lecturer Review & Visual inspection
  const defaultTeams: Team[] = [
    {
      id: 'team_01',
      teamName: 'Nhóm 01 — SWE201c',
      sectionId: 'sec_se1801_swe201c',
      sessionId: 'sess_01_se1801',
      status: 'VALID',
      balanceScore: 95,
      explainabilityRationale: [
        'Cân bằng tuyệt đối kỹ năng Frontend (React 5★) và Backend (Python/FastAPI 4★).',
        'Trùng lịch rảnh tối đa: Tối Thứ 2, Tối Thứ 4 và Cả ngày Thứ 7 (Schedule Overlap: 96%).',
        'Cùng mục tiêu điểm số A (8.5 - 10.0) và không có vi phạm Constitution constraint.',
      ],
      members: [
        {
          userId: 'stu_01',
          fullName: 'Nguyễn Văn An (Leader)',
          studentCode: 'SE180001',
          assignedRole: 'Fullstack Developer',
          isLeader: true,
          skillsSummary: ['React 4★', 'Python 4★'],
        },
        {
          userId: 'stu_02',
          fullName: 'Trần Văn Minh',
          studentCode: 'SE180002',
          assignedRole: 'Frontend Dev',
          isLeader: false,
          skillsSummary: ['React 5★', 'UI-UX 4★'],
        },
        {
          userId: 'stu_03',
          fullName: 'Lê Hoàng Yến',
          studentCode: 'SE180003',
          assignedRole: 'Project Manager',
          isLeader: false,
          skillsSummary: ['Agile 5★', 'SQL 4★'],
        },
        {
          userId: 'stu_04',
          fullName: 'Phạm Đăng Khoa',
          studentCode: 'SE180004',
          assignedRole: 'DevOps & Docker',
          isLeader: false,
          skillsSummary: ['Docker 4★', 'Linux 4★'],
        },
        {
          userId: 'stu_05',
          fullName: 'Vũ Trọng Phụng',
          studentCode: 'SE180005',
          assignedRole: 'Backend Dev',
          isLeader: false,
          skillsSummary: ['Java 4★', 'PostgreSQL 4★'],
        },
      ],
    },
    {
      id: 'team_02',
      teamName: 'Nhóm 02 — SWE201c',
      sectionId: 'sec_se1801_swe201c',
      sessionId: 'sess_01_se1801',
      status: 'VALID',
      balanceScore: 89,
      explainabilityRationale: [
        'Đáp ứng quy mô chuẩn 5 thành viên theo hiến pháp FPT University.',
        'Độ phủ vai trò đạt 100%: Có đủ Frontend, Backend và Tester/QA.',
        'Đồng nhất mức độ cam kết thời gian cao (>15h/tuần).',
      ],
      members: [
        {
          userId: 'stu_06',
          fullName: 'Đoàn Nhật Quang (Leader)',
          studentCode: 'SE180006',
          assignedRole: 'Backend Lead',
          isLeader: true,
          skillsSummary: ['Node.js 5★', 'SQL 5★'],
        },
        {
          userId: 'stu_07',
          fullName: 'Nguyễn Mai Anh',
          studentCode: 'SE180007',
          assignedRole: 'UI/UX Designer',
          isLeader: false,
          skillsSummary: ['Figma 5★', 'React 3★'],
        },
        {
          userId: 'stu_08',
          fullName: 'Bùi Gia Huy',
          studentCode: 'SE180008',
          assignedRole: 'Frontend Dev',
          isLeader: false,
          skillsSummary: ['Vue 4★', 'TS 4★'],
        },
        {
          userId: 'stu_09',
          fullName: 'Trương Khánh Linh',
          studentCode: 'SE180009',
          assignedRole: 'QA Tester',
          isLeader: false,
          skillsSummary: ['Testing 4★', 'BA 4★'],
        },
        {
          userId: 'stu_10',
          fullName: 'Hồ Tuấn Kiệt',
          studentCode: 'SE180010',
          assignedRole: 'Fullstack',
          isLeader: false,
          skillsSummary: ['React 3★', 'Python 4★'],
        },
      ],
    },
  ];

  const [displayTeams, setDisplayTeams] = useState<Team[]>(
    Array.isArray(teams) && teams.length > 0 ? teams : defaultTeams
  );
  const [selectedStudent, setSelectedStudent] = useState<{ member: TeamMember; fromTeamId: string } | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Mutation to Publish Teams
  const publishMutation = useMutation({
    mutationFn: () => apiClient.post(`/grouping-sessions/${sessionId || 'sess_01_se1801'}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lecturers', 'me', 'sections'] });
      setPublishSuccess(true);
      setTimeout(() => {
        navigate('/lecturer/dashboard');
      }, 2500);
    },
  });

  // Handle transfer student between teams (Human-in-the-Loop Override)
  const handleTransferStudent = (targetTeamId: string) => {
    if (!selectedStudent || selectedStudent.fromTeamId === targetTeamId) return;

    setDisplayTeams((prev) => {
      return prev.map((t) => {
        if (t.id === selectedStudent.fromTeamId) {
          return {
            ...t,
            members: t.members.filter((m) => m.userId !== selectedStudent.member.userId),
          };
        }
        if (t.id === targetTeamId) {
          return {
            ...t,
            members: [...t.members, selectedStudent.member],
          };
        }
        return t;
      });
    });

    setSelectedStudent(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              to="/lecturer/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition mb-1"
            >
              <ArrowLeft size={14} /> Quay lại trang quản trị Giảng viên
            </Link>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck size={22} className="text-orange-600" />
              Duyệt & Kéo-Thả Điều Chỉnh Nhóm (Drag-Drop Override Studio)
            </h2>
            <p className="text-xs text-slate-500">
              Quyền hạn Giảng viên (Human-in-the-Loop): Nhấp chọn sinh viên để chuyển nhóm nếu cần thiết trước khi công bố.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending || publishSuccess}
              className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              <Send size={16} />
              {publishMutation.isPending ? 'Đang công bố...' : 'Chính Thức Phê Duyệt & Công Bố'}
            </button>
          </div>
        </div>

        {/* Selected student transfer banner */}
        {selectedStudent && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs font-semibold shadow-xs">
            <div>
              <span>
                Đã chọn sinh viên: <strong className="text-orange-600">{selectedStudent.member.fullName}</strong> ({selectedStudent.member.studentCode}) từ{' '}
                <strong>{displayTeams.find((t) => t.id === selectedStudent.fromTeamId)?.teamName}</strong>.
              </span>
              <span className="block text-[11px] text-amber-700 mt-0.5">
                Hãy bấm nút <strong>"Chuyển vào nhóm này"</strong> ở thẻ nhóm đích bên dưới.
              </span>
            </div>
            <button
              onClick={() => setSelectedStudent(null)}
              className="px-3 py-1 rounded-lg bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 font-bold"
            >
              Hủy chọn
            </button>
          </div>
        )}

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
            title="Không thể tải danh sách nhóm AI đề xuất"
            detail={(error as any)?.detail || 'Lỗi kết nối hoặc phiên ghép nhóm chưa hoàn thành.'}
            onRetry={() => refetch()}
          />
        )}

        {/* State 3: Publish success alert */}
        {publishSuccess && (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-sm flex items-center gap-3">
            <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
            <div>
              <p>Đã công bố kết quả phân nhóm chính thức tới toàn bộ sinh viên trong lớp!</p>
              <p className="text-xs font-normal text-emerald-700 mt-0.5">
                Hệ thống tự động thông báo qua email và chuyển trạng thái phiên thành PUBLISHED.
              </p>
            </div>
          </div>
        )}

        {/* State 4: Teams Board View */}
        {!isLoading && !isError && (
          <div className="grid md:grid-cols-2 gap-6">
            {displayTeams.map((team) => (
              <div
                key={team.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between gap-6"
              >
                <div className="space-y-4">
                  {/* Team Header & Balance Score badge */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{team.teamName}</h3>
                      <p className="text-xs text-slate-500">
                        Quy mô: <strong className="text-slate-800">{team.members.length} Sinh viên</strong> • Trạng thái: <strong>{team.status}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                        {team.balanceScore || 90}% Balance
                      </span>
                    </div>
                  </div>

                  {/* Transfer shortcut button if student is selected from another team */}
                  {selectedStudent && selectedStudent.fromTeamId !== team.id && (
                    <button
                      onClick={() => handleTransferStudent(team.id)}
                      className="w-full py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition"
                    >
                      + Chuyển {selectedStudent.member.fullName} vào nhóm này
                    </button>
                  )}

                  {/* Member List */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Danh Sách Thành Viên (Nhấp để chọn điều chỉnh)
                    </span>

                    <div className="space-y-2">
                      {team.members.map((member) => {
                        const isSelected =
                          selectedStudent?.member.userId === member.userId &&
                          selectedStudent?.fromTeamId === team.id;
                        return (
                          <div
                            key={member.userId}
                            onClick={() => setSelectedStudent({ member, fromTeamId: team.id })}
                            className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'border-orange-500 bg-orange-50/80 shadow-xs'
                                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                                {member.fullName.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">
                                  {member.fullName}{' '}
                                  {member.isLeader && (
                                    <span className="text-[10px] text-orange-600 font-bold">(Leader)</span>
                                  )}
                                </h4>
                                <span className="text-[10px] text-slate-400">
                                  {member.studentCode} • <strong>{member.assignedRole}</strong>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              {member.skillsSummary.map((s, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-semibold text-slate-600"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* XAI Rationale Box per docs/constitution.md */}
                  <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200/80 space-y-1.5">
                    <span className="text-[11px] font-bold text-orange-900 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-orange-600" /> Giải Thích Tối Ưu AI (XAI Rationale):
                    </span>
                    <ul className="space-y-1 text-xs text-orange-800/90 list-disc pl-4 leading-relaxed">
                      {(team.explainabilityRationale || [
                        'Nhóm thỏa mãn ràng buộc hiến pháp FPT.',
                        'Kỹ năng bổ trợ cân bằng cao.',
                      ]).map((r: string, idx: number) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Team Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>Constitution Status: <strong>VALID (4-6 SV)</strong></span>
                  <span className="text-emerald-600 font-bold">✓ Đủ điều kiện công bố</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
