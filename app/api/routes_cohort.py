"""Cohort management routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import uuid

from ..domain.models import Cohort, Constraint
from ..repositories import CohortRepository, StudentRepository
from .deps import Principal, get_cohort_repo, get_student_repo, require_role

router = APIRouter(prefix="/v1/cohorts", tags=["cohort"])


class CreateCohortIn(BaseModel):
    name: str


@router.get("")
async def list_cohorts(
    principal: Principal = Depends(require_role("lecturer", "student")),
    cohorts: CohortRepository = Depends(get_cohort_repo),
) -> dict:
    """List cohorts owned by the currently authenticated lecturer, or all cohorts for students."""
    if principal.role == "lecturer":
        owner_cohorts = cohorts.get_cohorts_by_owner(principal.user_id)
    else:
        # For simplicity in this demo, students can see all cohorts to enroll in.
        # In a real app, this would be `get_all_cohorts()` or `get_enrolled_cohorts()`.
        owner_cohorts = getattr(cohorts, "get_all_cohorts", lambda: cohorts.get_cohorts_by_owner("lec1"))()
    return {
        "cohorts": [
            {"id": c.id, "name": c.name, "owner_id": c.owner_id}
            for c in owner_cohorts
        ]
    }


@router.post("")
async def create_cohort(
    body: CreateCohortIn,
    principal: Principal = Depends(require_role("lecturer")),
    cohorts: CohortRepository = Depends(get_cohort_repo),
) -> dict:
    """Create a new cohort for the lecturer."""
    cohort_id = str(uuid.uuid4())
    cohort = Cohort(id=cohort_id, owner_id=principal.user_id, name=body.name)
    cohorts.add(cohort)
    return {"id": cohort.id, "name": cohort.name, "owner_id": cohort.owner_id}


@router.post("/{cohort_id}/enroll")
async def enroll_student(
    cohort_id: str,
    principal: Principal = Depends(require_role("student", "admin")),
    cohorts: CohortRepository = Depends(get_cohort_repo),
) -> dict:
    """Student enrolls in a cohort."""
    cohort = cohorts.get(cohort_id)
    if not cohort:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "cohort not found")
        
    cohorts.enroll_student(cohort_id, principal.user_id)
    return {"status": "ok"}


@router.get("/{cohort_id}/students")
async def get_enrolled_students(
    cohort_id: str,
    principal: Principal = Depends(require_role("lecturer", "student")),
    cohorts: CohortRepository = Depends(get_cohort_repo),
    students: StudentRepository = Depends(get_student_repo),
) -> dict:
    """Lecturer gets all students in a cohort, or students get their peers."""
    cohort = cohorts.get(cohort_id)
    if not cohort:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "cohort not found")
    if principal.role == "lecturer" and cohort.owner_id != principal.user_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "not the cohort owner")
        
    enrolled = cohorts.get_enrolled_students(cohort_id, students)
    
    return {
        "students": [
            {
                "id": s.id,
                "name": s.name,
                "major": s.major,
                "experience_years": s.experience_years,
                "desired_role": s.desired_role,
                "availability": list(s.availability),
                "skills": [{"name": k.name, "proficiency": k.proficiency} for k in s.skills]
            }
            for s in enrolled
        ]
    }


class CreateConstraintIn(BaseModel):
    type: str
    target_student_id: str

@router.post("/{cohort_id}/constraints")
async def create_constraint(
    cohort_id: str,
    body: CreateConstraintIn,
    principal: Principal = Depends(require_role("student")),
    cohorts: CohortRepository = Depends(get_cohort_repo),
) -> dict:
    """Student creates a constraint."""
    cohort = cohorts.get(cohort_id)
    if not cohort:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "cohort not found")
        
    c = Constraint(
        id=str(uuid.uuid4()),
        cohort_id=cohort_id,
        type=body.type,
        student_a=principal.user_id,
        student_b=body.target_student_id,
        status="pending"
    )
    cohorts.add_constraint(c)
    return {"id": c.id}


@router.get("/{cohort_id}/constraints")
async def get_constraints(
    cohort_id: str,
    principal: Principal = Depends(require_role("lecturer", "student")),
    cohorts: CohortRepository = Depends(get_cohort_repo),
) -> dict:
    """Get constraints for a cohort. Lecturers see all, students see their own."""
    cohort = cohorts.get(cohort_id)
    if not cohort:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "cohort not found")
        
    if principal.role == "lecturer" and cohort.owner_id != principal.user_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "not the cohort owner")
        
    all_c = cohorts.get_cohort_constraints(cohort_id)
    
    if principal.role == "student":
        all_c = [c for c in all_c if c.student_a == principal.user_id]
        
    return {
        "constraints": [
            {
                "id": c.id,
                "type": c.type,
                "student_a": c.student_a,
                "student_b": c.student_b,
                "status": c.status
            }
            for c in all_c
        ]
    }


class UpdateConstraintStatusIn(BaseModel):
    status: str

@router.put("/{cohort_id}/constraints/{constraint_id}/status")
async def update_constraint_status(
    cohort_id: str,
    constraint_id: str,
    body: UpdateConstraintStatusIn,
    principal: Principal = Depends(require_role("lecturer")),
    cohorts: CohortRepository = Depends(get_cohort_repo),
) -> dict:
    """Lecturer approves or rejects a constraint."""
    cohort = cohorts.get(cohort_id)
    if not cohort or cohort.owner_id != principal.user_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "not the cohort owner")
        
    if body.status not in ["approved", "rejected", "pending"]:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "invalid status")
        
    cohorts.update_constraint_status(cohort_id, constraint_id, body.status)
    return {"status": "ok"}
