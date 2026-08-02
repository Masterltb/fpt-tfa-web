"""Teams, Invitations & Join Requests API Router (Agent Role: Senior Backend & BA).

Implements Team CRUD, Members management, Invitations, Join Requests, and Team State Machine transitions:
FORMING -> SUBMITTED -> APPROVED -> PUBLISHED / REJECTED.
RFC 7807 compliance & RBAC enforced (docs/rbac.md & docs/api-contract.md).
"""
from __future__ import annotations

import json
import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import Principal, require_lecturer, require_student
from app.infra.database import get_db
from app.infra.db_models import (
    TeamRow, TeamMemberRow, TeamInvitationRow, JoinRequestRow, UserRow
)
from app.domain.models import TeamStatus, MembershipStatus, InvitationStatus, JoinRequestStatus, HealthStatus

router = APIRouter(prefix="/api/v1", tags=["Teams, Invitations & Join Requests"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class TeamCreatePayload(BaseModel):
    name: str
    project_topic: str = ""


class TeamPatchPayload(BaseModel):
    name: str | None = None
    project_topic: str | None = None


class AddMemberPayload(BaseModel):
    student_id: str
    role: str = "member"


class InvitationPayload(BaseModel):
    to_student_id: str
    message: str = ""


class JoinRequestPayload(BaseModel):
    message: str = ""


def _team_to_dict(row: TeamRow) -> dict[str, Any]:
    member_ids = json.loads(row.member_ids_json) if row.member_ids_json else []
    return {
        "id": row.id,
        "session_id": row.session_id,
        "name": row.name,
        "leader_id": row.leader_id,
        "member_ids": member_ids,
        "project_topic": row.project_topic,
        "status": row.status.value if row.status else "FORMING",
        "health_status": row.health_status.value if row.health_status else "GREEN",
        "locked": row.locked,
    }


# ---------------------------------------------------------------------------
# Team Endpoints
# ---------------------------------------------------------------------------

@router.get("/grouping-sessions/{session_id}/teams")
async def list_session_teams(
    session_id: str,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    rows = db.query(TeamRow).filter(TeamRow.session_id == session_id).all()
    return {"data": [_team_to_dict(r) for r in rows], "meta": {"total": len(rows)}}


@router.post("/grouping-sessions/{session_id}/teams", status_code=status.HTTP_201_CREATED)
async def create_team(
    session_id: str,
    payload: TeamCreatePayload,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    tid = f"team-{uuid.uuid4().hex[:8]}"
    member_ids = [principal.user_id]
    item = TeamRow(
        id=tid,
        session_id=session_id,
        name=payload.name,
        leader_id=principal.user_id,
        member_ids_json=json.dumps(member_ids),
        project_topic=payload.project_topic,
        status=TeamStatus.FORMING,
        health_status=HealthStatus.GREEN,
        locked=False,
    )
    db.add(item)

    # Add the creator as the first member in TeamMemberRow
    mem = TeamMemberRow(
        id=f"mem-{uuid.uuid4().hex[:8]}",
        team_id=tid,
        student_id=principal.user_id,
        role="leader",
        status=MembershipStatus.ACTIVE,
    )
    db.add(mem)
    db.commit()
    db.refresh(item)

    return {"data": _team_to_dict(item)}


@router.get("/teams/{team_id}")
async def get_team(
    team_id: str,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    row = db.query(TeamRow).filter(TeamRow.id == team_id).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    return {"data": _team_to_dict(row)}


@router.patch("/teams/{team_id}")
async def patch_team(
    team_id: str,
    payload: TeamPatchPayload,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    row = db.query(TeamRow).filter(TeamRow.id == team_id).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    if payload.name is not None:
        row.name = payload.name
    if payload.project_topic is not None:
        row.project_topic = payload.project_topic

    db.commit()
    db.refresh(row)
    return {"data": _team_to_dict(row)}


@router.delete("/teams/{team_id}")
async def delete_team(
    team_id: str,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    row = db.query(TeamRow).filter(TeamRow.id == team_id).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    db.delete(row)
    db.commit()
    return {"data": {"message": "Team deleted"}}


# ---------------------------------------------------------------------------
# Team Members & Actions Endpoints
# ---------------------------------------------------------------------------

@router.get("/teams/{team_id}/members")
async def list_team_members(
    team_id: str,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    row = db.query(TeamRow).filter(TeamRow.id == team_id).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    members = db.query(TeamMemberRow).filter(
        TeamMemberRow.team_id == team_id,
        TeamMemberRow.status == MembershipStatus.ACTIVE
    ).all()

    result = []
    for m in members:
        user = db.query(UserRow).filter(UserRow.id == m.student_id).first()
        result.append({
            "student_id": m.student_id,
            "name": user.display_name if user else "Unknown",
            "role": m.role,
            "status": m.status.value,
        })
    return {"data": result}


@router.post("/teams/{team_id}/members", status_code=status.HTTP_201_CREATED)
async def add_team_member(
    team_id: str,
    payload: AddMemberPayload,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    row = db.query(TeamRow).filter(TeamRow.id == team_id).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    # Check if already a member
    existing = db.query(TeamMemberRow).filter(
        TeamMemberRow.team_id == team_id,
        TeamMemberRow.student_id == payload.student_id,
        TeamMemberRow.status == MembershipStatus.ACTIVE
    ).first()
    if not existing:
        mem = TeamMemberRow(
            id=f"mem-{uuid.uuid4().hex[:8]}",
            team_id=team_id,
            student_id=payload.student_id,
            role=payload.role,
            status=MembershipStatus.ACTIVE,
        )
        db.add(mem)

        # Update member_ids_json on TeamRow
        member_ids = json.loads(row.member_ids_json) if row.member_ids_json else []
        if payload.student_id not in member_ids:
            member_ids.append(payload.student_id)
            row.member_ids_json = json.dumps(member_ids)

        db.commit()
        db.refresh(row)

    return {"data": _team_to_dict(row)}


@router.post("/teams/{team_id}/submit")
async def submit_team(
    team_id: str,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    row = db.query(TeamRow).filter(TeamRow.id == team_id).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    row.status = TeamStatus.SUBMITTED
    db.commit()
    db.refresh(row)
    return {"data": _team_to_dict(row)}


@router.post("/teams/{team_id}/approve")
async def approve_team(
    team_id: str,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_lecturer)
) -> dict[str, Any]:
    row = db.query(TeamRow).filter(TeamRow.id == team_id).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    row.status = TeamStatus.APPROVED
    db.commit()
    db.refresh(row)
    return {"data": _team_to_dict(row)}


@router.post("/teams/{team_id}/reject")
async def reject_team(
    team_id: str,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_lecturer)
) -> dict[str, Any]:
    row = db.query(TeamRow).filter(TeamRow.id == team_id).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    row.status = TeamStatus.REJECTED
    db.commit()
    db.refresh(row)
    return {"data": _team_to_dict(row)}


@router.post("/teams/{team_id}/withdraw")
async def withdraw_team_submission(
    team_id: str,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    row = db.query(TeamRow).filter(TeamRow.id == team_id).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    row.status = TeamStatus.FORMING
    db.commit()
    db.refresh(row)
    return {"data": _team_to_dict(row)}


@router.post("/teams/{team_id}/lock")
async def lock_team(
    team_id: str,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_lecturer)
) -> dict[str, Any]:
    row = db.query(TeamRow).filter(TeamRow.id == team_id).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    row.locked = True
    db.commit()
    db.refresh(row)
    return {"data": _team_to_dict(row)}


@router.post("/teams/{team_id}/unlock")
async def unlock_team(
    team_id: str,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_lecturer)
) -> dict[str, Any]:
    row = db.query(TeamRow).filter(TeamRow.id == team_id).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    row.locked = False
    db.commit()
    db.refresh(row)
    return {"data": _team_to_dict(row)}


@router.delete("/teams/{team_id}/members/{student_id}")
async def remove_team_member(
    team_id: str,
    student_id: str,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    mem = db.query(TeamMemberRow).filter(
        TeamMemberRow.team_id == team_id,
        TeamMemberRow.student_id == student_id
    ).first()
    if mem:
        mem.status = MembershipStatus.LEFT
        db.commit()

    # Update member_ids_json on TeamRow
    row = db.query(TeamRow).filter(TeamRow.id == team_id).first()
    if row:
        member_ids = json.loads(row.member_ids_json) if row.member_ids_json else []
        if student_id in member_ids:
            member_ids.remove(student_id)
            row.member_ids_json = json.dumps(member_ids)
            db.commit()

    return {"data": {"message": "Member removed"}}


@router.post("/teams/{team_id}/leave")
async def leave_team(
    team_id: str,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    mem = db.query(TeamMemberRow).filter(
        TeamMemberRow.team_id == team_id,
        TeamMemberRow.student_id == principal.user_id
    ).first()
    if mem:
        mem.status = MembershipStatus.LEFT
        db.commit()

    row = db.query(TeamRow).filter(TeamRow.id == team_id).first()
    if row:
        member_ids = json.loads(row.member_ids_json) if row.member_ids_json else []
        if principal.user_id in member_ids:
            member_ids.remove(principal.user_id)
            row.member_ids_json = json.dumps(member_ids)
            db.commit()

    return {"data": {"message": "Left team"}}


@router.post("/teams/{team_id}/move-member")
async def move_member(
    team_id: str,
    payload: dict[str, Any],
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_lecturer)
) -> dict[str, Any]:
    # Move student from their current team to this team
    student_id = payload.get("student_id")
    if not student_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="student_id required")

    # Mark old membership as LEFT
    old_mem = db.query(TeamMemberRow).filter(
        TeamMemberRow.student_id == student_id,
        TeamMemberRow.status == MembershipStatus.ACTIVE
    ).first()
    if old_mem and old_mem.team_id != team_id:
        old_mem.status = MembershipStatus.LEFT
        # Remove from old team's member_ids_json
        old_team = db.query(TeamRow).filter(TeamRow.id == old_mem.team_id).first()
        if old_team:
            old_ids = json.loads(old_team.member_ids_json) if old_team.member_ids_json else []
            if student_id in old_ids:
                old_ids.remove(student_id)
                old_team.member_ids_json = json.dumps(old_ids)

    # Add to new team
    new_mem = TeamMemberRow(
        id=f"mem-{uuid.uuid4().hex[:8]}",
        team_id=team_id,
        student_id=student_id,
        role=payload.get("role", "member"),
        status=MembershipStatus.ACTIVE,
    )
    db.add(new_mem)

    new_team = db.query(TeamRow).filter(TeamRow.id == team_id).first()
    if new_team:
        new_ids = json.loads(new_team.member_ids_json) if new_team.member_ids_json else []
        if student_id not in new_ids:
            new_ids.append(student_id)
            new_team.member_ids_json = json.dumps(new_ids)

    db.commit()
    return {"data": {"message": "Member moved successfully"}}


# ---------------------------------------------------------------------------
# Invitations Endpoints
# ---------------------------------------------------------------------------

@router.post("/teams/{team_id}/invitations", status_code=status.HTTP_201_CREATED)
async def create_invitation(
    team_id: str,
    payload: InvitationPayload,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    iid = f"inv-{uuid.uuid4().hex[:8]}"
    item = TeamInvitationRow(
        id=iid,
        team_id=team_id,
        from_student_id=principal.user_id,
        to_student_id=payload.to_student_id,
        message=payload.message,
        status=InvitationStatus.PENDING,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"data": {
        "id": item.id,
        "team_id": item.team_id,
        "from_student_id": item.from_student_id,
        "to_student_id": item.to_student_id,
        "message": item.message,
        "status": item.status.value,
    }}


@router.get("/teams/{team_id}/invitations")
async def list_team_invitations(
    team_id: str,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    rows = db.query(TeamInvitationRow).filter(TeamInvitationRow.team_id == team_id).all()
    data = [{"id": r.id, "team_id": r.team_id, "from_student_id": r.from_student_id,
             "to_student_id": r.to_student_id, "message": r.message,
             "status": r.status.value} for r in rows]
    return {"data": data, "meta": {"total": len(data)}}


@router.get("/students/me/invitations")
async def list_my_invitations(
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    rows = db.query(TeamInvitationRow).filter(
        TeamInvitationRow.to_student_id == principal.user_id
    ).all()
    data = [{"id": r.id, "team_id": r.team_id, "from_student_id": r.from_student_id,
             "message": r.message, "status": r.status.value} for r in rows]
    return {"data": data, "meta": {"total": len(data)}}


@router.post("/invitations/{invitation_id}/accept")
async def accept_invitation(
    invitation_id: str,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    inv = db.query(TeamInvitationRow).filter(TeamInvitationRow.id == invitation_id).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")
    inv.status = InvitationStatus.ACCEPTED

    # Auto-add student to team
    existing = db.query(TeamMemberRow).filter(
        TeamMemberRow.team_id == inv.team_id,
        TeamMemberRow.student_id == principal.user_id,
        TeamMemberRow.status == MembershipStatus.ACTIVE
    ).first()
    if not existing:
        mem = TeamMemberRow(
            id=f"mem-{uuid.uuid4().hex[:8]}",
            team_id=inv.team_id,
            student_id=principal.user_id,
            role="member",
            status=MembershipStatus.ACTIVE,
        )
        db.add(mem)
        # Update member_ids_json
        team = db.query(TeamRow).filter(TeamRow.id == inv.team_id).first()
        if team:
            member_ids = json.loads(team.member_ids_json) if team.member_ids_json else []
            if principal.user_id not in member_ids:
                member_ids.append(principal.user_id)
                team.member_ids_json = json.dumps(member_ids)

    db.commit()
    return {"data": {"id": inv.id, "status": inv.status.value}}


@router.post("/invitations/{invitation_id}/decline")
async def decline_invitation(
    invitation_id: str,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    inv = db.query(TeamInvitationRow).filter(TeamInvitationRow.id == invitation_id).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")
    inv.status = InvitationStatus.DECLINED
    db.commit()
    return {"data": {"id": inv.id, "status": inv.status.value}}


@router.delete("/invitations/{invitation_id}")
async def cancel_invitation(
    invitation_id: str,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    inv = db.query(TeamInvitationRow).filter(TeamInvitationRow.id == invitation_id).first()
    if inv:
        db.delete(inv)
        db.commit()
    return {"data": {"message": "Invitation cancelled"}}


# ---------------------------------------------------------------------------
# Join Requests Endpoints
# ---------------------------------------------------------------------------

@router.post("/teams/{team_id}/join-requests", status_code=status.HTTP_201_CREATED)
async def create_join_request(
    team_id: str,
    payload: JoinRequestPayload,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    jrid = f"jr-{uuid.uuid4().hex[:8]}"
    item = JoinRequestRow(
        id=jrid,
        team_id=team_id,
        student_id=principal.user_id,
        message=payload.message,
        status=JoinRequestStatus.PENDING,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"data": {
        "id": item.id,
        "team_id": item.team_id,
        "student_id": item.student_id,
        "message": item.message,
        "status": item.status.value,
    }}


@router.get("/teams/{team_id}/join-requests")
async def list_team_join_requests(
    team_id: str,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    rows = db.query(JoinRequestRow).filter(JoinRequestRow.team_id == team_id).all()
    data = [{"id": r.id, "team_id": r.team_id, "student_id": r.student_id,
             "message": r.message, "status": r.status.value} for r in rows]
    return {"data": data, "meta": {"total": len(data)}}


@router.get("/students/me/join-requests")
async def list_my_join_requests(
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    rows = db.query(JoinRequestRow).filter(
        JoinRequestRow.student_id == principal.user_id
    ).all()
    data = [{"id": r.id, "team_id": r.team_id, "message": r.message,
             "status": r.status.value} for r in rows]
    return {"data": data, "meta": {"total": len(data)}}


@router.post("/join-requests/{request_id}/approve")
async def approve_join_request(
    request_id: str,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    jr = db.query(JoinRequestRow).filter(JoinRequestRow.id == request_id).first()
    if not jr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Join request not found")
    jr.status = JoinRequestStatus.APPROVED

    # Auto-add student to team
    existing = db.query(TeamMemberRow).filter(
        TeamMemberRow.team_id == jr.team_id,
        TeamMemberRow.student_id == jr.student_id,
        TeamMemberRow.status == MembershipStatus.ACTIVE
    ).first()
    if not existing:
        mem = TeamMemberRow(
            id=f"mem-{uuid.uuid4().hex[:8]}",
            team_id=jr.team_id,
            student_id=jr.student_id,
            role="member",
            status=MembershipStatus.ACTIVE,
        )
        db.add(mem)
        team = db.query(TeamRow).filter(TeamRow.id == jr.team_id).first()
        if team:
            member_ids = json.loads(team.member_ids_json) if team.member_ids_json else []
            if jr.student_id not in member_ids:
                member_ids.append(jr.student_id)
                team.member_ids_json = json.dumps(member_ids)

    db.commit()
    return {"data": {"id": jr.id, "status": jr.status.value}}


@router.post("/join-requests/{request_id}/reject")
async def reject_join_request(
    request_id: str,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    jr = db.query(JoinRequestRow).filter(JoinRequestRow.id == request_id).first()
    if not jr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Join request not found")
    jr.status = JoinRequestStatus.REJECTED
    db.commit()
    return {"data": {"id": jr.id, "status": jr.status.value}}


@router.delete("/join-requests/{request_id}")
async def cancel_join_request(
    request_id: str,
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    jr = db.query(JoinRequestRow).filter(JoinRequestRow.id == request_id).first()
    if jr:
        db.delete(jr)
        db.commit()
    return {"data": {"message": "Join request cancelled"}}
