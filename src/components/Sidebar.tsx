import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Dna,
  UserCheck,
  Sliders,
  Building,
  Calendar,
  FileSpreadsheet,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Badge, Initials } from "@/components/ui";
import { useAuth, type Role } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const ROLE_VI: Record<Role, string> = {
  student: "Sinh viên",
  lecturer: "Giảng viên",
  admin: "Quản trị",
};

const LECTURER_NAV: NavItem[] = [
  { to: "/lecturer", label: "Xếp nhóm AI & Review", icon: LayoutDashboard },
  { to: "/lecturer/sessions", label: "Phiên gom nhóm", icon: BookOpen, badge: "Hybrid" },
  { to: "/lecturer/roster", label: "Tiến độ Team DNA", icon: Users },
  { to: "/lecturer/config", label: "Tiêu chí & Trọng số", icon: Sliders },
];

const STUDENT_NAV: NavItem[] = [
  { to: "/student", label: "Trang chủ đồ án", icon: LayoutDashboard },
  { to: "/student/profile", label: "Hồ sơ Team DNA", icon: Dna, badge: "Cần điền" },
  { to: "/student/my-team", label: "Nhóm của tôi", icon: UserCheck },
  { to: "/student/recommendations", label: "Gợi ý ghép nhóm AI", icon: Sparkles },
];

const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard hệ thống", icon: LayoutDashboard },
  { to: "/admin/campuses", label: "Cơ sở (Campuses)", icon: Building },
  { to: "/admin/terms", label: "Học kỳ (Terms)", icon: Calendar },
  { to: "/admin/import", label: "Import CSV / Excel", icon: FileSpreadsheet },
  { to: "/admin/users", label: "Quản lý người dùng", icon: ShieldCheck },
];

export function Sidebar({ className }: { className?: string }) {
  const { principal, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!principal) return null;

  const role = principal.role;
  const navItems =
    role === "lecturer" ? LECTURER_NAV : role === "student" ? STUDENT_NAV : ADMIN_NAV;

  const displayName = principal.uid.includes("@")
    ? principal.uid.split("@")[0]
    : principal.uid;

  const roleTone: Record<Role, "blue" | "orange" | "green"> = {
    lecturer: "blue",
    student: "orange",
    admin: "green",
  };

  return (
    <aside
      className={cn(
        "no-print relative flex flex-col border-r border-line bg-surface/90 backdrop-blur-md transition-all duration-300 z-20 shrink-0",
        collapsed ? "w-[72px]" : "w-[260px]",
        className,
      )}
    >
      {/* Collapse Toggle Button */}
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        className="absolute -right-3.5 top-20 z-40 flex size-7 items-center justify-center rounded-full border border-line bg-surface text-ink-soft shadow-md hover:bg-fpt-orange hover:text-ink hover:border-fpt-orange cursor-pointer transition-all"
        title={collapsed ? "Mở rộng Sidebar" : "Thu gọn Sidebar"}
      >
        {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
      </button>

      {/* Brand Logo Header */}
      <div className="flex h-[65px] items-center justify-between border-b border-line px-4 shrink-0">
        <NavLink to="/" className="flex items-center gap-3 group">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-fpt-orange font-800 text-[0.88rem] text-ink shadow-xs transition-transform group-hover:scale-105">
            TFA
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1 truncate">
              <span className="block truncate text-[0.95rem] font-700 leading-tight text-ink">
                Team Formation
              </span>
              <span className="block truncate text-[0.72rem] font-500 text-ink-faint">
                Đại học FPT
              </span>
            </div>
          )}
        </NavLink>
      </div>

      {/* Academic Semester Context Header */}
      <div className="border-b border-line p-3">
        {!collapsed ? (
          <div className="flex items-center justify-between rounded-[10px] border border-line bg-ink/[0.025] px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-[0.72rem] font-600 uppercase tracking-wider text-ink-faint">
                Học kỳ hoạt động
              </p>
              <p className="truncate text-[0.82rem] font-700 text-ink">Summer 2026 · SWP391</p>
            </div>
            <span className="flex size-2 shrink-0 rounded-full bg-fpt-green animate-pulse" title="Đang hoạt động" />
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <span className="flex size-2 rounded-full bg-fpt-green animate-pulse" title="Summer 2026 · SWP391" />
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        <div className="mb-2 px-2 text-[0.7rem] font-700 uppercase tracking-wider text-ink-faint">
          {!collapsed && "Menu quản lý"}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[0.88rem] font-500 transition-colors",
                  isActive
                    ? "bg-fpt-orange/12 font-700 text-fpt-orange-ink shadow-xs"
                    : "text-ink-soft hover:bg-ink/[0.04] hover:text-ink",
                  collapsed && "justify-center px-0",
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span className="truncate flex-1">{item.label}</span>}
              {!collapsed && item.badge && (
                <Badge tone="orange" className="text-[0.7rem] px-1.5 py-0.5">
                  {item.badge}
                </Badge>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile & Logout Footer */}
      <div className="border-t border-line p-3">
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-[12px] bg-ink/[0.03] p-2",
            collapsed && "justify-center p-1.5",
          )}
        >
          <Initials name={displayName} tone={roleTone[role]} />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.85rem] font-600 leading-tight text-ink">
                {displayName}
              </p>
              <p className="truncate text-[0.72rem] font-500 text-ink-faint">
                {ROLE_VI[role]}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={logout}
              title="Đăng xuất"
              className="rounded-md p-1.5 text-ink-faint hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer"
            >
              <LogOut className="size-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
