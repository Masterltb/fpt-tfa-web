import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { ArrowLeft, CheckCircle2, Cpu, FileText } from 'lucide-react';

const SOLVER_LOG_STEPS = [
  '[00:00.00] [CP-SAT] Initializing Google OR-Tools CP-SAT Solver v9.8.3296...',
  '[00:00.08] [CP-SAT] Loading constraints from constitution: minTeamSize=4, maxTeamSize=6...',
  '[00:00.15] [CP-SAT] Enforcing No Student Left Behind constraint across N=36 students...',
  '[00:00.31] [CP-SAT] Feasible solution #1 found -> Objective: 3840, Max Imbalance: 4.2',
  '[00:00.65] [CP-SAT] Optimizing Schedule Overlap & Role Coverage matrix...',
  '[00:01.12] [CP-SAT] Feasible solution #2 found -> Objective: 4420, Balance Score: 88.5%',
  '[00:01.89] [CP-SAT] Refining local search neighborhood for edge-case students...',
  '[00:02.45] [CP-SAT] Optimal solution reached -> Objective: 4890, Mean Team Balance: 93.8%',
  '[00:02.50] [CP-SAT] Solver converged in 2.50s. 7 balanced teams generated.',
];

export function AiMatchingRunProgress() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [progress, setProgress] = useState(0);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsCompleted(true);
          return 100;
        }
        return prev + 14;
      });

      setCurrentLogIndex((prev) => {
        if (prev < SOLVER_LOG_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 600);

    return () => clearInterval(timer);
  }, []);

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

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                <Cpu size={14} /> Google OR-Tools CP-SAT Solver v9.8
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Tiến Trình Chạy Thuật Toán Tối Ưu Ghép Nhóm
              </h2>
              <p className="text-xs text-slate-500">
                Phiên làm việc: <strong className="text-slate-800">{sessionId || 'sess_01_se1801'}</strong> • Thời gian thực thi trung bình: 2-3 giây.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800 animate-pulse'
                }`}
              >
                {isCompleted ? '● TỐI ƯU HOÀN TẤT (OPTIMAL)' : '● ĐANG GIẢI PHƯƠNG TRÌNH...'}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700">Độ Hội Tụ Thuật Toán (Convergence Progress)</span>
              <span className="text-orange-600">{Math.min(progress, 100)}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Simulated CP-SAT Terminal Log Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText size={14} className="text-slate-500" /> Nhật Ký Bộ Giải (Solver Diagnostics Log)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">CP-SAT / OR-Tools 9.8</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs space-y-2 h-64 overflow-y-auto border border-slate-800 shadow-inner">
              {SOLVER_LOG_STEPS.slice(0, currentLogIndex + 1).map((log, idx) => (
                <div key={idx} className="leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Completion summary banner */}
          {isCompleted && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Đã Phân Bổ Thành Công 36 / 36 Sinh Viên!</h3>
                    <p className="text-xs text-slate-300">
                      Điểm cân bằng trung bình toàn lớp đạt <strong>93.8%</strong>. Không có sinh viên nào bị bỏ lại (No Student Left Behind).
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to={`/lecturer/sessions/${sessionId || 'sess_01_se1801'}/override`}
                  className="w-full py-3 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs text-center shadow-lg shadow-orange-500/25 transition block"
                >
                  Vào Không Gian Duyệt & Kéo-Thả Điều Chỉnh (Override Studio) →
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
