"""Student-Led Team Creation, Invitations & Join Requests API Router.

Supports Student-Led & Hybrid grouping modes.
"""
from __future__ import annotations

import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.api.deps import Principal, require_student

router = APIRouter(prefix="/api/v1/student", tags=["Student Team Formation"])


class TeamCreatePayload(BaseModel):
    session_id: str
    name: str
    project_topic: str = ""


class InvitePayload(BaseModel):
    to_student_id: str
    message: str = ""


class InvitationResponsePayload(BaseModel):
    action: str = Field(description="ACCEPTED or DECLINED")


_draft_teams: list[dict[str, Any]] = []
_invitations: list[dict[str, Any]] = []


@router.post("/teams", status_code=status.HTTP_201_CREATED)
async def create_student_team(
    payload: TeamCreatePayload,
    principal: Principal = Depends(require_student),
) -> dict[str, Any]:
    team_id = f"team-{uuid.uuid4().hex[:8]}"
    team = {
        "id": team_id,
        "session_id": payload.session_id,
        "name": payload.name,
        "leader_id": principal.user_id,
        "member_ids": [principal.user_id],
        "project_topic": payload.project_topic,
        "status": "FORMING",
        "health_status": "GREEN",
        "locked": False,
    }
    _draft_teams.append(team)
    return team


@router.post("/teams/{team_id}/invite", status_code=status.HTTP_201_CREATED)
async def send_team_invitation(
    team_id: str,
    payload: InvitePayload,
    principal: Principal = Depends(require_student),
) -> dict[str, Any]:
    team = next((t for t in _draft_teams if t["id"] == team_id), None)
    if not team:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Team not found")

    if principal.user_id not in team["member_ids"]:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only team members can invite others")

    invitation_id = f"inv-{uuid.uuid4().hex[:8]}"
    inv = {
        "id": invitation_id,
        "team_id": team_id,
        "from_student_id": principal.user_id,
        "to_student_id": payload.to_student_id,
        "message": payload.message,
        "status": "PENDING",
    }
    _invitations.append(inv)
    return inv


@router.post("/invitations/{invitation_id}/respond")
async def respond_to_invitation(
    invitation_id: str,
    payload: InvitationResponsePayload,
    principal: Principal = Depends(require_student),
) -> dict[str, Any]:
    inv = next((i for i in _invitations if i["id"] == invitation_id), None)
    if not inv:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Invitation not found")

    if inv["to_student_id"] != principal.user_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not authorized to respond to this invitation")

    action = payload.action.upper()
    if action == "ACCEPTED":
        inv["status"] = "ACCEPTED"
        team = next((t for t in _draft_teams if t["id"] == inv["team_id"]), None)
        if team and principal.user_id not in team["member_ids"]:
            team["member_ids"].append(principal.user_id)
    elif action == "DECLINED":
        inv["status"] = "DECLINED"
    else:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid action. Must be ACCEPTED or DECLINED.")

    return {"status": "ok", "invitation": inv}
