"""Student profile routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from ..domain.models import Student, Skill
from ..repositories import StudentRepository
from .deps import Principal, get_student_repo, require_role

router = APIRouter(prefix="/v1/profiles", tags=["profile"])


class SkillIn(BaseModel):
    name: str
    proficiency: int


class ProfileIn(BaseModel):
    name: str
    major: str
    experience_years: float
    desired_role: str
    availability: list[str]
    skills: list[SkillIn]


@router.put("/me")
async def update_my_profile(
    body: ProfileIn,
    principal: Principal = Depends(require_role("student", "admin")),
    students: StudentRepository = Depends(get_student_repo),
) -> dict:
    student = Student(
        id=principal.user_id,
        name=body.name,
        major=body.major,
        experience_years=body.experience_years,
        desired_role=body.desired_role,
        availability=frozenset(body.availability),
        skills=[Skill(s.name, s.proficiency) for s in body.skills]
    )
    students.save(student)
    return {"status": "ok"}


@router.get("/me")
async def get_my_profile(
    principal: Principal = Depends(require_role("student", "admin")),
    students: StudentRepository = Depends(get_student_repo),
) -> dict:
    student = students.get(principal.user_id)
    if not student:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "profile not found")
        
    return {
        "id": student.id,
        "name": student.name,
        "major": student.major,
        "experience_years": student.experience_years,
        "desired_role": student.desired_role,
        "availability": list(student.availability),
        "skills": [{"name": s.name, "proficiency": s.proficiency} for s in student.skills]
    }
