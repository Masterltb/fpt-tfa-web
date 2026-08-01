"""Formation routes (scaffold). Requires FastAPI (install to run).

Maps the run-formation use case onto HTTP. Ownership check (lecturer owns the cohort) is a
TODO wired to the datastore in the next iteration (docs/rbac.md, BR-13). The route already
delegates to the engine interface, so swapping the mock for OR-Tools needs no route change.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status  # type: ignore[import-not-found]
from pydantic import BaseModel  # type: ignore[import-not-found]
import uuid
from datetime import datetime

from ..domain.models import Constraints, Project, Skill, Student, FormationRun, Team
from ..matching.engine import MatchingEngine
from ..repositories import CohortRepository
from .deps import Principal, get_cohort_repo, get_engine, require_role

router = APIRouter(prefix="/v1", tags=["formation"])


class SkillIn(BaseModel):
    name: str
    proficiency: int


class StudentIn(BaseModel):
    id: str
    name: str = ""
    major: str = ""
    experience_years: float = 0.0
    skills: list[SkillIn] = []
    availability: list[str] = []
    desired_role: str = "other"
    preferred_teammates: list[str] = []


class RunFormationIn(BaseModel):
    project_id: str
    min_size: int = 3
    max_size: int = 5
    students: list[StudentIn]
    must_pair: list[tuple[str, str]] = []
    cannot_pair: list[tuple[str, str]] = []
    seed: int = 0
    weights: dict[str, float] | None = None


@router.post("/cohorts/{cohort_id}/formations")
async def run_formation(
    cohort_id: str,
    body: RunFormationIn,
    principal: Principal = Depends(require_role("lecturer")),
    cohorts: CohortRepository = Depends(get_cohort_repo),
    engine: MatchingEngine = Depends(get_engine),
) -> dict:
    # Object-level authorization (BR-13, guards IDOR/BOLA): a lecturer may only run a
    # formation for a cohort they own.
    cohort = cohorts.get(cohort_id)
    if cohort is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "cohort not found")
    if cohort.owner_id != principal.user_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "not the cohort owner")

    students = [
        Student(
            id=s.id,
            name=s.name,
            major=s.major,
            experience_years=s.experience_years,
            skills=[Skill(k.name, k.proficiency) for k in s.skills],
            availability=frozenset(s.availability),
            desired_role=s.desired_role,
            preferred_teammates=frozenset(s.preferred_teammates),
        )
        for s in body.students
    ]
    project = Project(
        id=body.project_id, min_size=body.min_size, max_size=body.max_size, weights=body.weights or {}
    )
    cons = Constraints(must_pair=list(body.must_pair), cannot_pair=list(body.cannot_pair))
    formation = engine.form_teams(students, project, cons, seed=body.seed)

    run_id = str(uuid.uuid4())
    run_data = FormationRun(
        id=run_id,
        cohort_id=cohort_id,
        project_id=body.project_id,
        min_size=body.min_size,
        max_size=body.max_size,
        seed=body.seed,
        status=formation.status,
        balance=formation.balance,
        created_at=datetime.utcnow(),
        teams=formation.teams
    )
    cohorts.save_formation_run(run_data)
    cohorts.log_audit_event(cohort_id, principal.user_id, "run_formation", f"formation_id={run_id}")

    if formation.status == "infeasible":
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, {"conflicts": formation.conflicts})
        
    return {
        "id": run_id,
        "status": formation.status,
        "seed": formation.seed,
        "balance": formation.balance,
        "teams": [
            {"id": t.id, "members": t.member_ids, "scores": t.scores, "rationale": t.rationale}
            for t in formation.teams
        ],
        "unassignable": formation.unassignable,
    }

@router.get("/formations/{formation_id}")
async def get_formation(
    formation_id: str,
    principal: Principal = Depends(require_role("lecturer")),
    cohorts: CohortRepository = Depends(get_cohort_repo),
) -> dict:
    run = cohorts.get_formation_run(formation_id)
    if not run:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "formation run not found")
        
    cohort = cohorts.get(run.cohort_id)
    if not cohort or cohort.owner_id != principal.user_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "not the cohort owner")
        
    return {
        "id": run.id,
        "cohort_id": run.cohort_id,
        "status": run.status,
        "balance": run.balance,
        "teams": [
            {"id": t.id, "members": t.member_ids, "scores": t.scores, "rationale": t.rationale}
            for t in run.teams
        ]
    }

class OverrideTeamIn(BaseModel):
    id: str
    member_ids: list[str]
    name: str = ""
    rationale: str = ""

class OverrideFormationIn(BaseModel):
    teams: list[OverrideTeamIn]

@router.post("/formations/{formation_id}/override")
async def override_formation(
    formation_id: str,
    body: OverrideFormationIn,
    principal: Principal = Depends(require_role("lecturer")),
    cohorts: CohortRepository = Depends(get_cohort_repo),
) -> dict:
    run = cohorts.get_formation_run(formation_id)
    if not run:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "formation run not found")
        
    cohort = cohorts.get(run.cohort_id)
    if not cohort or cohort.owner_id != principal.user_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "not the cohort owner")
        
    teams = [Team(id=t.id, member_ids=t.member_ids, rationale=t.rationale) for t in body.teams]
    cohorts.update_formation_run_teams(formation_id, teams)
    cohorts.log_audit_event(run.cohort_id, principal.user_id, "save_override", f"formation_id={formation_id}")
    return {"status": "ok"}

@router.post("/formations/{formation_id}/commit")
async def commit_formation(
    formation_id: str,
    principal: Principal = Depends(require_role("lecturer")),
    cohorts: CohortRepository = Depends(get_cohort_repo),
) -> dict:
    run = cohorts.get_formation_run(formation_id)
    if not run:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "formation run not found")
        
    cohort = cohorts.get(run.cohort_id)
    if not cohort or cohort.owner_id != principal.user_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "not the cohort owner")
        
    cohorts.commit_formation_run(formation_id, principal.user_id)
    cohorts.log_audit_event(run.cohort_id, principal.user_id, "commit_teams", f"formation_id={formation_id}")
    return {"status": "ok"}

@router.get("/cohorts/{cohort_id}/constraints")
async def get_constraints(
    cohort_id: str,
    principal: Principal = Depends(require_role("lecturer")),
    cohorts: CohortRepository = Depends(get_cohort_repo),
) -> dict:
    cohort = cohorts.get(cohort_id)
    if not cohort or cohort.owner_id != principal.user_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "not the cohort owner")
        
    constraints = cohorts.get_cohort_constraints(cohort_id)
    return {
        "constraints": [
            {
                "id": c.id,
                "cohort_id": c.cohort_id,
                "type": c.type,
                "student_a": c.student_a,
                "student_b": c.student_b,
                "status": c.status
            } for c in constraints
        ]
    }

@router.post("/cohorts/{cohort_id}/constraints/{constraint_id}/approve")
async def approve_constraint(
    cohort_id: str,
    constraint_id: str,
    principal: Principal = Depends(require_role("lecturer")),
    cohorts: CohortRepository = Depends(get_cohort_repo),
) -> dict:
    cohort = cohorts.get(cohort_id)
    if not cohort or cohort.owner_id != principal.user_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "not the cohort owner")
        
    cohorts.update_constraint_status(cohort_id, constraint_id, "approved")
    cohorts.log_audit_event(cohort_id, principal.user_id, "approve_constraint", f"constraint_id={constraint_id}")
    return {"status": "ok"}

@router.post("/cohorts/{cohort_id}/constraints/{constraint_id}/reject")
async def reject_constraint(
    cohort_id: str,
    constraint_id: str,
    principal: Principal = Depends(require_role("lecturer")),
    cohorts: CohortRepository = Depends(get_cohort_repo),
) -> dict:
    cohort = cohorts.get(cohort_id)
    if not cohort or cohort.owner_id != principal.user_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "not the cohort owner")
        
    cohorts.update_constraint_status(cohort_id, constraint_id, "rejected")
    cohorts.log_audit_event(cohort_id, principal.user_id, "reject_constraint", f"constraint_id={constraint_id}")
    return {"status": "ok"}
