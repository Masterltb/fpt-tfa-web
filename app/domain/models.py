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
# Enums
# ---------------------------------------------------------------------------

class GroupingMode(str, Enum):
    """Three modes of team formation."""
    LECTURER_LED = "lecturer_led"
    STUDENT_LED = "student_led"
    HYBRID = "hybrid"


class SessionStatus(str, Enum):
    DRAFT = "draft"
    OPEN = "open"           # accepting Team DNA + student teams
    MATCHING = "matching"   # AI is running
    REVIEW = "review"       # lecturer reviewing results
    PUBLISHED = "published" # final, students notified


class TermStatus(str, Enum):
    UPCOMING = "upcoming"
    ACTIVE = "active"
    COMPLETED = "completed"


class CommitmentLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class TeamStatus(str, Enum):
    DRAFT = "draft"           # student-created, not submitted
    SUBMITTED = "submitted"   # submitted for approval
    AI_SUGGESTED = "ai_suggested"
    APPROVED = "approved"
    PUBLISHED = "published"


class InvitationStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    EXPIRED = "expired"


class ConstraintStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


# Desired role is domain-neutral and configured per course/project — NOT software-specific.
# This is only a generic default vocabulary (assumption A-04, needs confirmation); a course can
# supply its own (e.g. lab roles for a science capstone, business roles for a marketing project).
# The field itself is a free-form string; this tuple is just a suggestion list.
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
    status: TermStatus = TermStatus.UPCOMING


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
    max_students: int = 40
    is_active: bool = True


# ---------------------------------------------------------------------------
# Core Formation Entities
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class Skill:
    name: str
    proficiency: int  # 1..5 (A-04)

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
    # These are defaults; real data comes from TeamDNA per class section.
    skills: list[Skill] = field(default_factory=list)
    experience_years: float = 0.0
    availability: frozenset[str] = frozenset()
    preferred_teammates: frozenset[str] = frozenset()
    desired_role: str = "other"
    major: str = ""  # legacy — use major_id for new code

    def competency(self) -> float:
        """Deterministic competency signal (A-04): mean skill proficiency + capped experience.

        Uses only skills and experience — never a protected attribute.
        """
        base = (sum(s.proficiency for s in self.skills) / len(self.skills)) if self.skills else 0.0
        experience_bonus = min(self.experience_years, 3.0) * 0.5  # capped
        return round(base + experience_bonus, 6)


@dataclass
class TeamDNA:
    """A student's team formation profile for a specific class section.

    This is the branded concept — 'Team DNA' — that captures everything needed
    to match a student into a balanced team. One per student per class section.
    """
    id: str
    student_id: str
    class_section_id: str

    # Skills & proficiency
    skills: list[Skill] = field(default_factory=list)

    # Preferred roles (free-form, ordered by preference)
    preferred_roles: list[str] = field(default_factory=list)

    # Project experience
    experiences: list[ProjectExperience] = field(default_factory=list)
    experience_years: float = 0.0

    # Schedule availability (weekly slot ids, e.g. ["mon-evening", "wed-afternoon"])
    availability: list[str] = field(default_factory=list)

    # Interests & project topics
    interests: list[str] = field(default_factory=list)

    # Commitment level
    commitment_level: CommitmentLevel = CommitmentLevel.MEDIUM

    # Working preferences
    working_preferences: dict[str, str] = field(default_factory=dict)
    # e.g. {"communication": "online", "meeting_frequency": "weekly",
    #        "work_style": "structured", "conflict_resolution": "discuss"}

    # Completion tracking
    completion_percentage: int = 0
    updated_at: datetime | None = None

    def competency(self) -> float:
        """Deterministic competency from Team DNA skills + experience."""
        base = (sum(s.proficiency for s in self.skills) / len(self.skills)) if self.skills else 0.0
        experience_bonus = min(self.experience_years, 3.0) * 0.5
        return round(base + experience_bonus, 6)

    def compute_completion(self) -> int:
        """Calculate Team DNA completion percentage (0-100)."""
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
    """One round of team formation within a class section.

    A lecturer creates a grouping session, configures requirements, and manages
    the entire lifecycle from opening → matching → review → publish.
    """
    id: str
    class_section_id: str
    name: str                   # "Capstone Project Teams", "Lab Group Assignment"

    # Configuration
    mode: GroupingMode = GroupingMode.HYBRID
    team_min_size: int = 3
    team_max_size: int = 5
    required_roles: list[str] = field(default_factory=list)
    required_skills: list[str] = field(default_factory=list)
    required_majors: list[str] = field(default_factory=list)  # major diversity requirement

    # Soft constraint weights (0.0 to 1.0)
    weights: dict[str, float] = field(default_factory=lambda: {
        "skill_coverage": 0.25,
        "experience_balance": 0.15,
        "role_match": 0.15,
        "schedule_overlap": 0.15,
        "commitment_compat": 0.10,
        "interest_similarity": 0.10,
        "major_diversity": 0.05,
        "working_pref_compat": 0.05,
    })

    # Lifecycle
    deadline: datetime | None = None
    status: SessionStatus = SessionStatus.DRAFT
    created_at: datetime | None = None
    published_at: datetime | None = None

    def __post_init__(self) -> None:
        if self.team_min_size < 1 or self.team_max_size < self.team_min_size:
            raise ValueError("require 1 <= team_min_size <= team_max_size")


