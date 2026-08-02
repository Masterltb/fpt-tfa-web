import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Header } from '../../components/common/Header';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { FileText, ArrowLeft, Search, Filter, RefreshCw } from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  role: 'ADMIN' | 'LECTURER' | 'STUDENT';
  action: string;
  resourceType: string;
  resourceId: string;
  status: 'SUCCESS' | 'DENIED' | 'ERROR';
  ipAddress: string;
}

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_1001',
    timestamp: '2026-08-02 11:45:12',
    actorId: 'lec_01',
    actorName: 'TS. Nguyễn Văn Hùng',
    role: 'LECTURER',
    action: 'PUBLISH_TEAMS_OVERRIDE',
    resourceType: 'GroupingSession',
    resourceId: 'sess_01_se1801',
    status: 'SUCCESS',
    ipAddress: '113.190.12.89 (FPT HL)',
  },
  {
    id: 'log_1002',
    timestamp: '2026-08-02 11:40:08',
    actorId: 'lec_01',
    actorName: 'TS. Nguyễn Văn Hùng',
    role: 'LECTURER',
    action: 'TRIGGER_CPSAT_SOLVER',
    resourceType: 'GroupingSession',
    resourceId: 'sess_01_se1801',
    status: 'SUCCESS',
    ipAddress: '113.190.12.89 (FPT HL)',
  },
  {
    id: 'log_1003',
    timestamp: '2026-08-02 10:15:33',
    actorId: 'adm_01',
    actorName: 'Admin Toàn Trường',
    role: 'ADMIN',
    action: 'IMPORT_ROSTER_EXCEL',
    resourceType: 'ClassSection',
    resourceId: 'sec_se1801_swe201c',
    status: 'SUCCESS',
    ipAddress: '118.69.190.10 (FPT Edu HQ)',
  },
  {
    id: 'log_1004',
    timestamp: '2026-08-02 09:30:21',
    actorId: 'stu_01',
    actorName: 'Nguyễn Văn An',
    role: 'STUDENT',
    action: 'SUBMIT_TEAM_DNA',
    resourceType: 'StudentProfile',
    resourceId: 'stu_01_dna',
    status: 'SUCCESS',
    ipAddress: '14.161.42.150',
  },
  {
    id: 'log_1005',
    timestamp: '2026-08-02 09:12:05',
    actorId: 'stu_99',
    actorName: 'Tài khoản ngoài miền fpt.edu.vn',
    role: 'STUDENT',
    action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
    resourceType: 'GroupingSession',
    resourceId: 'sess_01_se1801',
    status: 'DENIED',
    ipAddress: '171.224.18.210',
  },
];

export function AuditLogViewer() {
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'LECTURER' | 'STUDENT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: logs,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<AuditLog[]>({
    queryKey: ['admin', 'audit-logs', roleFilter],
    queryFn: () => apiClient.get('/admin/audit-logs'),
  });

  const displayLogs = (Array.isArray(logs) && logs.length > 0 ? logs : MOCK_AUDIT_LOGS).filter((log) => {
    const matchRole = roleFilter === 'ALL' || log.role === roleFilter;
    const matchSearch =
      searchQuery === '' ||
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resourceId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Navigation */}
        <div>
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft size={14} /> Quay lại trang quản trị toàn trường
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-700 text-xs font-bold mb-1">
                <FileText size={14} /> FPT TFA Security & Audit Trail
              </div>
              <h2 className="text-xl font-bold text-slate-900">Nhật Ký Kiểm Toán & Truy Cập RBAC</h2>
              <p className="text-xs text-slate-500">
                Ghi nhận 100% các hành động liên quan đến cấu hình quy tắc ràng buộc, chạy CP-SAT và Override nhóm theo <strong>docs/rbac.md</strong>.
              </p>
            </div>

            <button
              onClick={() => refetch()}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
            >
              <RefreshCw size={14} /> Làm mới
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo Tên, Hành động, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={14} className="text-slate-500" />
              <span className="text-xs font-bold text-slate-600">Vai trò:</span>
              {(['ALL', 'ADMIN', 'LECTURER', 'STUDENT'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    roleFilter === r
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* State 1: Loading Skeleton */}
          {isLoading && <CardSkeleton />}

          {/* State 2: Error Alert */}
          {isError && (
            <ErrorAlert
              title="Không thể xuất dữ liệu kiểm toán"
              detail={(error as any)?.detail || 'Lỗi truy cập máy chủ.'}
              onRetry={() => refetch()}
            />
          )}

          {/* State 3: Table view */}
          {!isLoading && !isError && (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                  <tr>
                    <th className="p-3">Thời gian</th>
                    <th className="p-3">Người thực hiện (Actor)</th>
                    <th className="p-3">Vai trò</th>
                    <th className="p-3">Hành động (Action)</th>
                    <th className="p-3">Đối tượng tác động</th>
                    <th className="p-3">Trạng thái</th>
                    <th className="p-3">IP / Chi nhánh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono text-slate-600">{log.timestamp}</td>
                      <td className="p-3 font-bold text-slate-900">{log.actorName}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${
                            log.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : log.role === 'LECTURER'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {log.role}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-800">{log.action}</td>
                      <td className="p-3">
                        <span className="font-semibold">{log.resourceType}:</span>{' '}
                        <code className="text-purple-700">{log.resourceId}</code>
                      </td>
                      <td className="p-3">
                        {log.status === 'SUCCESS' ? (
                          <span className="text-emerald-700 font-bold">● SUCCESS</span>
                        ) : (
                          <span className="text-rose-600 font-bold">● {log.status}</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-500 font-mono">{log.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
