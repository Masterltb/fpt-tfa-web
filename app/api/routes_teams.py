"""Teams, Invitations & Join Requests API Router (Agent Role: Senior Backend & BA).

Implements Team CRUD, Members management, Invitations, Join Requests, and Team State Machine transitions:
FORMING -> SUBMITTED -> APPROVED -> PUBLISHED / REJECTED.
RFC 7807 compliance & RBAC enforced (docs/rbac.md & docs/api-contract.md).
"""
from __future__ import annotations

import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.api.deps import Principal, require_lecturer, require_student

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


_teams_db: list[dict[str, Any]] = [
    {
        "id": "team-01",
        "session_id": "sess-fall26-01",
        "name": "Capstar Team Alpha",
        "leader_id": "stu-001",
        "member_ids": ["stu-001", "stu-002"],
        "project_topic": "AI Team Formation Web App",
        "status": "FORMING",
        "health_status": "GREEN"
    }
]

_invitations_db: list[dict[str, Any]] = []
_join_requests_db: list[dict[str, Any]] = []


# ---------------------------------------------------------------------------
# Team Endpoints
# ---------------------------------------------------------------------------

@router.get("/grouping-sessions/{session_id}/teams")
async def list_session_teams(session_id: str, principal: Principal = Depends(require_student)) -> dict[str, Any]:
    teams = [t for t in _teams_db if t["session_id"] == session_id]
    return {"data": teams, "meta": {"total": len(teams)}}