@dataclass
class Project:
    """A unit of work needing a team; declares size band and required skills/roles.

    Legacy entity — in the new structure, GroupingSession replaces most of Project's role.
    Kept for backward compatibility with existing matching engine.
    """
    id: str
    min_size: int = 3   # A-02
    max_size: int = 5   # A-02
    required_roles: tuple[str, ...] = ()
    required_skills: tuple[str, ...] = ()
    weights: dict[str, float] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if self.min_size < 1 or self.max_size < self.min_size:
            raise ValueError("require 1 <= min_size <= max_size")


@dataclass
class Constraints:
    must_pair: list[tuple[str, str]] = field(default_factory=list)   # hard (R2)
    cannot_pair: list[tuple[str, str]] = field(default_factory=list)  # hard (R2)


@dataclass
class Team:
    id: str
    member_ids: list[str]
    rationale: str = ""
    scores: dict[str, float] = field(default_factory=dict)
    status: TeamStatus = TeamStatus.AI_SUGGESTED
    name: str = ""  # display name, e.g. "Team 03"


@dataclass
class Formation:
    """Result of one run. status is 'ok' or 'infeasible'."""
    status: str
    seed: int
    teams: list[Team] = field(default_factory=list)
    unassignable: list[tuple[str, str]] = field(default_factory=list)  # (student_id, reason)
    conflicts: list[str] = field(default_factory=list)  # why infeasible
    balance: float = 0.0


# ---------------------------------------------------------------------------
# Student-led Team Formation Entities
# ---------------------------------------------------------------------------

@dataclass
class DraftTeam:
    """A team created by a student (student-led or hybrid mode)."""
    id: str
    session_id: str
    name: str
    created_by: str             # student who created the team
    member_ids: list[str] = field(default_factory=list)
    status: TeamStatus = TeamStatus.DRAFT
    created_at: datetime | None = None


@dataclass
class TeamInvitation:
    """Invitation from a team to a student."""
    id: str
    team_id: str
    from_student_id: str
    to_student_id: str
    status: InvitationStatus = InvitationStatus.PENDING
    message: str = ""
    created_at: datetime | None = None


@dataclass
class JoinRequest:
    """Request from a student to join a team."""
    id: str
    team_id: str
    student_id: str
    status: InvitationStatus = InvitationStatus.PENDING
    message: str = ""
    created_at: datetime | None = None


# ---------------------------------------------------------------------------
# Operational Entities (kept from skeleton, extended)
# ---------------------------------------------------------------------------

@dataclass
class Cohort:
    """Legacy: A group of students owned by one lecturer (object-level authz anchor, BR-13).

    In the new model, ClassSection replaces Cohort. Kept for backward compatibility
    with existing matching engine and tests.
    """
    id: str
    owner_id: str  # the lecturer (user id) who owns this cohort
    name: str = ""


@dataclass
class FormationRun:
    id: str
    cohort_id: str      # or class_section_id
    session_id: str = ""  # new: links to GroupingSession
    project_id: str = ""  # legacy
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
    cohort_id: str      # or class_section_id
    type: str           # 'must_pair', 'cannot_pair'
    student_a: str
    student_b: str
    status: str = "pending"  # 'pending', 'approved', 'rejected'


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


# ---------------------------------------------------------------------------
# User Management
# ---------------------------------------------------------------------------

@dataclass
class User:
    """System user — can be a student, lecturer, or admin."""
    id: str
    email: str
    display_name: str = ""
    role: str = "student"       # "student", "lecturer", "admin"
    campus_id: str = ""
    is_active: bool = True
    created_at: datetime | None = None


@dataclass
class Enrollment:
    """Links a student to a class section."""
    id: str
    student_id: str
    class_section_id: str
    enrolled_at: datetime | None = None
