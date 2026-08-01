import { ReactNode, useContext, createContext } from "react";
import { useAuth } from "../lib/AuthContext";
import {
  Sparkles, Bell, Search, ChevronDown,
  LayoutDashboard, User, BarChart3, Calendar,
  Users, ClipboardCheck, UsersRound,
  FolderKanban, Settings, GitFork, Boxes, Trophy, ListChecks,
  Check,
} from "lucide-react";

// ── Router context ────────────────────────────────────────────────
interface RouterCtx { route: string; setRoute: (r: string) => void; }
const RouterContext = createContext<RouterCtx>({ route: "", setRoute: () => {} });
export function useRoute() { return useContext(RouterContext); }

// ── Avatar helper ─────────────────────────────────────────────────
export function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return <div className={`avatar avatar--${size}`}>{initials}</div>;
}

// ── Student nav ───────────────────────────────────────────────────
const STUDENT_NAV = [
  { route: "student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { route: "student/profile",   label: "Profile",      icon: User,           section: "basic" },
  { route: "student/skills",    label: "Skills",       icon: BarChart3,      section: "skills" },
  { route: "student/avail",     label: "Availability", icon: Calendar,       section: "availability" },
  { route: "student/prefs",     label: "Preferences",  icon: Users,          section: "preferences" },
  { route: "student/review",    label: "Review",       icon: ClipboardCheck },
  { route: "student/team",      label: "My Team",      icon: UsersRound },
];

const DONE: Record<string, boolean> = { basic: true, skills: true, availability: false, preferences: false };

// ── Lecturer nav ──────────────────────────────────────────────────
const LECTURER_NAV = [
  { route: "lecturer/dashboard", label: "Dashboard",    icon: LayoutDashboard },
  { route: "lecturer/cohorts",   label: "All Cohorts",  icon: FolderKanban },
];
const COHORT_TABS = [
  { key: "students",     label: "Students",     icon: Users },
  { key: "requirements", label: "Requirements", icon: ListChecks },
  { key: "constraints",  label: "Constraints",  icon: GitFork },
  { key: "formation",    label: "Formation",    icon: Boxes },
  { key: "results",      label: "Results",      icon: Trophy },
];

// ── Shell component ───────────────────────────────────────────────
interface ShellProps {
  children: ReactNode;
  role: "student" | "lecturer";
  route: string;
  setRoute: (r: string) => void;
  cohortId?: string;
  profileCompleteness?: number;
}

export default function Shell({ children, role, route, setRoute, cohortId, profileCompleteness = 0 }: ShellProps) {
  const { user, logout } = useAuth();
  const name = user?.displayName ?? user?.uid ?? "User";

  const isActive = (r: string) => route === r || route.startsWith(r + "/");

  return (
    <RouterContext.Provider value={{ route, setRoute }}>
      <div className="shell">
        {/* ── Header ── */}
        <header className="shell-header">
          <div className="shell-logo" onClick={() => setRoute(role === "student" ? "student/dashboard" : "lecturer/dashboard")} style={{ cursor: "pointer" }}>
            <div className="shell-logo__icon">
              <Sparkles size={14} />
            </div>
            <span className="shell-logo__name">TeamForge</span>
          </div>

          {role === "lecturer" && (
            <div className="shell-search">
              <Search size={13} className="shell-search__icon" />
              <input placeholder="Search students, cohorts…" />
              <span className="shell-search__kbd">⌘K</span>
            </div>
          )}

          <div className="shell-spacer" />

          <div className="shell-actions">
            <button className="icon-btn" aria-label="Notifications">
              <Bell size={17} />
            </button>

            <div className="role-switcher">
              <button
                className={`role-switcher__btn${role === "student" ? " role-switcher__btn--active" : ""}`}
                onClick={() => setRoute("student/dashboard")}
              >
                Student
              </button>
              <button
                className={`role-switcher__btn${role === "lecturer" ? " role-switcher__btn--active" : ""}`}
                onClick={() => setRoute("lecturer/dashboard")}
              >
                Lecturer
              </button>
            </div>

            <button className="user-btn" onClick={logout}>
              <Avatar name={name} size="sm" />
              <span className="user-btn__name" style={{ display: "none" }}>{name}</span>
              <ChevronDown size={13} style={{ color: "var(--faint)" }} />
            </button>
          </div>
        </header>

        {/* ── Sidebar ── */}
        <aside className="shell-sidebar">
          {role === "student" ? (
            <>
              <nav className="shell-sidebar__body" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {STUDENT_NAV.map(({ route: r, label, icon: Icon, section }) => (
                  <button
                    key={r}
                    className={`nav-item${isActive(r) ? " nav-item--active" : ""}`}
                    onClick={() => setRoute(r)}
                  >
                    <Icon size={15} />
                    {label}
                    {section && DONE[section] && !isActive(r) && (
                      <Check size={13} className="nav-item__check" />
                    )}
                  </button>
                ))}
              </nav>
              <div className="shell-sidebar__footer">
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6 }}>
                  <span style={{ color: "var(--muted)" }}>Profile completion</span>
                  <span style={{ fontWeight: 600, color: "var(--primary)" }}>{profileCompleteness}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar__fill" style={{ width: `${profileCompleteness}%` }} />
                </div>
              </div>
            </>
          ) : (
            <>
              {cohortId && (
                <div style={{ padding: "12px", borderBottom: "1px solid var(--border-strong)" }}>
                  <button className="cohort-switcher" onClick={() => setRoute("lecturer/cohorts")}>
                    <div className="cohort-switcher__icon">{cohortId.slice(-2)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="cohort-switcher__code">{cohortId}</div>
                      <div className="cohort-switcher__semester">Fall 2026</div>
                    </div>
                    <ChevronDown size={13} style={{ color: "var(--faint)" }} />
                  </button>
                </div>
              )}
              <nav className="shell-sidebar__body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <div className="nav-section-label">Overview</div>
                  {LECTURER_NAV.map(({ route: r, label, icon: Icon }) => (
                    <button key={r} className={`nav-item${isActive(r) ? " nav-item--active" : ""}`} onClick={() => setRoute(r)}>
                      <Icon size={15} />{label}
                    </button>
                  ))}
                </div>
                {cohortId && (
                  <div>
                    <div className="nav-section-label">Workspace</div>
                    {COHORT_TABS.map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        className={`nav-item nav-item--sub${route === `lecturer/cohorts/${cohortId}/${key}` ? " nav-item--active" : ""}`}
                        onClick={() => setRoute(`lecturer/cohorts/${cohortId}/${key}`)}
                      >
                        <Icon size={13} />{label}
                      </button>
                    ))}
                  </div>
                )}
              </nav>
              <div className="shell-sidebar__footer">
                <button className={`nav-item${isActive("lecturer/settings") ? " nav-item--active" : ""}`} onClick={() => setRoute("lecturer/settings")}>
                  <Settings size={15} />Settings
                </button>
              </div>
            </>
          )}
        </aside>

        {/* ── Main ── */}
        <main className="shell-main">{children}</main>
      </div>
    </RouterContext.Provider>
  );
}
