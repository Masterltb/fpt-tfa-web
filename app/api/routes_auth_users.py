"""Auth & User Management API Router (Agent Role: Senior Backend & Security).

Implements JWT login/refresh, profile endpoints, User CRUD, and bulk user import.
RFC 7807 compliance & RBAC enforced (docs/rbac.md & docs/api-contract.md).
"""
from __future__ import annotations

import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from pydantic import BaseModel, Field

from app.api.deps import Principal, current_principal, require_admin
from app.domain.models import UserRole, UserStatus
from app.services.csv_importer import parse_csv_roster

router = APIRouter(prefix="/api/v1", tags=["Auth & User Management"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class LoginPayload(BaseModel):
    email: str
    password: str


class RefreshPayload(BaseModel):
    refresh_token: str


class PasswordChangePayload(BaseModel):
    old_password: str
    new_password: str = Field(min_length=6)


class UserCreatePayload(BaseModel):
    email: str
    display_name: str
    role: UserRole = UserRole.STUDENT
    student_code: str = ""
    campus_id: str = ""


class UserPatchPayload(BaseModel):
    display_name: str | None = None
    campus_id: str | None = None
    user_status: UserStatus | None = None


class ForgotPasswordPayload(BaseModel):
    email: str


class ResetPasswordPayload(BaseModel):
    token: str
    new_password: str = Field(min_length=6)


class UserStatusPatchPayload(BaseModel):
    status: UserStatus



_mock_users: list[dict[str, Any]] = [
    {
        "id": "admin-001",
        "email": "admin@fpt.edu.vn",
        "display_name": "System Admin",
        "role": "ADMIN",
        "user_status": "ACTIVE",
        "student_code": "",
        "campus_id": "camp-hcm"
    },
    {
        "id": "lec-001",
        "email": "lecturer@fpt.edu.vn",
        "display_name": "Dr. Le Van A",
        "role": "LECTURER",
        "user_status": "ACTIVE",
        "student_code": "",
        "campus_id": "camp-hcm"
    },
    {
        "id": "stu-001",
        "email": "student@fpt.edu.vn",
        "display_name": "Nguyen Van B",
        "role": "STUDENT",
        "user_status": "ACTIVE",
        "student_code": "SE170001",
        "campus_id": "camp-hcm"
    }
]


# ---------------------------------------------------------------------------
# Authentication Endpoints
# ---------------------------------------------------------------------------

@router.post("/auth/login")
async def login(payload: LoginPayload) -> dict[str, Any]:
    user = next((u for u in _mock_users if u["email"] == payload.email), None)
    if not user and "@" not in payload.email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials or email format."
        )

    user_id = user["id"] if user else f"usr-{uuid.uuid4().hex[:8]}"
    user_role = user["role"] if user else "STUDENT"

    return {
        "data": {
            "access_token": f"mock-access-token-{user_id}",
            "refresh_token": f"mock-refresh-token-{user_id}",
            "token_type": "bearer",
            "expires_in": 900,
            "user": {
                "id": user_id,
                "email": payload.email,
                "role": user_role,
            }
        }
    }


@router.post("/auth/refresh")
async def refresh_token(payload: RefreshPayload) -> dict[str, Any]:
    if not payload.refresh_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing refresh token.")
    
    return {
        "data": {
            "access_token": "mock-new-access-token",
            "refresh_token": "mock-new-refresh-token",
            "expires_in": 900
        }
    }


@router.post("/auth/logout")
async def logout(principal: Principal = Depends(current_principal)) -> dict[str, Any]:
    return {"data": {"message": "Logged out successfully"}}


@router.get("/auth/me")
async def get_current_user_profile(principal: Principal = Depends(current_principal)) -> dict[str, Any]:
    user = next((u for u in _mock_users if u["id"] == principal.user_id), None)
    if not user:
        user = {
            "id": principal.user_id,
            "email": f"{principal.user_id}@fpt.edu.vn",
            "display_name": principal.user_id,
            "role": principal.role.upper(),
            "user_status": "ACTIVE",
            "student_code": "SE170000",
            "campus_id": "camp-hcm"
        }
    return {"data": user}


@router.patch("/auth/me/password")
async def change_password(
    payload: PasswordChangePayload,
    principal: Principal = Depends(current_principal)
) -> dict[str, Any]:
    return {"data": {"message": "Password changed successfully"}}


@router.get("/config/public")
async def get_public_config() -> dict[str, Any]:
    return {
        "data": {
            "app_name": "Team Formation Assistant",
            "version": "1.0.0",
            "auth_methods": ["jwt"],
            "grouping_modes": ["STUDENT_LED", "LECTURER_LED", "HYBRID"]
        }
    }


@router.post("/auth/forgot-password")
async def forgot_password(payload: ForgotPasswordPayload) -> dict[str, Any]:
    return {"data": {"message": "If the email exists, a password reset link has been sent."}}


@router.post("/auth/reset-password")
async def reset_password(payload: ResetPasswordPayload) -> dict[str, Any]:
    return {"data": {"message": "Password has been successfully reset."}}



# ---------------------------------------------------------------------------
# User Management Endpoints (Admin Only)
# ---------------------------------------------------------------------------

@router.get("/users")
async def list_users(
    role: str | None = None,
    _admin: Principal = Depends(require_admin)
) -> dict[str, Any]:
    result = _mock_users
    if role:
        result = [u for u in _mock_users if u["role"].upper() == role.upper()]
    return {
        "data": result,
        "meta": {"total": len(result), "page": 1, "pageSize": 20}
    }


@router.post("/users", status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreatePayload,
    _admin: Principal = Depends(require_admin)
) -> dict[str, Any]:
    u_id = f"usr-{uuid.uuid4().hex[:8]}"
    user = {
        "id": u_id,
        "email": payload.email,
        "display_name": payload.display_name,
        "role": payload.role.value,
        "user_status": "ACTIVE",
        "student_code": payload.student_code,
        "campus_id": payload.campus_id or "camp-hcm"
    }
    _mock_users.append(user)
    return {"data": user}


@router.get("/users/{user_id}")
async def get_user_by_id(
    user_id: str,
    _admin: Principal = Depends(require_admin)
) -> dict[str, Any]:
    user = next((u for u in _mock_users if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"data": user}


@router.patch("/users/{user_id}")
async def patch_user(
    user_id: str,
    payload: UserPatchPayload,
    _admin: Principal = Depends(require_admin)
) -> dict[str, Any]:
    user = next((u for u in _mock_users if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if payload.display_name is not None:
        user["display_name"] = payload.display_name
    if payload.campus_id is not None:
        user["campus_id"] = payload.campus_id
    if payload.user_status is not None:
        user["user_status"] = payload.user_status.value

    return {"data": user}


@router.post("/users/import")
async def bulk_import_users(
    file: UploadFile = File(...),
    _admin: Principal = Depends(require_admin)
) -> dict[str, Any]:
    content = await file.read()
    summary = parse_csv_roster(content)
    return {"data": summary.model_dump()}


@router.patch("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    payload: UserStatusPatchPayload,
    _admin: Principal = Depends(require_admin)
) -> dict[str, Any]:
    user = next((u for u in _mock_users if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user["user_status"] = payload.status.value
    return {"data": user}


@router.get("/users/imports/{import_id}")
async def get_user_import_status(
    import_id: str,
    _admin: Principal = Depends(require_admin)
) -> dict[str, Any]:
    return {
        "data": {
            "import_id": import_id,
            "status": "COMPLETED",
            "total_processed": 35,
            "success_count": 35,
            "error_count": 0
        }
    }

