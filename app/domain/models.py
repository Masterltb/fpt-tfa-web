"""Domain models for Team Formation Assistant.

Pure stdlib (dataclasses) — no FastAPI / ORM / OR-Tools imports here, so the domain and the
matching engine run and are tested without external dependencies (see docs/architecture.md).

Privacy (constitution BR-08/BR-09, A-05): the model carries NO protected attributes
(gender, ethnicity, religion, health, age). Competency derives only from skills + experience.

FPT Academic Structure:
  Campus → AcademicYear → Term → Program/Major → Course / GroupingSpace → Teams → Members
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime
from enum import Enum

# ---------------------------------------------------------------------------
# Enums (Aligned with Product Spec MVP 1.0 & API Contract v1.0.0)
# ---------------------------------------------------------------------------

class UserRole(str, Enum):
    STUDENT = "STUDENT"
    LECTURER = "LECTURER"
    ADMIN = "ADMIN"


class UserStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"


class GroupingMode(str, Enum):
    """Three modes of team formation."""
    STUDENT_LED = "STUDENT_LED"
    LECTURER_LED = "LECTURER_LED"
    HYBRID = "HYBRID"


class GroupingSessionStatus(str, Enum):
    DRAFT = "DRAFT"
    OPEN = "OPEN"           # accepting Team DNA + student teams
    FROZEN = "FROZEN"       # input frozen for matching
    MATCHING = "MATCHING"   # AI is running
    REVIEW = "REVIEW"       # lecturer reviewing results
    PUBLISHED = "PUBLISHED" # final, students notified
    CLOSED = "CLOSED"
    CANCELLED = "CANCELLED"


class TermStatus(str, Enum):
    PLANNED = "PLANNED"
    ACTIVE = "ACTIVE"
    CLOSED = "CLOSED"
    ARCHIVED = "ARCHIVED"


class SectionStatus(str, Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    ARCHIVED = "ARCHIVED"


class CommitmentLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class TeamStatus(str, Enum):
    DRAFT = "DRAFT"
    FORMING = "FORMING"
    INCOMPLETE = "INCOMPLETE"
    VALID = "VALID"
    SUBMITTED = "SUBMITTED"
    APPROVED = "APPROVED"
    PUBLISHED = "PUBLISHED"
    REJECTED = "REJECTED"
    AT_RISK = "AT_RISK"
    DISSOLVED = "DISSOLVED"
    CLOSED = "CLOSED"
    AI_SUGGESTED = "AI_SUGGESTED"  # alias for backward compatibility


class MembershipStatus(str, Enum):
    INVITED = "INVITED"
    APPLIED = "APPLIED"
    ACTIVE = "ACTIVE"
    LEAVE_REQUESTED = "LEAVE_REQUESTED"
    REMOVAL_REQUESTED = "REMOVAL_REQUESTED"
    WITHDRAWN = "WITHDRAWN"
    REMOVED = "REMOVED"
    REJECTED = "REJECTED"


class HealthStatus(str, Enum):
    GREEN = "GREEN"
    YELLOW = "YELLOW"
    RED = "RED"


class AlertSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class InvitationStatus(str, Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    DECLINED = "DECLINED"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"


class JoinRequestStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"


class MatchRunStatus(str, Enum):
    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class ConstraintStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


# Backward compatibility aliases
SessionStatus = GroupingSessionStatus

DEFAULT_ROLES = ("leader", "coordinator", "researcher", "presenter", "member", "other")


# ---------------------------------------------------------------------------
# FPT Academic Structure Entities
# ---------------------------------------------------------------------------

@dataclass
class Campus:
    """An FPT University campus (e.g. HCM, HN, DN, CT)."""
    id: str
    code: str
    name: str
    is_active: bool = True


@dataclass
class AcademicYear:
    """A school year managed by Admin (e.g. 2025-2026)."""
    id: str
    name: str
    start_date: date | None = None
    end_date: date | None = None
    is_active: bool = True


@dataclass
class Program:
    """Academic program (e.g. Bachelor of Software Engineering)."""
    id: str
    code: str
    name: str
    campus_id: str = ""
    is_active: bool = True


@dataclass
class Major:
    """Academic major / specialization (e.g. SE, IA, AI)."""
    id: str
    code: str
    name: str
    program_id: str = ""
    campus_id: str = ""
    is_active: bool = True


@dataclass
class Term:
    """An academic term (Spring, Summer, Fall)."""
    id: str
    campus_id: str
    academic_year_id: str = ""
    name: str = ""           # "Fall 2026"
    start_date: date | None = None
    end_date: date | None = None
    status: TermStatus = TermStatus.PLANNED


@dataclass
class Course:
    """A course offered by FPT (e.g. PRN232)."""
    id: str
    code: str
    name: str
    description: str = ""
    major_id: str = ""


@dataclass
class ClassSection:
    """One section of a course in a term."""
    id: str
    term_id: str
    course_id: str
    lecturer_id: str
    code: str
    name: str = ""
    capacity: int = 40
    status: SectionStatus = SectionStatus.ACTIVE
    campus_id: str = ""
    max_students: int = 40


# ---------------------------------------------------------------------------
# Core Formation & Team DNA Entities
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class Skill:
    name: str
    proficiency: int  # 1..5

    def __post_init__(self) -> None:
        if not 1 <= self.proficiency <= 5:
            raise ValueError(f"proficiency must be 1..5, got {self.proficiency}")


@dataclass
class ProjectExperience:
    project_name: str
    role: str = ""
    description: str = ""
    duration_months: int = 0


@dataclass
class Student:
    id: str
    name: str = ""
    email: str = ""
    major_id: str = ""
    student_code: str = ""
    campus_id: str = ""
    is_active: bool = True

    # Legacy fields
    skills: list[Skill] = field(default_factory=list)
    experience_years: float = 0.0
    availability: frozenset[str] = frozenset()
    preferred_teammates: frozenset[str] = frozenset()
    desired_role: str = "other"
    major: str = ""

    def competency(self) -> float:
        base = (sum(s.proficiency for s in self.skills) / len(self.skills)) if self.skills else 0.0
        experience_bonus = min(self.experience_years, 3.0) * 0.5
        return round(base + experience_bonus, 6)


@dataclass
class TeamDNA:
    id: str
    student_id: str
    class_section_id: str

    skills: list[Skill] = field(default_factory=list)
    preferred_roles: list[str] = field(default_factory=list)
    experiences: list[ProjectExperience] = field(default_factory=list)
    experience_years: float = 0.0
    availability: list[str] = field(default_factory=list)
    interests: list[str] = field(default_factory=list)
    commitment_level: CommitmentLevel = CommitmentLevel.MEDIUM
    working_preferences: dict[str, str] = field(default_factory=dict)
    portfolio_url: str = ""
    preferred_team_size: int = 0

    completion_percentage: int = 0
    updated_at: datetime | None = None

    def competency(self) -> float:
        base = (sum(s.proficiency for s in self.skills) / len(self.skills)) if self.skills else 0.0
        experience_bonus = min(self.experience_years, 3.0) * 0.5
        return round(base + experience_bonus, 6)

    def compute_completion(self) -> int:
        checks = [
            bool(self.skills),
            bool(self.preferred_roles),
            bool(self.experiences) or self.experience_years > 0,
            bool(self.availability),
            bool(self.interests),
            self.commitment_level != CommitmentLevel.MEDIUM or bool(self.working_preferences),
            bool(self.working_preferences),
        ]
        weights = [20, 15, 15, 15, 10, 10, 15]
        total = sum(w for c, w in zip(checks, weights) if c)
        self.completion_percentage = total
        return total


@dataclass
class GroupingSession:
    id: str
    class_section_id: str
    name: str

    mode: GroupingMode = GroupingMode.HYBRID
    team_min_size: int = 4
    team_max_size: int = 5
    required_roles: list[str] = field(default_factory=list)
    required_skills: list[str] = field(default_factory=list)
    required_majors: list[str] = field(default_factory=list)
    allow_cross_major: bool = True
    max_same_major_count: int = 0

    weights: dict[str, float] = field(default_factory=lambda: {
        "skillCoverage": 30.0,
        "roleFit": 20.0,
        "availability": 20.0,
        "experienceBalance": 10.0,
        "interestSimilarity": 10.0,
        "majorDiversity": 5.0,
        "workStyleCompatibility": 5.0,
    })

    profile_deadline: datetime | None = None
    self_formation_deadline: datetime | None = None
    deadline: datetime | None = None
    status: GroupingSessionStatus = GroupingSessionStatus.DRAFT
    created_at: datetime | None = None
    published_at: datetime | None = None

    def __post_init__(self) -> None:
        if self.team_min_size < 1 or self.team_max_size < self.team_min_size:
            raise ValueError("require 1 <= team_min_size <= team_max_size")


@dataclass
class Project:
    id: str
    min_size: int = 3
    max_size: int = 5
    required_roles: tuple[str, ...] = ()
    required_skills: tuple[str, ...] = ()
    weights: dict[str, float] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if self.min_size < 1 or self.max_size < self.min_size:
            raise ValueError("require 1 <= min_size <= max_size")


@dataclass
class Constraints:
    must_pair: list[tuple[str, str]] = field(default_factory=list)
    cannot_pair: list[tuple[str, str]] = field(default_factory=list)


@dataclass
class TeamMember:
    student_id: str
    role: str = "member"
    status: MembershipStatus = MembershipStatus.ACTIVE
    joined_at: datetime | None = None


@dataclass
class Team:
    id: str
    member_ids: list[str]
    rationale: str = ""
    scores: dict[str, float] = field(default_factory=dict)
    status: TeamStatus = TeamStatus.FORMING
    health_status: HealthStatus = HealthStatus.GREEN
    name: str = ""
    leader_id: str = ""
    locked: bool = False
    project_topic: str = ""
    version: int = 1


@dataclass
class Vacancy:
    """Open position in a group (Smart Rebalance)."""
    id: str
    team_id: str
    required_role: str = ""
    required_major: str = ""
    required_skill: str = ""
    description: str = ""
    status: str = "OPEN"  # OPEN, FILLED, CANCELLED
    created_at: datetime | None = None


@dataclass
class CheckIn:
    """Weekly student team-health check-in."""
    id: str
    team_id: str
    student_id: str
    week_number: int
    current_task: str = ""
    workload: str = "balanced"  # low, balanced, overloaded
    collaboration_rating: int = 5  # 1-5
    is_blocked: bool = False
    blocked_reason: str = ""
    support_requested: bool = False
    submitted_at: datetime | None = None


@dataclass
class RiskAlert:
    """Group-level health risk alert for lecturer intervention."""
    id: str
    team_id: str
    session_id: str
    alert_type: str  # workload_imbalance, missing_checkins, role_unfilled, collaboration_issue, size_below_min
    severity: AlertSeverity = AlertSeverity.MEDIUM
    description: str = ""
    status: str = "OPEN"  # OPEN, IN_REVIEW, RESOLVED, DISMISSED
    created_at: datetime | None = None


@dataclass
class Formation:
    status: str
    seed: int
    teams: list[Team] = field(default_factory=list)
    unassignable: list[tuple[str, str]] = field(default_factory=list)
    conflicts: list[str] = field(default_factory=list)
    balance: float = 0.0


@dataclass
class DraftTeam:
    id: str
    session_id: str
    name: str
    created_by: str
    member_ids: list[str] = field(default_factory=list)
    status: TeamStatus = TeamStatus.FORMING
    created_at: datetime | None = None


@dataclass
class TeamInvitation:
    id: str
    team_id: str
    from_student_id: str
    to_student_id: str
    status: InvitationStatus = InvitationStatus.PENDING
    message: str = ""
    expires_at: datetime | None = None
    created_at: datetime | None = None


@dataclass
class JoinRequest:
    id: str
    team_id: str
    student_id: str
    status: JoinRequestStatus = JoinRequestStatus.PENDING
    message: str = ""
    created_at: datetime | None = None


@dataclass
class Cohort:
    id: str
    owner_id: str
    name: str = ""


@dataclass
class FormationRun:
    id: str
    cohort_id: str
    session_id: str = ""
    project_id: str = ""
    min_size: int = 3
    max_size: int = 5
    seed: int = 0
    status: str = ""
    balance: float = 0.0
    created_at: datetime = field(default_factory=datetime.utcnow)
    teams: list[Team] = field(default_factory=list)


@dataclass
class Constraint:
    id: str
    cohort_id: str
    type: str
    student_a: str
    student_b: str
    status: str = "PENDING"


@dataclass
class CommittedResult:
    id: str
    cohort_id: str
    formation_id: str
    version: int
    status: str
    committed_by: str
    committed_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class AuditEvent:
    id: int
    cohort_id: str
    user_id: str
    action: str
    payload: str
    timestamp: datetime = field(default_factory=datetime.utcnow)


@dataclass
class User:
    id: str
    email: str
    display_name: str = ""
    role: UserRole = UserRole.STUDENT
    user_status: UserStatus = UserStatus.ACTIVE
    student_code: str = ""
    campus_id: str = ""
    is_active: bool = True
    created_at: datetime | None = None


@dataclass
class Enrollment:
    id: str
    student_id: str
    class_section_id: str
    enrolled_at: datetime | None = None
