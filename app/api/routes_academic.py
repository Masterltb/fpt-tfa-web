"""Academic Catalogs & Sections API Router (Agent Role: Senior Backend).

Implements Campuses, Terms, Majors, Courses, Skills, Class Sections, and Roster Import endpoints.
RFC 7807 compliance & RBAC enforced (docs/rbac.md & docs/api-contract.md).
"""
from __future__ import annotations

import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from pydantic import BaseModel

from app.api.deps import Principal, require_admin, require_student, require_lecturer
from app.services.csv_importer import parse_csv_roster

router = APIRouter(prefix="/api/v1", tags=["Academic Catalogs & Sections"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class MajorPayload(BaseModel):
    code: str
    name: str
    program_id: str = ""


class SkillCatalogPayload(BaseModel):
    name: str
    category: str = "technical"


_campuses_db = [
    {"id": "camp-hcm", "code": "HCM", "name": "FPT Campus TP.HCM", "is_active": True},
    {"id": "camp-hn", "code": "HN", "name": "FPT Campus Ha Noi", "is_active": True},
    {"id": "camp-dn", "code": "DN", "name": "FPT Campus Da Nang", "is_active": True},
]

_terms_db = [
    {"id": "term-fall26", "campus_id": "camp-hcm", "name": "Fall 2026", "status": "ACTIVE"}
]

_majors_db = [
    {"id": "maj-se", "code": "SE", "name": "Software Engineering"},
    {"id": "maj-ia", "code": "IA", "name": "Information Assurance"},
    {"id": "maj-ai", "code": "AI", "name": "Artificial Intelligence"},
]

_courses_db = [
    {"id": "crs-prn232", "code": "PRN232", "name": "C# & .NET Enterprise Applications"},
    {"id": "crs-exe101", "code": "EXE101", "name": "Experiential Entrepreneurship"},
]

_skills_db = [
    {"id": "skl-1", "name": "Python", "category": "backend"},
    {"id": "skl-2", "name": "React", "category": "frontend"},
    {"id": "skl-3", "name": "PostgreSQL", "category": "database"},
    {"id": "skl-4", "name": "Figma", "category": "design"},
]

_sections_db = [
    {
        "id": "sec-se1701",
        "term_id": "term-fall26",
        "course_id": "crs-prn232",
        "lecturer_id": "lec-001",
        "code": "SE1701",
        "capacity": 40,
        "status": "ACTIVE",
        "students_count": 35
    }
]

_team_roles_db = [
    {"id": "rol-1", "name": "Frontend Lead", "description": "Responsible for UI/UX implementation"},
    {"id": "rol-2", "name": "Backend Lead", "description": "Responsible for APIs and database"},
    {"id": "rol-3", "name": "QA Lead", "description": "Responsible for test automation and quality"}
]



# ---------------------------------------------------------------------------
# Catalog Endpoints
# ---------------------------------------------------------------------------

@router.get("/campuses")
async def list_campuses() -> dict[str, Any]:
    return {"data": _campuses_db}


@router.post("/campuses", status_code=status.HTTP_201_CREATED)
async def create_campus(payload: dict[str, Any], _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    cid = f"camp-{uuid.uuid4().hex[:6]}"
    item = {"id": cid, **payload}
    _campuses_db.append(item)
    return {"data": item}


@router.get("/terms")
async def list_terms() -> dict[str, Any]:
    return {"data": _terms_db}


@router.post("/terms/{term_id}/activate")
async def activate_term(term_id: str, _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    term = next((t for t in _terms_db if t["id"] == term_id), None)
    if not term:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Term not found")
    term["status"] = "ACTIVE"
    return {"data": term}


@router.get("/majors")
async def list_majors() -> dict[str, Any]:
    return {"data": _majors_db}


@router.post("/majors", status_code=status.HTTP_201_CREATED)
async def create_major(payload: MajorPayload, _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    mid = f"maj-{uuid.uuid4().hex[:6]}"
    item = {"id": mid, **payload.model_dump()}
    _majors_db.append(item)
    return {"data": item}


@router.get("/courses")
async def list_courses() -> dict[str, Any]:
    return {"data": _courses_db}


@router.get("/skills")
async def list_skills() -> dict[str, Any]:
    return {"data": _skills_db}


@router.post("/skills", status_code=status.HTTP_201_CREATED)
async def create_skill(payload: SkillCatalogPayload, _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    skid = f"skl-{uuid.uuid4().hex[:6]}"
    item = {"id": skid, **payload.model_dump()}
    _skills_db.append(item)
    return {"data": item}


# ---------------------------------------------------------------------------
# Section Endpoints
# ---------------------------------------------------------------------------

@router.get("/sections")
async def list_sections() -> dict[str, Any]:
    return {"data": _sections_db}


@router.get("/lecturers/me/sections")
async def list_my_lecturer_sections(principal: Principal = Depends(require_lecturer)) -> dict[str, Any]:
    sections = [
        {
            "id": "sec_se1801_swe201c",
            "sectionCode": "SE1801",
            "courseCode": "SWE201c",
            "courseName": "Introduction to Software Engineering",
            "termId": "term_fall2026",
            "lecturerId": principal.user_id,
            "lecturerName": "TS. Nguyễn Văn Hùng",
            "studentCount": 36,
            "dnaCompletionRate": 92,
            "activeSessionId": "sess_01_se1801",
            "activeSessionStatus": "REVIEW",
            "activeGroupingMode": "HYBRID",
        },
        {
            "id": "sec_se1802_prj301",
            "sectionCode": "SE1802",
            "courseCode": "PRJ301",
            "courseName": "Java Web Application Development",
            "termId": "term_fall2026",
            "lecturerId": principal.user_id,
            "lecturerName": "TS. Nguyễn Văn Hùng",
            "studentCount": 32,
            "dnaCompletionRate": 88,
            "activeSessionId": "sess_02_se1802",
            "activeSessionStatus": "OPEN",
            "activeGroupingMode": "LECTURER_LED",
        },
        {
            "id": "sec_se1803_swp391",
            "sectionCode": "SE1803",
            "courseCode": "SWP391",
            "courseName": "Application Development Project",
            "termId": "term_fall2026",
            "lecturerId": principal.user_id,
            "lecturerName": "TS. Nguyễn Văn Hùng",
            "studentCount": 40,
            "dnaCompletionRate": 75,
            "activeSessionStatus": "DRAFT",
        },
    ]
    return {"data": sections}


@router.get("/students/me/sections")
async def list_my_student_sections(principal: Principal = Depends(require_student)) -> dict[str, Any]:
    sections = [
        {
            "id": "sec_se1801_swe201c",
            "sectionCode": "SE1801",
            "courseCode": "SWE201c",
            "courseName": "Introduction to Software Engineering",
            "termId": "term_fall2026",
            "lecturerId": "lec_01",
            "lecturerName": "TS. Nguyễn Văn Hùng",
            "studentCount": 36,
            "dnaCompletionRate": 92,
            "activeSessionId": "sess_01_se1801",
            "activeSessionStatus": "OPEN",
            "activeGroupingMode": "HYBRID",
        },
    ]
    return {"data": sections}


@router.get("/sections/{section_id}/students")
async def get_section_students(
    section_id: str,
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    students = [
        {"id": "stu-001", "student_code": "SE170001", "name": "Nguyen Van A", "email": "anv@fpt.edu.vn", "major": "SE"},
        {"id": "stu-002", "student_code": "SE170002", "name": "Tran Thi B", "email": "btt@fpt.edu.vn", "major": "SE"},
        {"id": "stu-003", "student_code": "SE170003", "name": "Le Van C", "email": "clv@fpt.edu.vn", "major": "IA"},
        {"id": "stu-004", "student_code": "SE170004", "name": "Pham Van D", "email": "dpv@fpt.edu.vn", "major": "AI"},
    ]
    return {"data": students, "meta": {"total": len(students)}}


@router.post("/sections/{section_id}/students/import")
async def import_section_students(
    section_id: str,
    file: UploadFile = File(...),
    _admin: Principal = Depends(require_admin)
) -> dict[str, Any]:
    content = await file.read()
    summary = parse_csv_roster(content)
    return {"data": summary.model_dump()}


@router.get("/campuses/{campus_id}")
async def get_campus(campus_id: str) -> dict[str, Any]:
    item = next((c for c in _campuses_db if c["id"] == campus_id), None)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campus not found")
    return {"data": item}


@router.patch("/campuses/{campus_id}")
async def update_campus(campus_id: str, payload: dict[str, Any], _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    item = next((c for c in _campuses_db if c["id"] == campus_id), None)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campus not found")
    item.update(payload)
    return {"data": item}


@router.delete("/campuses/{campus_id}")
async def delete_campus(campus_id: str, _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    global _campuses_db
    _campuses_db = [c for c in _campuses_db if c["id"] != campus_id]
    return {"data": {"message": "Campus deleted"}}


@router.post("/terms", status_code=status.HTTP_201_CREATED)
async def create_term(payload: dict[str, Any], _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    tid = f"term-{uuid.uuid4().hex[:6]}"
    item = {"id": tid, "status": "PLANNED", **payload}
    _terms_db.append(item)
    return {"data": item}


@router.get("/terms/{term_id}")
async def get_term(term_id: str) -> dict[str, Any]:
    item = next((t for t in _terms_db if t["id"] == term_id), None)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Term not found")
    return {"data": item}


@router.patch("/terms/{term_id}")
async def update_term(term_id: str, payload: dict[str, Any], _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    item = next((t for t in _terms_db if t["id"] == term_id), None)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Term not found")
    item.update(payload)
    return {"data": item}


@router.delete("/terms/{term_id}")
async def delete_term(term_id: str, _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    global _terms_db
    _terms_db = [t for t in _terms_db if t["id"] != term_id]
    return {"data": {"message": "Term deleted"}}


@router.get("/majors/{major_id}")
async def get_major(major_id: str) -> dict[str, Any]:
    item = next((m for m in _majors_db if m["id"] == major_id), None)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Major not found")
    return {"data": item}


@router.patch("/majors/{major_id}")
async def update_major(major_id: str, payload: dict[str, Any], _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    item = next((m for m in _majors_db if m["id"] == major_id), None)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Major not found")
    item.update(payload)
    return {"data": item}


@router.delete("/majors/{major_id}")
async def delete_major(major_id: str, _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    global _majors_db
    _majors_db = [m for m in _majors_db if m["id"] != major_id]
    return {"data": {"message": "Major deleted"}}


@router.post("/courses", status_code=status.HTTP_201_CREATED)
async def create_course(payload: dict[str, Any], _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    cid = f"crs-{uuid.uuid4().hex[:6]}"
    item = {"id": cid, **payload}
    _courses_db.append(item)
    return {"data": item}


@router.get("/courses/{course_id}")
async def get_course(course_id: str) -> dict[str, Any]:
    item = next((c for c in _courses_db if c["id"] == course_id), None)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return {"data": item}


@router.patch("/courses/{course_id}")
async def update_course(course_id: str, payload: dict[str, Any], _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    item = next((c for c in _courses_db if c["id"] == course_id), None)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    item.update(payload)
    return {"data": item}


@router.delete("/courses/{course_id}")
async def delete_course(course_id: str, _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    global _courses_db
    _courses_db = [c for c in _courses_db if c["id"] != course_id]
    return {"data": {"message": "Course deleted"}}


@router.get("/skills/{skill_id}")
async def get_skill(skill_id: str) -> dict[str, Any]:
    item = next((s for s in _skills_db if s["id"] == skill_id), None)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    return {"data": item}


@router.patch("/skills/{skill_id}")
async def update_skill(skill_id: str, payload: dict[str, Any], _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    item = next((s for s in _skills_db if s["id"] == skill_id), None)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    item.update(payload)
    return {"data": item}


@router.get("/team-roles")
async def list_team_roles() -> dict[str, Any]:
    return {"data": _team_roles_db}


@router.post("/team-roles", status_code=status.HTTP_201_CREATED)
async def create_team_role(payload: dict[str, Any], _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    rid = f"rol-{uuid.uuid4().hex[:6]}"
    item = {"id": rid, **payload}
    _team_roles_db.append(item)
    return {"data": item}


@router.get("/team-roles/{role_id}")
async def get_team_role(role_id: str) -> dict[str, Any]:
    item = next((r for r in _team_roles_db if r["id"] == role_id), None)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team role not found")
    return {"data": item}


@router.patch("/team-roles/{role_id}")
async def update_team_role(role_id: str, payload: dict[str, Any], _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    item = next((r for r in _team_roles_db if r["id"] == role_id), None)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team role not found")
    item.update(payload)
    return {"data": item}


@router.post("/sections", status_code=status.HTTP_201_CREATED)
async def create_section(payload: dict[str, Any], _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    sid = f"sec-{uuid.uuid4().hex[:6]}"
    item = {"id": sid, "status": "ACTIVE", **payload}
    _sections_db.append(item)
    return {"data": item}


@router.get("/sections/{section_id}")
async def get_section(section_id: str) -> dict[str, Any]:
    item = next((s for s in _sections_db if s["id"] == section_id), None)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    return {"data": item}


@router.patch("/sections/{section_id}")
async def update_section(section_id: str, payload: dict[str, Any], _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    item = next((s for s in _sections_db if s["id"] == section_id), None)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    item.update(payload)
    return {"data": item}


@router.delete("/sections/{section_id}")
async def delete_section(section_id: str, _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    global _sections_db
    _sections_db = [s for s in _sections_db if s["id"] != section_id]
    return {"data": {"message": "Section deleted"}}


@router.get("/sections/{section_id}/lecturers")
async def get_section_lecturers(section_id: str) -> dict[str, Any]:
    lecs = [{"id": "lec-001", "name": "Dr. Le Van A", "email": "lecturer@fpt.edu.vn"}]
    return {"data": lecs, "meta": {"total": len(lecs)}}


@router.post("/sections/{section_id}/lecturers")
async def assign_section_lecturer(section_id: str, payload: dict[str, Any], _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    return {"data": {"section_id": section_id, "lecturer_id": payload.get("lecturer_id")}}


@router.delete("/sections/{section_id}/lecturers/{lecturer_id}")
async def remove_section_lecturer(section_id: str, lecturer_id: str, _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    return {"data": {"message": "Lecturer removed from section"}}


@router.post("/sections/{section_id}/students")
async def add_section_student(section_id: str, payload: dict[str, Any], _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    return {"data": {"section_id": section_id, "student_id": payload.get("student_id")}}


@router.delete("/sections/{section_id}/students/{student_id}")
async def remove_section_student(section_id: str, student_id: str, _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    return {"data": {"message": "Student removed from section"}}


@router.get("/sections/{section_id}/timetable")
async def get_section_timetable(section_id: str) -> dict[str, Any]:
    tt = [{"day_of_week": "MONDAY", "slot": 1, "room": "BE-401"}]
    return {"data": tt}


@router.put("/sections/{section_id}/timetable")
async def put_section_timetable(section_id: str, payload: dict[str, Any], _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    return {"data": payload.get("timetable", [])}