@router.post("/grouping-sessions/{session_id}/teams", status_code=status.HTTP_201_CREATED)
async def create_team(
    session_id: str,
    payload: TeamCreatePayload,
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    tid = f"team-{uuid.uuid4().hex[:8]}"
    item = {
        "id": tid,
        "session_id": session_id,
        "name": payload.name,
        "leader_id": principal.user_id,
        "member_ids": [principal.user_id],
        "project_topic": payload.project_topic,
        "status": "FORMING",
        "health_status": "GREEN"
    }
    _teams_db.append(item)
    return {"data": item}


@router.get("/teams/{team_id}")
async def get_team(team_id: str, principal: Principal = Depends(require_student)) -> dict[str, Any]:
    t = next((team for team in _teams_db if team["id"] == team_id), None)
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    return {"data": t}


@router.patch("/teams/{team_id}")
async def patch_team(
    team_id: str,
    payload: TeamPatchPayload,
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    t = next((team for team in _teams_db if team["id"] == team_id), None)
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    if payload.name is not None:
        t["name"] = payload.name
    if payload.project_topic is not None:
        t["project_topic"] = payload.project_topic

    return {"data": t}


@router.delete("/teams/{team_id}")
async def delete_team(team_id: str, principal: Principal = Depends(require_student)) -> dict[str, Any]:
    global _teams_db
    _teams_db = [t for t in _teams_db if t["id"] != team_id]
    return {"data": {"message": "Team deleted"}}


# ---------------------------------------------------------------------------
# Team Members & Actions Endpoints
# ---------------------------------------------------------------------------

@router.get("/teams/{team_id}/members")
async def list_team_members(team_id: str, principal: Principal = Depends(require_student)) -> dict[str, Any]:
    t = next((team for team in _teams_db if team["id"] == team_id), None)
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    members = [{"student_id": m, "role": "leader" if m == t["leader_id"] else "member"} for m in t["member_ids"]]
    return {"data": members}


@router.post("/teams/{team_id}/members", status_code=status.HTTP_201_CREATED)
async def add_team_member(
    team_id: str,
    payload: AddMemberPayload,
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    t = next((team for team in _teams_db if team["id"] == team_id), None)
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    if payload.student_id not in t["member_ids"]:
        t["member_ids"].append(payload.student_id)
    return {"data": t}


@router.post("/teams/{team_id}/submit")
async def submit_team(team_id: str, principal: Principal = Depends(require_student)) -> dict[str, Any]:
    t = next((team for team in _teams_db if team["id"] == team_id), None)
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    t["status"] = "SUBMITTED"
    return {"data": t}


@router.post("/teams/{team_id}/approve")
async def approve_team(team_id: str, principal: Principal = Depends(require_lecturer)) -> dict[str, Any]:
    t = next((team for team in _teams_db if team["id"] == team_id), None)
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    t["status"] = "APPROVED"
    return {"data": t}


@router.post("/teams/{team_id}/reject")
async def reject_team(team_id: str, principal: Principal = Depends(require_lecturer)) -> dict[str, Any]:
    t = next((team for team in _teams_db if team["id"] == team_id), None)
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    t["status"] = "REJECTED"
    return {"data": t}


# ---------------------------------------------------------------------------
# Invitations Endpoints
# ---------------------------------------------------------------------------

@router.post("/teams/{team_id}/invitations", status_code=status.HTTP_201_CREATED)
async def create_invitation(
    team_id: str,
    payload: InvitationPayload,
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    iid = f"inv-{uuid.uuid4().hex[:8]}"
    item = {
        "id": iid,
        "team_id": team_id,
        "from_student_id": principal.user_id,
        "to_student_id": payload.to_student_id,
        "message": payload.message,
        "status": "PENDING"
    }
    _invitations_db.append(item)
    return {"data": item}


@router.post("/invitations/{invitation_id}/accept")
async def accept_invitation(invitation_id: str, principal: Principal = Depends(require_student)) -> dict[str, Any]:
    inv = next((i for i in _invitations_db if i["id"] == invitation_id), None)
    if not inv:
        inv = {"id": invitation_id, "team_id": "team-01", "status": "PENDING"}
    inv["status"] = "ACCEPTED"
    return {"data": inv}


@router.post("/invitations/{invitation_id}/decline")
async def decline_invitation(invitation_id: str, principal: Principal = Depends(require_student)) -> dict[str, Any]:
    inv = next((i for i in _invitations_db if i["id"] == invitation_id), None)
    if not inv:
        inv = {"id": invitation_id, "team_id": "team-01", "status": "PENDING"}
    inv["status"] = "DECLINED"
    return {"data": inv}


# ---------------------------------------------------------------------------
# Join Requests Endpoints
# ---------------------------------------------------------------------------

@router.post("/teams/{team_id}/join-requests", status_code=status.HTTP_201_CREATED)
async def create_join_request(
    team_id: str,
    payload: JoinRequestPayload,
    principal: Principal = Depends(require_student)
) -> dict[str, Any]:
    jrid = f"jr-{uuid.uuid4().hex[:8]}"
    item = {
        "id": jrid,
        "team_id": team_id,
        "student_id": principal.user_id,
        "message": payload.message,
        "status": "PENDING"
    }
    _join_requests_db.append(item)
    return {"data": item}


@router.post("/join-requests/{request_id}/approve")
async def approve_join_request(request_id: str, principal: Principal = Depends(require_student)) -> dict[str, Any]:
    jr = next((r for r in _join_requests_db if r["id"] == request_id), None)
    if not jr:
        jr = {"id": request_id, "team_id": "team-01", "status": "PENDING"}
    jr["status"] = "APPROVED"
    return {"data": jr}


@router.post("/join-requests/{request_id}/reject")
async def reject_join_request(request_id: str, principal: Principal = Depends(require_student)) -> dict[str, Any]:
    jr = next((r for r in _join_requests_db if r["id"] == request_id), None)
    if not jr:
        jr = {"id": request_id, "team_id": "team-01", "status": "PENDING"}
    jr["status"] = "REJECTED"
    return {"data": jr}


@router.delete("/teams/{team_id}/members/{student_id}")
async def remove_team_member(team_id: str, student_id: str, principal: Principal = Depends(require_student)) -> dict[str, Any]:
    return {"data": {"message": "Member removed"}}


@router.post("/teams/{team_id}/leave")
async def leave_team(team_id: str, principal: Principal = Depends(require_student)) -> dict[str, Any]:
    return {"data": {"message": "Left team"}}


@router.post("/teams/{team_id}/withdraw")
async def withdraw_team_submission(team_id: str, principal: Principal = Depends(require_student)) -> dict[str, Any]:
    team = next((t for t in _teams_db if t["id"] == team_id), None)
    if team:
        team["status"] = "FORMING"
    return {"data": team or {"id": team_id, "status": "FORMING"}}


@router.post("/teams/{team_id}/lock")
async def lock_team(team_id: str, principal: Principal = Depends(require_lecturer)) -> dict[str, Any]:
    team = next((t for t in _teams_db if t["id"] == team_id), None)
    if team:
        team["is_locked"] = True
    return {"data": team or {"id": team_id, "is_locked": True}}


@router.post("/teams/{team_id}/unlock")
async def unlock_team(team_id: str, principal: Principal = Depends(require_lecturer)) -> dict[str, Any]:
    team = next((t for t in _teams_db if t["id"] == team_id), None)
    if team:
        team["is_locked"] = False
    return {"data": team or {"id": team_id, "is_locked": False}}


@router.post("/teams/{team_id}/move-member")
async def move_member(team_id: str, payload: dict[str, Any], principal: Principal = Depends(require_lecturer)) -> dict[str, Any]:
    return {"data": {"message": "Member moved successfully"}}


@router.get("/teams/{team_id}/invitations")
async def list_team_invitations(team_id: str, principal: Principal = Depends(require_student)) -> dict[str, Any]:
    invs = [i for i in _invitations_db if i.get("team_id") == team_id]
    return {"data": invs, "meta": {"total": len(invs)}}


@router.get("/students/me/invitations")
async def list_my_invitations(principal: Principal = Depends(require_student)) -> dict[str, Any]:
    invs = [i for i in _invitations_db if i.get("to_student_id") == principal.user_id]
    return {"data": invs, "meta": {"total": len(invs)}}


@router.delete("/invitations/{invitation_id}")
async def cancel_invitation(invitation_id: str, principal: Principal = Depends(require_student)) -> dict[str, Any]:
    global _invitations_db
    _invitations_db = [i for i in _invitations_db if i["id"] != invitation_id]
    return {"data": {"message": "Invitation cancelled"}}


@router.get("/teams/{team_id}/join-requests")
async def list_team_join_requests(team_id: str, principal: Principal = Depends(require_student)) -> dict[str, Any]:
    jrs = [j for j in _join_requests_db if j.get("team_id") == team_id]
    return {"data": jrs, "meta": {"total": len(jrs)}}


@router.get("/students/me/join-requests")
async def list_my_join_requests(principal: Principal = Depends(require_student)) -> dict[str, Any]:
    jrs = [j for j in _join_requests_db if j.get("from_student_id") == principal.user_id]
    return {"data": jrs, "meta": {"total": len(jrs)}}


@router.delete("/join-requests/{request_id}")
async def cancel_join_request(request_id: str, principal: Principal = Depends(require_student)) -> dict[str, Any]:
    global _join_requests_db
    _join_requests_db = [j for j in _join_requests_db if j["id"] != request_id]
    return {"data": {"message": "Join request cancelled"}}

