import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createDevMockToken } from './api/client';
import { Sparkles, ShieldCheck, Users, ArrowRight, UserCheck, AlertTriangle } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Screen 45: Dev Mock Auth Switcher Bar
function DevMockBar() {
  const [activeRole, setActiveRole] = useState<'STUDENT' | 'LECTURER' | 'ADMIN'>(
    (localStorage.getItem('tfa_role') as any) || 'STUDENT'
  );

  const handleRoleChange = (role: 'STUDENT' | 'LECTURER' | 'ADMIN') => {
    setActiveRole(role);
    localStorage.setItem('tfa_role', role);
    const userId = role === 'STUDENT' ? 'stu_01' : role === 'LECTURER' ? 'lec_01' : 'adm_01';
    localStorage.setItem('tfa_user_id', userId);
    localStorage.setItem('tfa_token', createDevMockToken(userId, role));
    window.location.reload();
  };

  return (
    <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 flex items-center justify-between border-b border-slate-800">
      <div className="flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-semibold text-slate-400">DEV MOCK AUTH BAR (Screen 45):</span>
        <span className="text-slate-300 font-mono">Role: <strong className="text-orange-400">{activeRole}</strong></span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-slate-400">Switch Role:</span>
        <button
          onClick={() => handleRoleChange('STUDENT')}
          className={`px-2 py-0.5 rounded transition ${activeRole === 'STUDENT' ? 'bg-orange-500 text-white font-bold' : 'bg-slate-800 hover:bg-slate-700'}`}
        >
          Student
        </button>
        <button
          onClick={() => handleRoleChange('LECTURER')}
          className={`px-2 py-0.5 rounded transition ${activeRole === 'LECTURER' ? 'bg-orange-500 text-white font-bold' : 'bg-slate-800 hover:bg-slate-700'}`}
        >
          Lecturer
        </button>
        <button
          onClick={() => handleRoleChange('ADMIN')}
          className={`px-2 py-0.5 rounded transition ${activeRole === 'ADMIN' ? 'bg-orange-500 text-white font-bold' : 'bg-slate-800 hover:bg-slate-700'}`}
        >
          Admin
        </button>
      </div>
    </div>
  );
}

// Screen 01: Landing Page
function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-md">
            FPT
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Team Formation Assistant</h1>
            <p className="text-xs text-slate-500">FPT University — AI-Assisted Matching Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition shadow-sm flex items-center gap-2">
            Đăng nhập ngay <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-12">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
            <Sparkles size={14} /> AI-Powered CP-SAT Matching Engine
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Lập nhóm cân bằng.<br />Tạo nên dự án xuất sắc.
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Giải pháp ghép nhóm thông minh dành riêng cho sinh viên & giảng viên Trường Đại học FPT. 
            Cân bằng kỹ năng, vai trò, lịch rảnh và mức độ cam kết với tiêu chí <strong>"No student left behind"</strong>.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link to="/login" className="px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-lg shadow-orange-500/20 transition flex items-center gap-2">
              Đăng nhập với Google FPT Edu <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Sparkles size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Explainable AI (XAI)</h3>
            <p className="text-sm text-slate-600">
              Mọi gợi ý phân nhóm đều đi kèm lý do giải thích minh bạch vì sao các thành viên phù hợp với nhau.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Human-in-the-Loop</h3>
            <p className="text-sm text-slate-600">
              AI chỉ đưa ra đề xuất. Giảng viên có toàn quyền xem xét, kéo-thả điều chỉnh và quyết định công bố.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Users size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">3 Chế độ linh hoạt</h3>
            <p className="text-sm text-slate-600">
              Hỗ trợ chế độ Lecturer-led, Student-led và chế độ cờ hạm <strong>Hybrid</strong> (tự lập nhóm + AI lấp đầy).
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 bg-white">
        © 2026 FPT University — Team Formation Assistant (TFA v1.0.0). Built with Forge Harness.
      </footer>
    </div>
  );
}

// Screen 07: Login Page
function LoginPage() {
  const navigate = useNavigate();
  const role = (localStorage.getItem('tfa_role') as 'STUDENT' | 'LECTURER' | 'ADMIN') || 'STUDENT';

  const handleLogin = () => {
    const userId = role === 'STUDENT' ? 'stu_01' : role === 'LECTURER' ? 'lec_01' : 'adm_01';
    localStorage.setItem('tfa_token', createDevMockToken(userId, role));
    navigate(`/${role.toLowerCase()}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-black text-2xl shadow-md">
          FPT
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Đăng Nhập TFA</h2>
          <p className="text-xs text-slate-500 mt-1">Cổng xác thực tài khoản Google Workspace Đại học FPT</p>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-left text-xs text-amber-800 space-y-1">
          <p className="font-semibold flex items-center gap-1"><AlertTriangle size={14} /> Chế độ Đăng nhập Khảo sát:</p>
          <p>Tài khoản hiện tại: <strong className="text-orange-600">{role}</strong></p>
        </div>
        <button
          onClick={handleLogin}
          className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-md transition flex items-center justify-center gap-2"
        >
          <UserCheck size={18} /> Đăng nhập với Google FPT Edu
        </button>
        <p className="text-xs text-slate-400">
          Chấp nhận email @fpt.edu.vn cho sinh viên và @fe.edu.vn cho cán bộ/giảng viên.
        </p>
      </div>
    </div>
  );
}

// Screen 20: Lecturer Dashboard Placeholder
function LecturerDashboard() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lecturer Dashboard (Screen 20)</h1>
          <p className="text-xs text-slate-500">Chào mừng Giảng viên (ID: {localStorage.getItem('tfa_user_id') || 'lec_01'})</p>
        </div>
        <div className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
          Human-in-the-Loop Mode
        </div>
      </div>
    </div>
  );
}

// Screen 29: Admin Dashboard Placeholder
function AdminDashboard() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard (Screen 29)</h1>
          <p className="text-xs text-slate-500">Quản trị toàn trường (ID: {localStorage.getItem('tfa_user_id') || 'adm_01'})</p>
        </div>
        <div className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
          System Analytics
        </div>
      </div>
    </div>
  );
}

import { StudentDashboard } from './pages/student/StudentDashboard';
import { TeamDnaWizard } from './pages/student/TeamDnaWizard';
import { ClassSectionWorkspace } from './pages/student/ClassSectionWorkspace';
import { AiRecommendations } from './pages/student/AiRecommendations';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <DevMockBar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/dna" element={<TeamDnaWizard />} />
          <Route path="/student/sections/:sectionId" element={<ClassSectionWorkspace />} />
          <Route path="/student/sections/:sectionId/recommendations" element={<AiRecommendations />} />
          <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
