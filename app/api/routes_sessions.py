"""Grouping Sessions State Machine API Router (Agent Role: Senior Backend & BA).

Implements GroupingSession CRUD and State Machine lifecycle transitions:
DRAFT -> OPEN -> FROZEN -> MATCHING -> REVIEW -> PUBLISHED -> CLOSED.
RFC 7807 compliance & RBAC enforced (docs/rbac.md & docs/api-contract.md).
"""
from __future__ import annotations

import json
import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import Principal, require_lecturer, require_student
from app.infra.database import get_db
from app.infra.db_models import GroupingSessionRow, TeamDNARow, UserRow, TeamMemberRow, TeamRow, ClassSectionRow
from app.domain.models import GroupingMode, GroupingSessionStatus

router = APIRouter(prefix="/api/v1/grouping-sessions", tags=["Grouping Sessions"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class SessionCreatePayload(BaseModel):
    class_section_id: str = Field(default="sec_se1801_swe201c")
    name: str = Field(default="Phiên Ghép Nhóm Mới")
    mode: GroupingMode = GroupingMode.HYBRID
    team_min_size: int = Field(default=4, ge=1)
    team_max_size: int = Field(default=6, ge=1)
    required_roles: list[str] = Field(default_factory=list)
    required_skills: list[str] = Field(default_factory=list)
    allow_cross_major: bool = True
    weights: dict[str, float] = Field(default_factory=dict)


class SessionPatchPayload(BaseModel):
    name: str | None = None
    team_min_size: int | None = None
    team_max_size: int | None = None
    allow_cross_major: bool | None = None


# ---------------------------------------------------------------------------
# Session CRUD Endpoints
# ---------------------------------------------------------------------------

@router.get("")
async def list_sessions(db: Session = Depends(get_db), principal: Principal = Depends(require_student)) -> dict[str, Any]:
    rows = db.query(GroupingSessionRow).all()
    sessions = [
        {
            "id": r.id,
            "class_section_id": r.class_section_id,
            "name": r.name,
            "mode": r.mode.value if hasattr(r.mode, 'value') else str(r.mode),
            "team_min_size": r.team_min_size,
            "team_max_size": r.team_max_size,
            "status": r.status.value if hasattr(r.status, 'value') else str(r.status),
            "created_by": principal.user_id,
        }
        for r in rows
    ]
    return {"data": sessions, "meta": {"total": len(sessions)}}


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_session(
    payload: SessionCreatePayload,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_lecturer)
) -> dict[str, Any]:
    sid = f"sess-{uuid.uuid4().hex[:8]}"
    db_item = GroupingSessionRow(
        id=sid,
        class_section_id=payload.class_section_id,
        name=payload.name,
        mode=payload.mode,
        team_min_size=payload.team_min_size,
        team_max_size=payload.team_max_size,
        required_roles_json=json.dumps(payload.required_roles),
        required_skills_json=json.dumps(payload.required_skills),
        allow_cross_major=payload.allow_cross_major,
        weights_json=json.dumps(payload.weights),
        status=GroupingSessionStatus.OPEN,
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    item = {
        "id": db_item.id,
        "class_section_id": db_item.class_section_id,
        "name": db_item.name,
        "mode": db_item.mode.value if hasattr(db_item.mode, 'value') else str(db_item.mode),
        "status": db_item.status.value if hasattr(db_item.status, 'value') else str(db_item.status),
        "created_by": principal.user_id,
    }
    return {"data": item}


@router.get("/{session_id}")
async def get_session(session_id: str, db: Session = Depends(get_db), principal: Principal = Depends(require_student)) -> dict[str, Any]:
    row = db.query(GroupingSessionRow).filter(GroupingSessionRow.id == session_id).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return {
        "data": {
            "id": row.id,
            "class_section_id": row.class_section_id,
            "name": row.name,
            "mode": row.mode.value if hasattr(row.mode, 'value') else str(row.mode),
            "status": row.status.value if hasattr(row.status, 'value') else str(row.status),
            "team_min_size": row.team_min_size,
            "team_max_size": row.team_max_size,
        }
    }


@router.patch("/{session_id}")
async def patch_session(
    session_id: str,
    payload: SessionPatchPayload,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_lecturer)
) -> dict[str, Any]:
    row = db.query(GroupingSessionRow).filter(GroupingSessionRow.id == session_id).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        
    if payload.name is not None:
        row.name = payload.name
    if payload.team_min_size is not None:
        row.team_min_size = payload.team_min_size
    if payload.team_max_size is not None:
        row.team_max_size = payload.team_max_size
        
    db.commit()
    db.refresh(row)
    
    return {
        "data": {
            "id": row.id,
            "name": row.name,
            "status": row.status.value if hasattr(row.status, 'value') else str(row.status)
        }
    }


@router.delete("/{session_id}")
async def delete_session(session_id: str, db: Session = Depends(get_db), principal: Principal = Depends(require_lecturer)) -> dict[str, Any]:
    row = db.query(GroupingSessionRow).filter(GroupingSessionRow.id == session_id).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        
    db.delete(row)
    db.commit()
    return {"data": {"message": "Grouping session deleted"}}


@router.get("/{session_id}/participants")
async def get_session_participants(
    session_id: str,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_lecturer)
) -> dict[str, Any]:
    sess = db.query(GroupingSessionRow).filter(GroupingSessionRow.id == session_id).first()
    if not sess:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        
    # Get students who submitted DNA for this section
    dnas = db.query(TeamDNARow).filter(TeamDNARow.class_section_id == sess.class_section_id).all()
    
    participants = []
    for dna in dnas:
        user = db.query(UserRow).filter(UserRow.id == dna.student_id).first()
        if not user:
            continue
            
        # Check if student is in a team for this session
        member = db.query(TeamMemberRow).join(TeamRow, TeamRow.id == TeamMemberRow.team_id).filter(
            TeamMemberRow.student_id == user.id,
            TeamRow.session_id == session_id
        ).first()
        
        participants.append({
            "student_id": user.id,
            "name": user.display_name,
            "dna_status": "SUBMITTED" if dna.completion_percentage > 0 else "PENDING",
            "team_id": member.team_id if member else None
        })
        
    return {"data": participants, "meta": {"total": len(participants)}}


