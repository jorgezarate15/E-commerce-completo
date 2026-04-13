from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
)
from app.models.entities import User, UserRole
from app.schemas.auth import AuthResponse, LoginRequest, TokenResponse, UserCreateRequest, UserProfileResponse

router = APIRouter()


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreateRequest, db: Session = Depends(get_db)) -> AuthResponse:
    existing_user = db.scalar(select(User).where(User.email == payload.email))
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user_count = db.scalar(select(func.count(User.id))) or 0
    role = UserRole.admin if user_count == 0 else UserRole.customer

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=get_password_hash(payload.password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    tokens = TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )

    profile = UserProfileResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value,
        newsletter_subscribed=user.newsletter_subscribed,
        is_active=user.is_active,
    )
    return AuthResponse(user=profile, tokens=tokens)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    tokens = TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )
    profile = UserProfileResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value,
        newsletter_subscribed=user.newsletter_subscribed,
        is_active=user.is_active,
    )
    return AuthResponse(user=profile, tokens=tokens)


@router.get("/me", response_model=UserProfileResponse)
def me(current_user: User = Depends(get_current_user)) -> UserProfileResponse:
    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role.value,
        newsletter_subscribed=current_user.newsletter_subscribed,
        is_active=current_user.is_active,
    )
