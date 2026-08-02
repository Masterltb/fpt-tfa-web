"""Student Dashboard & Team DNA API Router (Agent Role: Senior Backend & BA).

Implements Student Dashboard, Team DNA profile wizard, Availability Grid, Experiences, and Readiness score.
RFC 7807 compliance & RBAC enforced (docs/rbac.md & docs/api-contract.md).
"""
from __future__ import annotations

import uuid
from typing import Any
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field

from app.api.deps import Principal, require_student
from app.domain.models import CommitmentLevel

router = APIRouter(prefix="/api/v1/students/me", tags=["Student DNA & Dashboard"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class SkillEntryPayload(BaseModel):
    name: str
    proficiency: int = Field(ge=1, le=5)


class AvailabilityPayload(BaseModel):
    slots: list[str] = Field(default_factory=list, description="e.g. ['MON_AM', 'WED_PM']")


class ExperiencePayload(BaseModel):
    project_name: str
    role: str = ""
    description: str = ""
    duration_months: int = 0


class TeamDNAProfilePayload(BaseModel):
    class_section_id: str = "sec-se1701"
    skills: list[SkillEntryPayload] = Field(default_factory=list)
    preferred_roles: list[str] = Field(default_factory=list)
    experiences: list[ExperiencePayload] = Field(default_factory=list)
    experience_years: float = 0.0
    availability: list[str] = Field(default_factory=list)
    interests: list[str] = Field(default_factory=list)
    commitment_level: CommitmentLevel = CommitmentLevel.MEDIUM
    working_preferences: dict[str, str] = Field(default_factory=dict)
    portfolio_url: str = ""
    preferred_team_size: int = 4


_student_dnas: dict[str, dict[str, Any]] = {}
_student_availabilities: dict[str, list[str]] = {}
_student_experiences: dict[str, list[dict[str, Any]]] = {}


# ---------------------------------------------------------------------------
# Student Dashboard & Readiness Endpoints
# ---------------------------------------------------------------------------

@router.get("/dashboard")
async def get_student_dashboard(principal: Principal = Depends(require_student)) -> dict[str, Any]:
    dna = _student_dnas.get(principal.user_id, {})
    completion = dna.get("completion_percentage", 65)

    return {
        "data": {
            "student_id": principal.user_id,
            "active_session": {
                "id": "sess-fall26-01",
                "name": "Capstar Team Formation - Fall 2026",
                "course_code": "PRN232",
                "section_code": "SE1701",
                "mode": "HYBRID",
                "status": "OPEN",
                "deadline": "2026-09-15T23:59:59Z"
            },
            "my_team": None,
            "profile_readiness": completion,
            "pending_invitations_count": 1
        }
    }


@router.get("/sections")
async def get_student_sections(principal: Principal = Depends(require_student)) -> dict[str, Any]:
    sections = [
        {
            "id": "sec-se1701",
            "code": "SE1701",
            "course_id": "crs-prn232",
            "course_code": "PRN232",
            "course_name": "C# & .NET Enterprise Applications",
            "term_id": "term-fall26",
            "status": "ACTIVE"
        }
    ]
    return {"data": sections, "meta": {"total": len(sections)}}



@router.get("/profile-readiness")
async def get_profile_readiness(principal: Principal = Depends(require_student)) -> dict[str, Any]:
    dna = _student_dnas.get(principal.user_id, {})
    score = dna.get("completion_percentage", 65)
    return {
        "data": {
            "readiness_score": score,
            "is_complete": score >= 80,
            "missing_sections": ["working_preferences"] if score < 80 else []
        }
    }


# ---------------------------------------------------------------------------
# Team DNA Endpoints
# ---------------------------------------------------------------------------

import json
from sqlalchemy.orm import Session
from app.infra.database import get_db
from app.infra.db_models import TeamDNARow, ClassSectionRow, GroupingSessionRow


@router.get("/team-profile")
async def get_team_profile(db: Session = Depends(get_db), principal: Principal = Depends(require_student)) -> dict[str, Any]:
    row = db.query(TeamDNARow).filter(TeamDNARow.student_id == principal.user_id).first()
    if row:
        dna = {
            "id": row.id,
            "student_id": row.student_id,
            "class_section_id": row.class_section_id,
            "skills": json.loads(row.skills_json) if row.skills_json else [],
            "preferred_roles": json.loads(row.preferred_roles_json) if row.preferred_roles_json else [],
            "experience_years": row.experience_years,
            "availability": json.loads(row.availability_json) if row.availability_json else [],
            "interests": json.loads(row.interests_json) if row.interests_json else [],
            "commitment_level": row.commitment_level.value if hasattr(row.commitment_level, 'value') else str(row.commitment_level),
            "completion_percentage": row.completion_percentage
        }
    else:
        dna = {
            "id": f"dna-{principal.user_id}",
            "student_id": principal.user_id,
            "class_section_id": "sec_se1801_swe201c",
            "skills": [{"name": "Python", "proficiency": 4}, {"name": "React", "proficiency": 3}],
            "preferred_roles": ["backend", "leader"],
            "experience_years": 1.0,
            "availability": ["MON_AM", "TUE_PM", "THU_PM"],
            "interests": ["AI", "Web Development"],
            "commitment_level": "HIGH",
            "completion_percentage": 90
        }
    return {"data": dna}


@router.put("/team-profile")
async def update_team_profile(
    payload: TeamDNAProfilePayload,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    checks = [
        bool(payload.skills),
        bool(payload.preferred_roles),
        bool(payload.experiences) or payload.experience_years > 0,
        bool(payload.availability),
        bool(payload.interests),
        payload.commitment_level != CommitmentLevel.MEDIUM or bool(payload.working_preferences),
        bool(payload.working_preferences),
    ]
    weights = [20, 15, 15, 15, 10, 10, 15]
    completion = sum(w for c, w in zip(checks, weights) if c)

    row = db.query(TeamDNARow).filter(TeamDNARow.student_id == principal.user_id).first()
    skills_json_str = json.dumps([s.model_dump() for s in payload.skills])
    roles_json_str = json.dumps(payload.preferred_roles)
    avail_json_str = json.dumps(payload.availability)
    interests_json_str = json.dumps(payload.interests)

    if row:
        row.skills_json = skills_json_str
        row.preferred_roles_json = roles_json_str
        row.availability_json = avail_json_str
        row.interests_json = interests_json_str
        row.commitment_level = payload.commitment_level
        row.completion_percentage = completion
    else:
        row = TeamDNARow(
            id=f"dna-{principal.user_id}",
            student_id=principal.user_id,
            class_section_id=payload.class_section_id or "sec_se1801_swe201c",
            skills_json=skills_json_str,
            preferred_roles_json=roles_json_str,
            availability_json=avail_json_str,
            interests_json=interests_json_str,
            commitment_level=payload.commitment_level,
            completion_percentage=completion
        )
        db.add(row)

    db.commit()

    dna = {
        "id": row.id,
        "student_id": row.student_id,
        "completion_percentage": completion,
        **payload.model_dump()
    }
    _student_dnas[principal.user_id] = dna
    return {"data": dna}


# ---------------------------------------------------------------------------
# Availability Grid Endpoints
# ---------------------------------------------------------------------------

@router.get("/availability")
async def get_availability(principal: Principal = Depends(require_student)) -> dict[str, Any]:
    slots = _student_availabilities.get(principal.user_id, ["MON_AM", "TUE_PM", "THU_PM"])
    return {"data": {"slots": slots}}


@router.put("/availability")
async def update_availability(
    payload: AvailabilityPayload,
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    _student_availabilities[principal.user_id] = payload.slots
    return {"data": {"slots": payload.slots}}


# ---------------------------------------------------------------------------
# Experience Management Endpoints
# ---------------------------------------------------------------------------

@router.get("/experiences")
async def list_experiences(principal: Principal = Depends(require_student)) -> dict[str, Any]:
    exps = _student_experiences.get(principal.user_id, [
        {
            "id": "exp-1",
            "project_name": "E-Commerce Microservices",
            "role": "Backend Lead",
            "description": "Built catalog and checkout APIs in FastAPI.",
            "duration_months": 4
        }
    ])
    return {"data": exps}


@router.post("/experiences", status_code=status.HTTP_201_CREATED)
async def add_experience(
    payload: ExperiencePayload,
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    exp_id = f"exp-{uuid.uuid4().hex[:6]}"
    item = {"id": exp_id, **payload.model_dump()}
    if principal.user_id not in _student_experiences:
        _student_experiences[principal.user_id] = []
    _student_experiences[principal.user_id].append(item)
    return {"data": item}


@router.patch("/experiences/{experience_id}")
async def patch_experience(
    experience_id: str,
    payload: ExperiencePayload,
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    exps = _student_experiences.get(principal.user_id, [])
    item = next((e for e in exps if e["id"] == experience_id), None)
    if not item:
        item = {"id": experience_id, **payload.model_dump()}
        exps.append(item)
    else:
        item.update(payload.model_dump())
    return {"data": item}



@router.delete("/experiences/{experience_id}")
async def delete_experience(
    experience_id: str,
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    exps = _student_experiences.get(principal.user_id, [])
    _student_experiences[principal.user_id] = [e for e in exps if e["id"] != experience_id]
    return {"data": {"message": "Experience deleted"}}


@router.get("/grouping-sessions")
async def list_my_grouping_sessions(principal: Principal = Depends(require_student)) -> dict[str, Any]:
    sessions = [
        {
            "id": "sess-fall26-01",
            "name": "Capstar Team Formation - Fall 2026",
            "class_section_id": "sec-se1701",
            "mode": "HYBRID",
            "status": "OPEN",
            "team_min_size": 4,
            "team_max_size": 5
        }
    ]
    return {"data": sessions, "meta": {"total": len(sessions)}}


@router.get("/grouping-sessions/{session_id}")
async def get_my_grouping_session(session_id: str, principal: Principal = Depends(require_student)) -> dict[str, Any]:
    session = {
        "id": session_id,
        "name": "Capstar Team Formation - Fall 2026",
        "class_section_id": "sec-se1701",
        "mode": "HYBRID",
        "status": "OPEN",
        "team_min_size": 4,
        "team_max_size": 5
    }
    return {"data": session}

