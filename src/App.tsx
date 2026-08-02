import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import Login, { HOME } from "@/routes/Login";
import ReviewBoard from "@/routes/ReviewBoard";
import StudentHome from "@/routes/StudentHome";
import StudentProfile from "@/routes/StudentProfile";
import StudentTeam from "@/routes/StudentTeam";
import StudentRecommendations from "@/routes/StudentRecommendations";
import LecturerSessions from "@/routes/LecturerSessions";
import LecturerRoster from "@/routes/LecturerRoster";
import LecturerConfig from "@/routes/LecturerConfig";
import AdminDashboard from "@/routes/AdminDashboard";
import AdminImport from "@/routes/AdminImport";
import { useAuth, type Role } from "@/lib/auth";

function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const { principal } = useAuth();
  if (!principal) return <Navigate to="/login" replace />;
  if (principal.role !== role) return <Navigate to={HOME[principal.role]} replace />;
  return <>{children}</>;
}

function TopBar() {
  const { principal } = useAuth();
  if (!principal) return null;

  return (
    <header className="no-print sticky top-0 z-30 flex h-[65px] items-center justify-between border-b border-line bg-surface/85 backdrop-blur-md px-6 shrink-0">
      <div>
        <h1 className="text-[0.98rem] font-700 leading-tight text-ink">
          Team Formation Assistant
        </h1>
        <p className="text-[0.72rem] font-500 text-ink-faint">
          Đại học FPT · Hệ thống xếp nhóm học tập
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-fpt-green/12 px-2.5 py-1 text-[0.75rem] font-600 text-fpt-green-ink">
          <span className="size-1.5 rounded-full bg-fpt-green animate-pulse" /> Trực tuyến
        </span>
      </div>
    </header>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar className="sticky top-0 h-screen" />
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar />
        <main className="relative z-10 flex-1 px-4 py-6 sm:px-6 sm:py-8 max-w-[1800px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function RootRedirect() {
  const { principal } = useAuth();
  return <Navigate to={principal ? HOME[principal.role] : "/login"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="ambient" aria-hidden="true" />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />

        {/* Lecturer Routes */}
        <Route
          path="/lecturer"
          element={
            <RequireRole role="lecturer">
              <Shell><ReviewBoard /></Shell>
            </RequireRole>
          }
        />
        <Route
          path="/lecturer/sessions"
          element={
            <RequireRole role="lecturer">
              <Shell><LecturerSessions /></Shell>
            </RequireRole>
          }
        />
        <Route
          path="/lecturer/roster"
          element={
            <RequireRole role="lecturer">
              <Shell><LecturerRoster /></Shell>
            </RequireRole>
          }
        />
        <Route
          path="/lecturer/config"
          element={
            <RequireRole role="lecturer">
              <Shell><LecturerConfig /></Shell>
            </RequireRole>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <RequireRole role="student">
              <Shell><StudentHome /></Shell>
            </RequireRole>
          }
        />
        <Route
          path="/student/profile"
          element={
            <RequireRole role="student">
              <Shell><StudentProfile /></Shell>
            </RequireRole>
          }
        />
        <Route
          path="/student/my-team"
          element={
            <RequireRole role="student">
              <Shell><StudentTeam /></Shell>
            </RequireRole>
          }
        />
        <Route
          path="/student/recommendations"
          element={
            <RequireRole role="student">
              <Shell><StudentRecommendations /></Shell>
            </RequireRole>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <RequireRole role="admin">
              <Shell><AdminDashboard /></Shell>
            </RequireRole>
          }
        />
        <Route
          path="/admin/import"
          element={
            <RequireRole role="admin">
              <Shell><AdminImport /></Shell>
            </RequireRole>
          }
        />

        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
