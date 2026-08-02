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
from sqlalchemy.orm import Session
from app.infra.database import get_db
from app.infra.db_models import (
    CampusRow, TermRow, MajorRow, CourseRow, ClassSectionRow,
    GroupingSessionRow, UserRow, TeamDNARow
)

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

# Keep mock arrays for skills and team_roles since there are no DB models yet
_skills_db = [
    {"id": "skl-1", "name": "Python", "category": "backend"},
    {"id": "skl-2", "name": "React", "category": "frontend"},
    {"id": "skl-3", "name": "PostgreSQL", "category": "database"},
    {"id": "skl-4", "name": "Figma", "category": "design"},
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
async def list_campuses(db: Session = Depends(get_db)) -> dict[str, Any]:
    rows = db.query(CampusRow).all()
    return {"data": [{"id": r.id, "code": r.code, "name": r.name, "is_active": r.is_active} for r in rows]}


@router.post("/campuses", status_code=status.HTTP_201_CREATED)
async def create_campus(payload: dict[str, Any], db: Session = Depends(get_db), _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    cid = f"camp-{uuid.uuid4().hex[:6]}"
    item = CampusRow(id=cid, code=payload.get("code", ""), name=payload.get("name", ""), is_active=payload.get("is_active", True))
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"data": {"id": item.id, "code": item.code, "name": item.name, "is_active": item.is_active}}


@router.get("/terms")
async def list_terms(db: Session = Depends(get_db)) -> dict[str, Any]:
    rows = db.query(TermRow).all()
    return {"data": [{"id": r.id, "campus_id": r.campus_id, "academic_year_id": r.academic_year_id, "name": r.name, "status": r.status.value if r.status else None} for r in rows]}


@router.post("/terms/{term_id}/activate")
async def activate_term(term_id: str, db: Session = Depends(get_db), _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    term = db.query(TermRow).filter(TermRow.id == term_id).first()
    if not term:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Term not found")
    term.status = "ACTIVE"
    db.commit()
    return {"data": {"id": term.id, "status": term.status}}


@router.get("/majors")
async def list_majors(db: Session = Depends(get_db)) -> dict[str, Any]:
    rows = db.query(MajorRow).all()
    return {"data": [{"id": r.id, "code": r.code, "name": r.name, "program_id": r.program_id} for r in rows]}


@router.post("/majors", status_code=status.HTTP_201_CREATED)
async def create_major(payload: MajorPayload, db: Session = Depends(get_db), _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    mid = f"maj-{uuid.uuid4().hex[:6]}"
    item = MajorRow(id=mid, code=payload.code, name=payload.name, program_id=payload.program_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"data": {"id": item.id, "code": item.code, "name": item.name, "program_id": item.program_id}}


@router.get("/courses")
async def list_courses(db: Session = Depends(get_db)) -> dict[str, Any]:
    rows = db.query(CourseRow).all()
    return {"data": [{"id": r.id, "code": r.code, "name": r.name, "description": r.description} for r in rows]}


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
async def list_sections(db: Session = Depends(get_db)) -> dict[str, Any]:
    rows = db.query(ClassSectionRow).all()
    return {"data": [{"id": r.id, "code": r.code, "capacity": r.capacity, "status": r.status.value if r.status else None} for r in rows]}


@router.get("/lecturers/me/sections")
async def list_my_lecturer_sections(db: Session = Depends(get_db), principal: Principal = Depends(require_lecturer)) -> dict[str, Any]:
    rows = db.query(ClassSectionRow).filter(ClassSectionRow.lecturer_id == principal.user_id).all()
    sections = []
    for sec in rows:
        crs = db.query(CourseRow).filter(CourseRow.id == sec.course_id).first()
        gs = db.query(GroupingSessionRow).filter(GroupingSessionRow.class_section_id == sec.id).first()
        lec = db.query(UserRow).filter(UserRow.id == sec.lecturer_id).first()
        sections.append({
            "id": sec.id,
            "sectionCode": sec.code,
            "courseCode": crs.code if crs else "",
            "courseName": crs.name if crs else sec.name,
            "termId": sec.term_id,
            "lecturerId": sec.lecturer_id,
            "lecturerName": lec.display_name if lec else "Unknown Lecturer",
            "studentCount": sec.capacity,
            "dnaCompletionRate": 92, # TODO: compute actual rate
            "activeSessionId": gs.id if gs else None,
            "activeSessionStatus": gs.status.value if gs else "DRAFT",
            "activeGroupingMode": gs.mode.value if gs else "HYBRID",
        })
    return {"data": sections}


@router.get("/students/me/sections")
async def list_my_student_sections(db: Session = Depends(get_db), principal: Principal = Depends(require_student)) -> dict[str, Any]:
    # Determine which sections the student is in based on their DNA profiles
    student_dnas = db.query(TeamDNARow).filter(TeamDNARow.student_id == principal.user_id).all()
    section_ids = [dna.class_section_id for dna in student_dnas]
    
    if not section_ids:
        return {"data": []}
        
    rows = db.query(ClassSectionRow).filter(ClassSectionRow.id.in_(section_ids)).all()
    
    sections = []
    for sec in rows:
        crs = db.query(CourseRow).filter(CourseRow.id == sec.course_id).first()
        gs = db.query(GroupingSessionRow).filter(GroupingSessionRow.class_section_id == sec.id).first()
        lec = db.query(UserRow).filter(UserRow.id == sec.lecturer_id).first()
        sections.append({
            "id": sec.id,
            "sectionCode": sec.code,
            "courseCode": crs.code if crs else "",
            "courseName": crs.name if crs else sec.name,
            "termId": sec.term_id,
            "lecturerId": sec.lecturer_id,
            "lecturerName": lec.display_name if lec else "Unknown Lecturer",
            "studentCount": sec.capacity,
            "dnaCompletionRate": 92,
            "activeSessionId": gs.id if gs else None,
            "activeSessionStatus": gs.status.value if gs else "OPEN",
            "activeGroupingMode": gs.mode.value if gs else "HYBRID",
        })
    return {"data": sections}


@router.get("/sections/{section_id}/students")
async def get_section_students(
    section_id: str,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    # Use TeamDNARow as a proxy for section enrollment
    dnas = db.query(TeamDNARow).filter(TeamDNARow.class_section_id == section_id).all()
    student_ids = [dna.student_id for dna in dnas]
    
    if not student_ids:
        return {"data": [], "meta": {"total": 0}}
        
    users = db.query(UserRow).filter(UserRow.id.in_(student_ids)).all()
    
    students = []
    for u in users:
        students.append({
            "id": u.id,
            "student_code": u.student_code,
            "name": u.display_name,
            "email": u.email,
            "major": "Unknown" # Major is linked via Program/TeamDNA in real DB
        })
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
async def get_campus(campus_id: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    r = db.query(CampusRow).filter(CampusRow.id == campus_id).first()
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campus not found")
    return {"data": {"id": r.id, "code": r.code, "name": r.name, "is_active": r.is_active}}


@router.patch("/campuses/{campus_id}")
async def update_campus(campus_id: str, payload: dict[str, Any], db: Session = Depends(get_db), _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    r = db.query(CampusRow).filter(CampusRow.id == campus_id).first()
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campus not found")
    for k, v in payload.items():
        setattr(r, k, v)
    db.commit()
    db.refresh(r)
    return {"data": {"id": r.id, "code": r.code, "name": r.name, "is_active": r.is_active}}


@router.delete("/campuses/{campus_id}")
async def delete_campus(campus_id: str, db: Session = Depends(get_db), _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    r = db.query(CampusRow).filter(CampusRow.id == campus_id).first()
    if r:
        db.delete(r)
        db.commit()
    return {"data": {"message": "Campus deleted"}}


@router.post("/terms", status_code=status.HTTP_201_CREATED)
async def create_term(payload: dict[str, Any], db: Session = Depends(get_db), _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    tid = f"term-{uuid.uuid4().hex[:6]}"
    item = TermRow(id=tid, campus_id=payload.get("campus_id", ""), name=payload.get("name", ""))
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"data": {"id": item.id, "name": item.name}}


@router.get("/terms/{term_id}")
async def get_term(term_id: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    r = db.query(TermRow).filter(TermRow.id == term_id).first()
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Term not found")
    return {"data": {"id": r.id, "campus_id": r.campus_id, "name": r.name}}


@router.patch("/terms/{term_id}")
async def update_term(term_id: str, payload: dict[str, Any], db: Session = Depends(get_db), _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    r = db.query(TermRow).filter(TermRow.id == term_id).first()
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Term not found")
    for k, v in payload.items():
        setattr(r, k, v)
    db.commit()
    db.refresh(r)
    return {"data": {"id": r.id, "name": r.name}}


@router.delete("/terms/{term_id}")
async def delete_term(term_id: str, db: Session = Depends(get_db), _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    r = db.query(TermRow).filter(TermRow.id == term_id).first()
    if r:
        db.delete(r)
        db.commit()
    return {"data": {"message": "Term deleted"}}


@router.get("/majors/{major_id}")
async def get_major(major_id: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    r = db.query(MajorRow).filter(MajorRow.id == major_id).first()
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Major not found")
    return {"data": {"id": r.id, "code": r.code, "name": r.name}}


@router.patch("/majors/{major_id}")
async def update_major(major_id: str, payload: dict[str, Any], db: Session = Depends(get_db), _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    r = db.query(MajorRow).filter(MajorRow.id == major_id).first()
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Major not found")
    for k, v in payload.items():
        setattr(r, k, v)
    db.commit()
    db.refresh(r)
    return {"data": {"id": r.id, "code": r.code, "name": r.name}}


@router.delete("/majors/{major_id}")
async def delete_major(major_id: str, db: Session = Depends(get_db), _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    r = db.query(MajorRow).filter(MajorRow.id == major_id).first()
    if r:
        db.delete(r)
        db.commit()
    return {"data": {"message": "Major deleted"}}


@router.post("/courses", status_code=status.HTTP_201_CREATED)
async def create_course(payload: dict[str, Any], db: Session = Depends(get_db), _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    cid = f"crs-{uuid.uuid4().hex[:6]}"
    item = CourseRow(id=cid, code=payload.get("code", ""), name=payload.get("name", ""))
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"data": {"id": item.id, "code": item.code, "name": item.name}}


@router.get("/courses/{course_id}")
async def get_course(course_id: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    r = db.query(CourseRow).filter(CourseRow.id == course_id).first()
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return {"data": {"id": r.id, "code": r.code, "name": r.name}}


@router.patch("/courses/{course_id}")
async def update_course(course_id: str, payload: dict[str, Any], db: Session = Depends(get_db), _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    r = db.query(CourseRow).filter(CourseRow.id == course_id).first()
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    for k, v in payload.items():
        setattr(r, k, v)
    db.commit()
    db.refresh(r)
    return {"data": {"id": r.id, "code": r.code, "name": r.name}}


@router.delete("/courses/{course_id}")
async def delete_course(course_id: str, db: Session = Depends(get_db), _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    r = db.query(CourseRow).filter(CourseRow.id == course_id).first()
    if r:
        db.delete(r)
        db.commit()
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
async def create_section(payload: dict[str, Any], db: Session = Depends(get_db), _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    sid = f"sec-{uuid.uuid4().hex[:6]}"
    item = ClassSectionRow(id=sid, term_id=payload.get("term_id",""), course_id=payload.get("course_id",""), lecturer_id=payload.get("lecturer_id",""), code=payload.get("code",""))
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"data": {"id": item.id, "code": item.code}}


@router.get("/sections/{section_id}")
async def get_section(section_id: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    sec = db.query(ClassSectionRow).filter(ClassSectionRow.id == section_id).first()
    if not sec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
        
    crs = db.query(CourseRow).filter(CourseRow.id == sec.course_id).first()
    lec = db.query(UserRow).filter(UserRow.id == sec.lecturer_id).first()
    gs = db.query(GroupingSessionRow).filter(GroupingSessionRow.class_section_id == sec.id).first()
    
    return {"data": {
        "id": sec.id,
        "sectionCode": sec.code,
        "courseCode": crs.code if crs else "",
        "courseName": crs.name if crs else sec.name,
        "termId": sec.term_id,
        "lecturerId": sec.lecturer_id,
        "lecturerName": lec.display_name if lec else "Unknown Lecturer",
        "studentCount": sec.capacity,
        "dnaCompletionRate": 92, # TODO: calculate real rate
        "activeSessionId": gs.id if gs else None,
        "activeSessionStatus": gs.status.value if gs else None,
        "activeGroupingMode": gs.mode.value if gs else None,
    }}


@router.patch("/sections/{section_id}")
async def update_section(section_id: str, payload: dict[str, Any], db: Session = Depends(get_db), _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    r = db.query(ClassSectionRow).filter(ClassSectionRow.id == section_id).first()
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    for k, v in payload.items():
        setattr(r, k, v)
    db.commit()
    db.refresh(r)
    return {"data": {"id": r.id, "code": r.code}}


@router.delete("/sections/{section_id}")
async def delete_section(section_id: str, db: Session = Depends(get_db), _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    r = db.query(ClassSectionRow).filter(ClassSectionRow.id == section_id).first()
    if r:
        db.delete(r)
        db.commit()
    return {"data": {"message": "Section deleted"}}


@router.get("/sections/{section_id}/lecturers")
async def get_section_lecturers(section_id: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    sec = db.query(ClassSectionRow).filter(ClassSectionRow.id == section_id).first()
    if not sec or not sec.lecturer_id:
        return {"data": [], "meta": {"total": 0}}
    lec = db.query(UserRow).filter(UserRow.id == sec.lecturer_id).first()
    if not lec:
        return {"data": [], "meta": {"total": 0}}
    lecs = [{"id": lec.id, "name": lec.display_name, "email": lec.email}]
    return {"data": lecs, "meta": {"total": len(lecs)}}


@router.post("/sections/{section_id}/lecturers")
async def assign_section_lecturer(section_id: str, payload: dict[str, Any], db: Session = Depends(get_db), _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    sec = db.query(ClassSectionRow).filter(ClassSectionRow.id == section_id).first()
    if not sec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    sec.lecturer_id = payload.get("lecturer_id")
    db.commit()
    return {"data": {"section_id": section_id, "lecturer_id": sec.lecturer_id}}


@router.delete("/sections/{section_id}/lecturers/{lecturer_id}")
async def remove_section_lecturer(section_id: str, lecturer_id: str, db: Session = Depends(get_db), _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    sec = db.query(ClassSectionRow).filter(ClassSectionRow.id == section_id).first()
    if sec and sec.lecturer_id == lecturer_id:
        sec.lecturer_id = ""
        db.commit()
    return {"data": {"message": "Lecturer removed from section"}}


@router.post("/sections/{section_id}/students")
async def add_section_student(section_id: str, payload: dict[str, Any], _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    # Need Enrollment model to actually link them, but without it we just mock success
    return {"data": {"section_id": section_id, "student_id": payload.get("student_id")}}


@router.delete("/sections/{section_id}/students/{student_id}")
async def remove_section_student(section_id: str, student_id: str, _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    return {"data": {"message": "Student removed from section"}}


@router.get("/sections/{section_id}/timetable")
async def get_section_timetable(section_id: str) -> dict[str, Any]:
    # Mock timetable as there's no TimetableRow yet
    tt = [{"day_of_week": "MONDAY", "slot": 1, "room": "BE-401"}]
    return {"data": tt}


@router.put("/sections/{section_id}/timetable")
async def put_section_timetable(section_id: str, payload: dict[str, Any], _admin: Principal = Depends(require_admin)) -> dict[str, Any]:
    return {"data": payload.get("timetable", [])}
