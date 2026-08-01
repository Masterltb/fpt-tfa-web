"""Database engine/session + tables (SQLAlchemy 2.0). Free/OSS; local by default.

DATABASE_URL selects the backend. Default is a local SQLite file for dev; production points
this at a free-tier Postgres (Neon / Supabase) — the repository code is unchanged, only the
URL differs. Student PII therefore stays on infra we control (docs/architecture.md).
"""
from __future__ import annotations

from datetime import datetime
import os

from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker, relationship

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./tfa.db")



class Base(DeclarativeBase):
    pass


class CohortRow(Base):
    __tablename__ = "cohorts"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    owner_id: Mapped[str] = mapped_column(String, index=True)
    name: Mapped[str] = mapped_column(String, default="")


class FormationRunRow(Base):
    __tablename__ = "formation_runs"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    cohort_id: Mapped[str] = mapped_column(String, index=True)
    project_id: Mapped[str] = mapped_column(String)
    min_size: Mapped[int] = mapped_column(Integer)
    max_size: Mapped[int] = mapped_column(Integer)
    seed: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String)  # succeeded, infeasible, committed
    balance: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    teams: Mapped[list[FormationTeamRow]] = relationship(
        "FormationTeamRow", back_populates="run", cascade="all, delete-orphan"
    )


class FormationTeamRow(Base):
    __tablename__ = "formation_teams"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    formation_id: Mapped[str] = mapped_column(String, ForeignKey("formation_runs.id"))
    name: Mapped[str] = mapped_column(String)  # e.g. "team-1"
    rationale: Mapped[str] = mapped_column(String, default="")
    member_ids: Mapped[str] = mapped_column(String)  # comma-separated list of user ids

    run: Mapped[FormationRunRow] = relationship("FormationRunRow", back_populates="teams")


class CommittedResultRow(Base):
    __tablename__ = "committed_results"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    cohort_id: Mapped[str] = mapped_column(String, index=True)
    formation_id: Mapped[str] = mapped_column(String, ForeignKey("formation_runs.id"))
    version: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String)  # active, superseded
    committed_by: Mapped[str] = mapped_column(String)
    committed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class StudentConstraintRow(Base):
    __tablename__ = "student_constraints"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    cohort_id: Mapped[str] = mapped_column(String, ForeignKey("cohorts.id"), index=True)
    type: Mapped[str] = mapped_column(String)  # must_pair, cannot_pair
    student_a: Mapped[str] = mapped_column(String)
    student_b: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String, default="pending")  # pending, approved, rejected


class AuditEventRow(Base):
    __tablename__ = "audit_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    cohort_id: Mapped[str] = mapped_column(String, index=True)
    user_id: Mapped[str] = mapped_column(String)
    action: Mapped[str] = mapped_column(String)
    payload: Mapped[str] = mapped_column(String)  # JSON string
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class StudentRow(Base):
    __tablename__ = "students"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, default="")
    major: Mapped[str] = mapped_column(String, default="")
    experience_years: Mapped[float] = mapped_column(Float, default=0.0)
    desired_role: Mapped[str] = mapped_column(String, default="other")
    availability: Mapped[str] = mapped_column(String, default="[]")  # JSON list

    skills: Mapped[list[StudentSkillRow]] = relationship(
        "StudentSkillRow", back_populates="student", cascade="all, delete-orphan"
    )


class StudentSkillRow(Base):
    __tablename__ = "student_skills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[str] = mapped_column(String, ForeignKey("students.id"))
    skill_name: Mapped[str] = mapped_column(String)
    proficiency: Mapped[int] = mapped_column(Integer)

    student: Mapped[StudentRow] = relationship("StudentRow", back_populates="skills")


class EnrollmentRow(Base):
    __tablename__ = "enrollments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[str] = mapped_column(String, ForeignKey("students.id"))
    cohort_id: Mapped[str] = mapped_column(String, ForeignKey("cohorts.id"))



def make_engine(url: str | None = None):
    return create_engine(url or DATABASE_URL, future=True)


def make_session_factory(engine):
    return sessionmaker(bind=engine, expire_on_commit=False, future=True)


def init_db(engine) -> None:
    Base.metadata.create_all(engine)

