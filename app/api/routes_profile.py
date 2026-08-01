"""Student profile routes & Team DNA Wizard endpoints.

Supports full Team DNA intake per FPT course section.
"""
from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.domain.models import Student, Skill, CommitmentLevel
from app.repositories import StudentRepository
from app.api.deps import Principal, get_student_repo, require_student

router = APIRouter(prefix="/api/v1/profiles", tags=["Student DNA Profile"])


class SkillIn(BaseModel):
    name: str
    proficiency: int = Field(ge=1, le=5)


class ExperienceIn(BaseModel):
    project_name: str
    role: str = ""
    description: str = ""
    duration_months: int = 0


class TeamDNAPayload(BaseModel):
    class_section_id: str = "sec-se1701"
    skills: list[SkillIn] = Field(default_factory=list)
    preferred_roles: list[str] = Field(default_factory=list)
    experiences: list[ExperienceIn] = Field(default_factory=list)
    experience_years: float = 0.0
    availability: list[str] = Field(default_factory=list)
    interests: list[str] = Field(default_factory=list)
    commitment_level: CommitmentLevel = CommitmentLevel.MEDIUM
    working_preferences: dict[str, str] = Field(default_factory=dict)
    portfolio_url: str = ""
    preferred_team_size: int = 4


# In-memory storage for Team DNA profiles
_dnas: dict[str, dict[str, Any]] = {}


@router.get("/me")
async def get_my_profile(
    principal: Principal = Depends(require_student),
    students: StudentRepository = Depends(get_student_repo),
) -> dict[str, Any]:
    dna = _dnas.get(principal.user_id)
    if dna:
        return dna

    student = students.get(principal.user_id)
    if student:
        return {
            "id": f"dna-{student.id}",
            "student_id": student.id,
            "class_section_id": "sec-se1701",
            "skills": [{"name": s.name, "proficiency": s.proficiency} for s in student.skills],
            "preferred_roles": [student.desired_role],
            "experiences": [],
            "experience_years": student.experience_years,
            "availability": list(student.availability),
            "interests": [],
            "commitment_level": "MEDIUM",
            "working_preferences": {},
            "portfolio_url": "",
            "completion_percentage": 50,
        }

    # Default skeleton Team DNA
    return {
        "id": f"dna-{principal.user_id}",
        "student_id": principal.user_id,
        "class_section_id": "sec-se1701",
        "skills": [],
        "preferred_roles": ["member"],
        "experiences": [],
        "experience_years": 0.0,
        "availability": [],
        "interests": [],
        "commitment_level": "MEDIUM",
        "working_preferences": {},
        "portfolio_url": "",
        "completion_percentage": 0,
    }


@router.put("/me")
async def update_my_profile(
    body: TeamDNAPayload,
    principal: Principal = Depends(require_student),
    students: StudentRepository = Depends(get_student_repo),
) -> dict[str, Any]:
    # Calculate completion percentage
    checks = [
        bool(body.skills),
        bool(body.preferred_roles),
        bool(body.experiences) or body.experience_years > 0,
        bool(body.availability),
        bool(body.interests),
        body.commitment_level != CommitmentLevel.MEDIUM or bool(body.working_preferences),
        bool(body.working_preferences),
    ]
    weights = [20, 15, 15, 15, 10, 10, 15]
    completion = sum(w for c, w in zip(checks, weights) if c)

    dna_record = {
        "id": f"dna-{principal.user_id}",
        "student_id": principal.user_id,
        "completion_percentage": completion,
        **body.model_dump(),
    }
    _dnas[principal.user_id] = dna_record

    # Sync back to student repo for legacy compatibility
    student = Student(
        id=principal.user_id,
        name=principal.user_id,
        experience_years=body.experience_years,
        desired_role=body.preferred_roles[0] if body.preferred_roles else "member",
        availability=frozenset(body.availability),
        skills=[Skill(s.name, s.proficiency) for s in body.skills],
    )
    students.save(student)

    return {"status": "ok", "completion_percentage": completion, "dna": dna_record}
