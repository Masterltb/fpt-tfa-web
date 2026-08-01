import { useState } from "react";
import { useAuth } from "./lib/auth";
import Login from "./components/Login";
import Shell from "./components/Shell";
import StudentDashboard from "./components/StudentDashboard";
import StudentProfile from "./components/StudentProfile";
import StudentSkills from "./components/StudentSkills";
import StudentAvailability from "./components/StudentAvailability";
import StudentPreferences from "./components/StudentPreferences";
import StudentReview from "./components/StudentReview";
import StudentTeam from "./components/StudentTeam";
import LecturerDashboard from "./components/LecturerDashboard";
import LecturerCohorts from "./components/LecturerCohorts";
import CohortWorkspace from "./components/CohortWorkspace";
import FormationBoard from "./components/FormationBoard";

const STUDENT_ROUTES: Record<string, (nav: (r: string) => void) => JSX.Element> = {
  "student/dashboard": (nav) => <StudentDashboard navigate={nav} />,
  "student/profile":   (nav) => <StudentProfile navigate={nav} />,
  "student/skills":    (nav) => <StudentSkills navigate={nav} />,
  "student/avail":     (nav) => <StudentAvailability navigate={nav} />,
  "student/prefs":     (nav) => <StudentPreferences navigate={nav} />,
  "student/review":    (nav) => <StudentReview navigate={nav} />,
  "student/team":      () => <StudentTeam />,
};

export default function App() {
  const { user, role, loading } = useAuth();
  const [route, setRoute] = useState<string>("");
  const [uiRole, setUiRole] = useState<"student" | "lecturer">("student");

  // Derive cohort from route like "lecturer/cohorts/SE1842/formation"
  const cohortMatch = route.match(/^lecturer\/cohorts\/([^/]+)/);
  const cohortId = cohortMatch ? cohortMatch[1] : undefined;

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)" }}>
      <div className="spinner" style={{ width: 32, height: 32, borderColor: "rgba(79,70,229,0.2)", borderTopColor: "var(--primary)" }} />
    </div>
  );

  if (!user || !role) return <Login />;

  // Initialise route from auth role on first load
  if (!route) {
    const initial = role === "student" ? "student/dashboard" : "lecturer/dashboard";
    setRoute(initial);
    setUiRole(role as "student" | "lecturer");
    return null;
  }

  const navigate = (r: string) => {
    setRoute(r);
    if (r.startsWith("student/")) setUiRole("student");
    else if (r.startsWith("lecturer/")) setUiRole("lecturer");
  };

  function renderContent() {
    // Student routes
    if (route.startsWith("student/")) {
      const renderer = STUDENT_ROUTES[route];
      return renderer ? renderer(navigate) : <StudentDashboard navigate={navigate} />;
    }

    // Lecturer routes
    if (route === "lecturer/dashboard") return <LecturerDashboard navigate={navigate} />;
    if (route === "lecturer/cohorts" || !cohortId) return <LecturerCohorts navigate={navigate} />;

    if (route.includes("/board") || route.includes("/formation/board")) {
      return <FormationBoard cohortId={cohortId} navigate={navigate} />;
    }

    // Cohort workspace tabs
    return <CohortWorkspace cohortId={cohortId} route={route} navigate={navigate} />;
  }

  return (
    <Shell
      role={uiRole}
      route={route}
      setRoute={navigate}
      cohortId={cohortId}
      profileCompleteness={72}
    >
      {renderContent()}
    </Shell>
  );
}