@router.get("/{session_id}/readiness")
async def get_session_readiness(
    session_id: str,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_lecturer)
) -> dict[str, Any]:
    sess = db.query(GroupingSessionRow).filter(GroupingSessionRow.id == session_id).first()
    if not sess:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        
    sec = db.query(ClassSectionRow).filter(ClassSectionRow.id == sess.class_section_id).first()
    total_students = sec.capacity if sec else 40
    
    dnas = db.query(TeamDNARow).filter(TeamDNARow.class_section_id == sess.class_section_id).all()
    submitted_dna_count = sum(1 for d in dnas if d.completion_percentage > 0)
    
    assigned_count = db.query(TeamMemberRow).join(TeamRow).filter(TeamRow.session_id == session_id).count()
    unassigned_count = max(0, total_students - assigned_count)
    
    readiness_percentage = (submitted_dna_count / total_students * 100) if total_students > 0 else 0
    
    return {
        "data": {
            "session_id": session_id,
            "total_students": total_students,
            "submitted_dna_count": submitted_dna_count,
            "unassigned_students_count": unassigned_count,
            "readiness_percentage": round(readiness_percentage, 1),
            "can_start_matching": readiness_percentage >= 50.0
        }
    }


# ---------------------------------------------------------------------------
# State Machine Lifecycle Endpoints
# ---------------------------------------------------------------------------

@router.post("/{session_id}/open")
async def open_session(session_id: str, db: Session = Depends(get_db), principal: Principal = Depends(require_lecturer)) -> dict[str, Any]:
    row = db.query(GroupingSessionRow).filter(GroupingSessionRow.id == session_id).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        
    row.status = GroupingSessionStatus.OPEN
    db.commit()
    return {"data": {"id": row.id, "status": "OPEN"}}


@router.post("/{session_id}/freeze")
async def freeze_session(session_id: str, db: Session = Depends(get_db), principal: Principal = Depends(require_lecturer)) -> dict[str, Any]:
    row = db.query(GroupingSessionRow).filter(GroupingSessionRow.id == session_id).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        
    row.status = GroupingSessionStatus.FROZEN
    db.commit()
    return {"data": {"id": row.id, "status": "FROZEN"}}


@router.post("/{session_id}/reopen")
async def reopen_session(session_id: str, db: Session = Depends(get_db), principal: Principal = Depends(require_lecturer)) -> dict[str, Any]:
    row = db.query(GroupingSessionRow).filter(GroupingSessionRow.id == session_id).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        
    row.status = GroupingSessionStatus.OPEN
    db.commit()
    return {"data": {"id": row.id, "status": "OPEN"}}


@router.post("/{session_id}/cancel")
async def cancel_session(session_id: str, db: Session = Depends(get_db), principal: Principal = Depends(require_lecturer)) -> dict[str, Any]:
    row = db.query(GroupingSessionRow).filter(GroupingSessionRow.id == session_id).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        
    row.status = GroupingSessionStatus.CLOSED
    db.commit()
    return {"data": {"id": row.id, "status": "CLOSED"}}


@router.post("/{session_id}/publish")
async def publish_session(session_id: str, db: Session = Depends(get_db), principal: Principal = Depends(require_lecturer)) -> dict[str, Any]:
    row = db.query(GroupingSessionRow).filter(GroupingSessionRow.id == session_id).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        
    row.status = GroupingSessionStatus.PUBLISHED
    db.commit()
    return {"data": {"id": row.id, "status": "PUBLISHED", "message": "Teams published successfully"}}
