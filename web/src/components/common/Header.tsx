import { Link, useLocation } from 'react-router-dom';
import { Bell, GraduationCap, Sparkles } from 'lucide-react';

export function Header() {
  const location = useLocation();
  const activeRole = (localStorage.getItem('tfa_role') as 'STUDENT' | 'LECTURER' | 'ADMIN') || 'STUDENT';
  const activeUserId = localStorage.getItem('tfa_user_id') || 'stu_01';

  const isTabActive = (path: string) => location.pathname.startsWith(path);

  return (
    <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
            FPT
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-none">TFA Portal</h1>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5 uppercase tracking-wider">
              {activeRole} WORKSPACE
            </p>
          </div>
        </Link>

        {activeRole === 'STUDENT' && (
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/student/dashboard"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                isTabActive('/student/dashboard')
                  ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-600'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Lớp Học & Môn
            </Link>
            <Link
              to="/student/dna"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                isTabActive('/student/dna')
                  ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-600'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles size={14} /> Team DNA Hồ sơ
            </Link>
          </nav>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
          <GraduationCap size={14} className="text-orange-600" />
          <span>Học kỳ: <strong className="text-slate-900">Fall 2026</strong></span>
        </div>

        <button
          aria-label="Thông báo"
          className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 relative transition"
        >
          <Bell size={18} />
          <span className="w-2 h-2 rounded-full bg-orange-600 absolute top-2 right-2"></span>
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center">
            {activeUserId.slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-none">{activeUserId}</p>
            <p className="text-[10px] text-slate-500">{activeRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
