"""Lecturer API Router — Grouping Sessions, Review Board & Matching Execution.

Requires LECTURER or ADMIN role (docs/rbac.md).
Human-in-the-loop: Lecturers adjust, review, and approve final team assignments.
"""
from __future__ import annotations

import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.api.deps import Principal, require_lecturer, get_engine
from app.domain.models import GroupingMode
from app.matching.engine import MatchingEngine

router = APIRouter(prefix="/api/v1/lecturer", tags=["Lecturer Management"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class SessionCreatePayload(BaseModel):
    class_section_id: str
    name: str
    mode: GroupingMode = GroupingMode.HYBRID
    team_min_size: int = Field(default=4, ge=1)
    team_max_size: int = Field(default=5, ge=1)
    required_roles: list[str] = Field(default_factory=list)
    required_skills: list[str] = Field(default_factory=list)
    allow_cross_major: bool = True
    weights: dict[str, float] = Field(default_factory=dict)


class OverrideTeamPayload(BaseModel):
    team_id: str
    member_ids: list[str]


_sessions: list[dict[str, Any]] = [
    {
        "id": "sess-fall26-01",
        "class_section_id": "sec-se1701",
        "name": "Capstar Team Formation - Fall 2026",
        "mode": "HYBRID",
        "team_min_size": 4,
        "team_max_size": 5,
        "required_roles": ["leader", "backend", "frontend", "tester"],
        "status": "OPEN",
        "teams": []
    }
]


@router.post("/sessions", status_code=status.HTTP_201_CREATED)
async def create_session(
    payload: SessionCreatePayload,
    principal: Principal = Depends(require_lecturer),
) -> dict[str, Any]:
    sess_id = f"sess-{uuid.uuid4().hex[:8]}"
    sess = {
        "id": sess_id,
        "status": "DRAFT",
        "created_by": principal.user_id,
        "teams": [],
        **payload.model_dump(),
    }
    _sessions.append(sess)
    return sess


@router.get("/sessions/{session_id}")
async def get_session(
    session_id: str,
    principal: Principal = Depends(require_lecturer),
) -> dict[str, Any]:
    sess = next((s for s in _sessions if s["id"] == session_id), None)
    if not sess:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
    return sess


@router.post("/sessions/{session_id}/match")
async def trigger_matching(
    session_id: str,
    principal: Principal = Depends(require_lecturer),
    engine: MatchingEngine = Depends(get_engine),
) -> dict[str, Any]:
    sess = next((s for s in _sessions if s["id"] == session_id), None)
    if not sess:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")

    sess["status"] = "REVIEW"
    # Simulated generated teams with rationale generator
    sess["teams"] = [
        {
            "id": f"team-{session_id}-1",
            "name": "Team Alpha",
            "member_ids": ["stu-001", "stu-002", "stu-003", "stu-004"],
            "rationale": "High skill balance (88%), 100% time overlap on Tue/Thu afternoons.",
            "status": "AI_SUGGESTED",
        },
        {
            "id": f"team-{session_id}-2",
            "name": "Team Beta",
            "member_ids": ["stu-005", "stu-006", "stu-007", "stu-008"],
            "rationale": "Balanced role coverage: Leader, Frontend, Backend, QA.",
            "status": "AI_SUGGESTED",
        },
    ]

    return {
        "status": "MATCHED",
        "session_id": session_id,
        "teams_count": len(sess["teams"]),
        "teams": sess["teams"],
    }


@router.post("/sessions/{session_id}/override-teams")
async def override_teams(
    session_id: str,
    overrides: list[OverrideTeamPayload],
    principal: Principal = Depends(require_lecturer),
) -> dict[str, Any]:
    sess = next((s for s in _sessions if s["id"] == session_id), None)
    if not sess:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")

    for ov in overrides:
        target = next((t for t in sess["teams"] if t["id"] == ov.team_id), None)
        if target:
            target["member_ids"] = ov.member_ids
            target["rationale"] += " (Overridden by Lecturer)"

    return {"status": "ok", "teams": sess["teams"]}


@router.post("/sessions/{session_id}/approve")
async def approve_and_publish_session(
    session_id: str,
    principal: Principal = Depends(require_lecturer),
) -> dict[str, Any]:
    sess = next((s for s in _sessions if s["id"] == session_id), None)
    if not sess:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")

    sess["status"] = "PUBLISHED"
    for team in sess["teams"]:
        team["status"] = "APPROVED"

    return {"status": "PUBLISHED", "message": "Teams officially published to students."}
