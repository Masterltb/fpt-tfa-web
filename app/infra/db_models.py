"""SQLAlchemy 2.0 ORM Mappings for TFA Database.

Implements all entities for FPT Academic Structure, Team DNA, Grouping Sessions,
Teams, Vacancies, Check-Ins, Risk Alerts, and Invitations.
"""
from __future__ import annotations

from datetime import datetime, date

from sqlalchemy import String, Integer, Float, Boolean, DateTime, Date, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.domain.models import (
    UserRole, UserStatus, GroupingMode, GroupingSessionStatus,
    TermStatus, SectionStatus, CommitmentLevel, TeamStatus,
    MembershipStatus, HealthStatus, AlertSeverity, InvitationStatus,
    JoinRequestStatus
)
from app.infra.database import Base


class UserRow(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String, default="")
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), default=UserRole.STUDENT, index=True)
    user_status: Mapped[UserStatus] = mapped_column(SQLEnum(UserStatus), default=UserStatus.ACTIVE)
    student_code: Mapped[str] = mapped_column(String, default="", index=True)
    campus_id: Mapped[str] = mapped_column(String, default="", index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class CampusRow(Base):
    __tablename__ = "campuses"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    code: Mapped[str] = mapped_column(String, unique=True, index=True)
    name: Mapped[str] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class AcademicYearRow(Base):
    __tablename__ = "academic_years"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class ProgramRow(Base):
    __tablename__ = "programs"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    code: Mapped[str] = mapped_column(String, unique=True, index=True)
    name: Mapped[str] = mapped_column(String)
    campus_id: Mapped[str] = mapped_column(String, default="", index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class MajorRow(Base):
    __tablename__ = "majors"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    code: Mapped[str] = mapped_column(String, index=True)
    name: Mapped[str] = mapped_column(String)
    program_id: Mapped[str] = mapped_column(String, default="")
    campus_id: Mapped[str] = mapped_column(String, default="", index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class TermRow(Base):
    __tablename__ = "terms"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    campus_id: Mapped[str] = mapped_column(String, index=True)
    academic_year_id: Mapped[str] = mapped_column(String, default="")
    name: Mapped[str] = mapped_column(String, default="")
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[TermStatus] = mapped_column(SQLEnum(TermStatus), default=TermStatus.PLANNED)


class CourseRow(Base):
    __tablename__ = "courses"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    code: Mapped[str] = mapped_column(String, index=True)
    name: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(Text, default="")
    major_id: Mapped[str] = mapped_column(String, default="")


class ClassSectionRow(Base):
    __tablename__ = "class_sections"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    term_id: Mapped[str] = mapped_column(String, index=True)
    course_id: Mapped[str] = mapped_column(String, index=True)
    lecturer_id: Mapped[str] = mapped_column(String, index=True)
    code: Mapped[str] = mapped_column(String, index=True)
    name: Mapped[str] = mapped_column(String, default="")
    capacity: Mapped[int] = mapped_column(Integer, default=40)
    status: Mapped[SectionStatus] = mapped_column(SQLEnum(SectionStatus), default=SectionStatus.ACTIVE)
    campus_id: Mapped[str] = mapped_column(String, default="")


class GroupingSessionRow(Base):
    __tablename__ = "grouping_sessions"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    class_section_id: Mapped[str] = mapped_column(String, index=True)
    name: Mapped[str] = mapped_column(String)

    mode: Mapped[GroupingMode] = mapped_column(SQLEnum(GroupingMode), default=GroupingMode.HYBRID)
    team_min_size: Mapped[int] = mapped_column(Integer, default=4)
    team_max_size: Mapped[int] = mapped_column(Integer, default=5)
    
    # Store JSON arrays/dicts as JSON strings for cross-DB compatibility
    required_roles_json: Mapped[str] = mapped_column(Text, default="[]")
    required_skills_json: Mapped[str] = mapped_column(Text, default="[]")
    required_majors_json: Mapped[str] = mapped_column(Text, default="[]")
    allow_cross_major: Mapped[bool] = mapped_column(Boolean, default=True)
    max_same_major_count: Mapped[int] = mapped_column(Integer, default=0)
    weights_json: Mapped[str] = mapped_column(Text, default="{}")

    profile_deadline: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    self_formation_deadline: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    deadline: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    status: Mapped[GroupingSessionStatus] = mapped_column(
        SQLEnum(GroupingSessionStatus), default=GroupingSessionStatus.DRAFT, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class TeamDNARow(Base):
    __tablename__ = "team_dnas"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    student_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), index=True)
    class_section_id: Mapped[str] = mapped_column(String, index=True)

    skills_json: Mapped[str] = mapped_column(Text, default="[]")
    preferred_roles_json: Mapped[str] = mapped_column(Text, default="[]")
    experiences_json: Mapped[str] = mapped_column(Text, default="[]")
    experience_years: Mapped[float] = mapped_column(Float, default=0.0)
    availability_json: Mapped[str] = mapped_column(Text, default="[]")
    interests_json: Mapped[str] = mapped_column(Text, default="[]")
    commitment_level: Mapped[CommitmentLevel] = mapped_column(
        SQLEnum(CommitmentLevel), default=CommitmentLevel.MEDIUM
    )
    working_preferences_json: Mapped[str] = mapped_column(Text, default="{}")
    portfolio_url: Mapped[str] = mapped_column(String, default="")
    preferred_team_size: Mapped[int] = mapped_column(Integer, default=0)

    completion_percentage: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class TeamRow(Base):
    __tablename__ = "teams"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    session_id: Mapped[str] = mapped_column(String, index=True)
    name: Mapped[str] = mapped_column(String, default="")
    member_ids_json: Mapped[str] = mapped_column(Text, default="[]")
    rationale: Mapped[str] = mapped_column(Text, default="")
    scores_json: Mapped[str] = mapped_column(Text, default="{}")
    status: Mapped[TeamStatus] = mapped_column(SQLEnum(TeamStatus), default=TeamStatus.FORMING, index=True)
    health_status: Mapped[HealthStatus] = mapped_column(SQLEnum(HealthStatus), default=HealthStatus.GREEN)
    leader_id: Mapped[str] = mapped_column(String, default="")
    locked: Mapped[bool] = mapped_column(Boolean, default=False)
    project_topic: Mapped[str] = mapped_column(String, default="")
    version: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class TeamMemberRow(Base):
    __tablename__ = "team_members"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    team_id: Mapped[str] = mapped_column(String, ForeignKey("teams.id"), index=True)
    student_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), index=True)
    role: Mapped[str] = mapped_column(String, default="member")
    status: Mapped[MembershipStatus] = mapped_column(SQLEnum(MembershipStatus), default=MembershipStatus.ACTIVE)
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class VacancyRow(Base):
    __tablename__ = "vacancies"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    team_id: Mapped[str] = mapped_column(String, ForeignKey("teams.id"), index=True)
    required_role: Mapped[str] = mapped_column(String, default="")
    required_major: Mapped[str] = mapped_column(String, default="")
    required_skill: Mapped[str] = mapped_column(String, default="")
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String, default="OPEN")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class CheckInRow(Base):
    __tablename__ = "checkins"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    team_id: Mapped[str] = mapped_column(String, ForeignKey("teams.id"), index=True)
    student_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), index=True)
    week_number: Mapped[int] = mapped_column(Integer)
    current_task: Mapped[str] = mapped_column(Text, default="")
    workload: Mapped[str] = mapped_column(String, default="balanced")
    collaboration_rating: Mapped[int] = mapped_column(Integer, default=5)
    is_blocked: Mapped[bool] = mapped_column(Boolean, default=False)
    blocked_reason: Mapped[str] = mapped_column(Text, default="")
    support_requested: Mapped[bool] = mapped_column(Boolean, default=False)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class RiskAlertRow(Base):
    __tablename__ = "risk_alerts"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    team_id: Mapped[str] = mapped_column(String, ForeignKey("teams.id"), index=True)
    session_id: Mapped[str] = mapped_column(String, index=True)
    alert_type: Mapped[str] = mapped_column(String)
    severity: Mapped[AlertSeverity] = mapped_column(SQLEnum(AlertSeverity), default=AlertSeverity.MEDIUM)
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String, default="OPEN")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class TeamInvitationRow(Base):
    __tablename__ = "team_invitations"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    team_id: Mapped[str] = mapped_column(String, ForeignKey("teams.id"), index=True)
    from_student_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), index=True)
    to_student_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), index=True)
    status: Mapped[InvitationStatus] = mapped_column(SQLEnum(InvitationStatus), default=InvitationStatus.PENDING)
    message: Mapped[str] = mapped_column(Text, default="")
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class JoinRequestRow(Base):
    __tablename__ = "join_requests"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    team_id: Mapped[str] = mapped_column(String, ForeignKey("teams.id"), index=True)
    student_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), index=True)
    status: Mapped[JoinRequestStatus] = mapped_column(SQLEnum(JoinRequestStatus), default=JoinRequestStatus.PENDING)
    message: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
