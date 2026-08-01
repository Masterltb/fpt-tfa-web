"""Domain models for Team Formation Assistant.

Pure stdlib (dataclasses) — no FastAPI / ORM / OR-Tools imports here, so the domain and the
matching engine run and are tested without external dependencies (see docs/architecture.md).

Privacy (constitution BR-08/BR-09, A-05): the model carries NO protected attributes
(gender, ethnicity, religion, health, age). Competency derives only from skills + experience.

FPT Academic Structure:
  Campus → Term → Course → ClassSection → GroupingSession → Teams
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime
from enum import Enum

# ---------------------------------------------------------------------------
# Enums (Aligned with API Spec v1.0.0)
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
    FORMING = "FORMING"       # student-created, draft
    SUBMITTED = "SUBMITTED"   # submitted for approval
    APPROVED = "APPROVED"    # approved by lecturer
    PUBLISHED = "PUBLISHED"   # official published team
    REJECTED = "REJECTED"
    DISSOLVED = "DISSOLVED"
    AI_SUGGESTED = "AI_SUGGESTED"  # legacy compatibility alias


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


# Alias for SessionStatus for backward compatibility
SessionStatus = GroupingSessionStatus


# Desired role vocabulary suggestions
DEFAULT_ROLES = ("leader", "coordinator", "researcher", "presenter", "member", "other")


# ---------------------------------------------------------------------------
# FPT Academic Structure Entities
# ---------------------------------------------------------------------------

@dataclass
class Campus:
    """An FPT University campus (e.g. HCM, HN, DN, CT)."""
    id: str
    code: str       # "HCM", "HN", "DN", "CT"
    name: str       # "FPT University Ho Chi Minh City"
    is_active: bool = True


@dataclass
class Major:
    """Academic major / program (e.g. SE, IA, AI)."""
    id: str
    code: str       # "SE", "IA", "AI"
    name: str       # "Software Engineering"
    campus_id: str = ""
    is_active: bool = True


@dataclass
class Term:
    """An academic term within a campus (e.g. Fall 2026)."""
    id: str
    campus_id: str
    name: str           # "Fall 2026"
    start_date: date | None = None
    end_date: date | None = None
    status: TermStatus = TermStatus.PLANNED


@dataclass
class Course:
    """A course offered by FPT (e.g. PRN232)."""
    id: str
    code: str           # "PRN232"
    name: str           # "Building Cross-Platform Back-End Application With .NET"
    description: str = ""
    major_id: str = ""  # primary major


@dataclass
class ClassSection:
    """One section of a course in a term — replaces old 'Cohort'.

    This is the unit where a lecturer teaches students and where grouping happens.
    Example: SE18xx section of PRN232 in Fall 2026.
    """
    id: str
    term_id: str
    course_id: str
    lecturer_id: str        # the lecturer (user id) who owns this class
    code: str               # "SE18xx"
    name: str = ""          # optional display name
    capacity: int = 40
    status: SectionStatus = SectionStatus.ACTIVE
    campus_id: str = ""
    max_students: int = 40


# ---------------------------------------------------------------------------
# Core Formation Entities
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class Skill:
    name: str
    proficiency: int  # 1..5 (1 Beginner, 2 Basic, 3 Intermediate, 4 Advanced, 5 Expert)

    def __post_init__(self) -> None:
        if not 1 <= self.proficiency <= 5:
            raise ValueError(f"proficiency must be 1..5, got {self.proficiency}")


@dataclass
class ProjectExperience:
    """A single project experience entry in a student's Team DNA."""
    project_name: str
    role: str = ""
    description: str = ""
    duration_months: int = 0


@dataclass
class Student:
    """A student user in the system. Basic identity; Team DNA is per-class-section."""
    id: str
    name: str = ""
    email: str = ""
    major_id: str = ""
    student_code: str = ""  # FPT student code, e.g. "SE170001"
    campus_id: str = ""
    is_active: bool = True

    # Legacy fields for backward compatibility with existing matching engine.
    skills: list[Skill] = field(default_factory=list)
    experience_years: float = 0.0
    availability: frozenset[str] = frozenset()
    preferred_teammates: frozenset[str] = frozenset()
    desired_role: str = "other"
    major: str = ""  # legacy — use major_id for new code

    def competency(self) -> float:
        base = (sum(s.proficiency for s in self.skills) / len(self.skills)) if self.skills else 0.0
        experience_bonus = min(self.experience_years, 3.0) * 0.5
        return round(base + experience_bonus, 6)


@dataclass
class TeamDNA:
    """A student's team formation profile for a specific class section."""
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

    completion_percentage: int = 0
    updated_at: datetime | None = None

    def competency(self) -> float:
        base = (sum(s.proficiency for s in self.skills) / len(self.skills)) if self.skills else 0.0
        experience_bonus = min(self.experience_years, 3.0) * 0.5
        return round(base + experience_bonus, 6)

    def compute_completion(self) -> int:
        checks = [
            bool(self.skills),                  # 20%
            bool(self.preferred_roles),         # 15%
            bool(self.experiences) or self.experience_years > 0,  # 15%
            bool(self.availability),            # 15%
            bool(self.interests),               # 10%
            self.commitment_level != CommitmentLevel.MEDIUM or bool(self.working_preferences),  # 10%
            bool(self.working_preferences),     # 15%
        ]
        weights = [20, 15, 15, 15, 10, 10, 15]
        total = sum(w for c, w in zip(checks, weights) if c)
        self.completion_percentage = total
        return total


@dataclass
class GroupingSession:
    """One round of team formation within a class section."""
    id: str
    class_section_id: str
    name: str                   # "Capstone Project Teams", "Lab Group Assignment"

    mode: GroupingMode = GroupingMode.HYBRID
    team_min_size: int = 4
    team_max_size: int = 5
    required_roles: list[str] = field(default_factory=list)
    required_skills: list[str] = field(default_factory=list)
    required_majors: list[str] = field(default_factory=list)

    weights: dict[str, float] = field(default_factory=lambda: {
        "skillCoverage": 30.0,
        "roleFit": 20.0,
        "availability": 20.0,
        "experienceBalance": 10.0,
        "interestSimilarity": 10.0,
        "majorDiversity": 5.0,
        "workStyleCompatibility": 5.0,
    })

    deadline: datetime | None = None
    status: GroupingSessionStatus = GroupingSessionStatus.DRAFT
    created_at: datetime | None = None
    published_at: datetime | None = None

    def __post_init__(self) -> None:
        if self.team_min_size < 1 or self.team_max_size < self.team_min_size:
            raise ValueError("require 1 <= team_min_size <= team_max_size")


@dataclass
class Project:
    """Legacy unit of work for matching engine compatibility."""
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
class Team:
    id: str
    member_ids: list[str]
    rationale: str = ""
    scores: dict[str, float] = field(default_factory=dict)
    status: TeamStatus = TeamStatus.FORMING
    name: str = ""  # e.g. "Binary Builders"
    leader_id: str = ""
    locked: bool = False
    version: int = 1


@dataclass
class Formation:
    """Result of one run. status is 'ok' or 'infeasible'."""
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
    """Legacy cohort anchor."""
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
    type: str  # 'must_pair', 'cannot_pair'
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
