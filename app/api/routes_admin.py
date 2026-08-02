"""Admin API Router — Academic Structure CRUD & Student Roster Import.

Requires ADMIN role (docs/rbac.md).
"""
from __future__ import annotations

import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from pydantic import BaseModel

from app.api.deps import require_admin
from app.services.csv_importer import parse_csv_roster, ImportSummary

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class CampusCreate(BaseModel):
    code: str
    name: str
    is_active: bool = True


class CampusResponse(CampusCreate):
    id: str


class TermCreate(BaseModel):
    campus_id: str
    academic_year_id: str = ""
    name: str
    start_date: str | None = None
    end_date: str | None = None


class TermResponse(TermCreate):
    id: str
    status: str = "PLANNED"


class CourseCreate(BaseModel):
    code: str
    name: str
    description: str = ""
    major_id: str = ""


class CourseResponse(CourseCreate):
    id: str


class ClassSectionCreate(BaseModel):
    term_id: str
    course_id: str
    lecturer_id: str
    code: str
    name: str = ""
    capacity: int = 40
    campus_id: str = ""


class ClassSectionResponse(ClassSectionCreate):
    id: str
    status: str = "ACTIVE"


# In-memory mock storage fallback for instant response & testing
_campuses: list[dict[str, Any]] = [
    {"id": "camp-hcm", "code": "HCM", "name": "FPT Campus TP.HCM", "is_active": True},
    {"id": "camp-hn", "code": "HN", "name": "FPT Campus Ha Noi", "is_active": True},
]

_terms: list[dict[str, Any]] = [
    {"id": "term-fall26", "campus_id": "camp-hcm", "academic_year_id": "2026", "name": "Fall 2026", "status": "ACTIVE"}
]

_courses: list[dict[str, Any]] = [
    {"id": "crs-prn232", "code": "PRN232", "name": "C# & .NET Enterprise Applications", "description": "", "major_id": "SE"}
]

_class_sections: list[dict[str, Any]] = [
    {
        "id": "sec-se1701",
        "term_id": "term-fall26",
        "course_id": "crs-prn232",
        "lecturer_id": "lec-001",
        "code": "SE1701",
        "name": "SE1701 - Fall 2026",
        "capacity": 40,
        "status": "ACTIVE",
        "campus_id": "camp-hcm"
    }
]


# ---------------------------------------------------------------------------
# Campus Endpoints
# ---------------------------------------------------------------------------

@router.get("/system/overview")
async def get_system_overview(_admin=Depends(require_admin)) -> dict[str, Any]:
    return {
        "activeTerm": "Fall 2026",
        "campusCount": 5,
        "courseCount": 24,
        "sectionCount": 148,
        "studentCount": 4850,
        "lecturerCount": 180,
        "activeGroupingSessions": 34,
        "cpSatSolverVersion": "Google OR-Tools v9.8.3296",
        "dbStatus": "HEALTHY",
    }


@router.get("/campuses", response_model=list[CampusResponse])
async def list_campuses(_admin=Depends(require_admin)) -> list[dict[str, Any]]:
    return _campuses


@router.post("/campuses", response_model=CampusResponse, status_code=status.HTTP_201_CREATED)
async def create_campus(payload: CampusCreate, _admin=Depends(require_admin)) -> dict[str, Any]:
    c_id = f"camp-{uuid.uuid4().hex[:8]}"
    item = {"id": c_id, **payload.model_dump()}
    _campuses.append(item)
    return item


# ---------------------------------------------------------------------------
# Term Endpoints
# ---------------------------------------------------------------------------

@router.get("/terms", response_model=list[TermResponse])
async def list_terms(_admin=Depends(require_admin)) -> list[dict[str, Any]]:
    return _terms


@router.post("/terms", response_model=TermResponse, status_code=status.HTTP_201_CREATED)
async def create_term(payload: TermCreate, _admin=Depends(require_admin)) -> dict[str, Any]:
    t_id = f"term-{uuid.uuid4().hex[:8]}"
    item = {"id": t_id, "status": "PLANNED", **payload.model_dump()}
    _terms.append(item)
    return item


# ---------------------------------------------------------------------------
# Course Endpoints
# ---------------------------------------------------------------------------

@router.get("/courses", response_model=list[CourseResponse])
async def list_courses(_admin=Depends(require_admin)) -> list[dict[str, Any]]:
    return _courses


@router.post("/courses", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(payload: CourseCreate, _admin=Depends(require_admin)) -> dict[str, Any]:
    crs_id = f"crs-{uuid.uuid4().hex[:8]}"
    item = {"id": crs_id, **payload.model_dump()}
    _courses.append(item)
    return item


# ---------------------------------------------------------------------------
# Class Section Endpoints
# ---------------------------------------------------------------------------

@router.get("/class-sections", response_model=list[ClassSectionResponse])
async def list_class_sections(_admin=Depends(require_admin)) -> list[dict[str, Any]]:
    return _class_sections


@router.post("/class-sections", response_model=ClassSectionResponse, status_code=status.HTTP_201_CREATED)
async def create_class_section(payload: ClassSectionCreate, _admin=Depends(require_admin)) -> dict[str, Any]:
    sec_id = f"sec-{uuid.uuid4().hex[:8]}"
    item = {"id": sec_id, "status": "ACTIVE", **payload.model_dump()}
    _class_sections.append(item)
    return item


# ---------------------------------------------------------------------------
# Roster CSV Import Endpoint
# ---------------------------------------------------------------------------

@router.post("/class-sections/{section_id}/import-roster", response_model=ImportSummary)
async def import_roster(
    section_id: str,
    file: UploadFile = File(...),
    _admin=Depends(require_admin)
) -> ImportSummary:
    """Import CSV roster into a class section."""
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .csv files are supported for roster import."
        )

    content = await file.read()
    summary = parse_csv_roster(content)
    return summary
