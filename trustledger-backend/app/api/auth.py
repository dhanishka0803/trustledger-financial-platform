from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
import random
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.config import settings
from app.models.models import User, Transaction, FraudScore, ComplianceCheck

router = APIRouter()

# Security
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)


# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: Optional[str] = ""
    phone: Optional[str] = ""


class LoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = ""
    phone: Optional[str] = ""
    is_active: bool
    is_admin: bool
    account_frozen: bool
    large_text: bool
    high_contrast: bool
    voice_mode: bool
    simple_mode: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class TokenData(BaseModel):
    username: Optional[str] = None


# Utility functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()


def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if token is None:
        raise credentials_exception
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


# API Endpoints
@router.post("/register")
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name or "",
        phone=user.phone or ""
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # New users start with zero transactions and notifications
    # No demo data is created for new registrations

    # Generate token
    access_token = create_access_token(data={"sub": db_user.username})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email,
            "full_name": db_user.full_name,
            "phone": db_user.phone,
            "is_active": db_user.is_active,
            "is_admin": db_user.is_admin,
            "account_frozen": db_user.account_frozen,
            "large_text": db_user.large_text,
            "high_contrast": db_user.high_contrast,
            "voice_mode": db_user.voice_mode,
            "simple_mode": db_user.simple_mode,
            "created_at": db_user.created_at.isoformat()
        }
    }


@router.post("/login")
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    access_token = create_access_token(data={"sub": user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "phone": user.phone,
            "is_active": user.is_active,
            "is_admin": user.is_admin,
            "account_frozen": user.account_frozen,
            "large_text": user.large_text,
            "high_contrast": user.high_contrast,
            "voice_mode": user.voice_mode,
            "simple_mode": user.simple_mode,
            "created_at": user.created_at.isoformat()
        }
    }


@router.get("/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "is_active": current_user.is_active,
        "is_admin": current_user.is_admin,
        "account_frozen": current_user.account_frozen,
        "large_text": current_user.large_text,
        "high_contrast": current_user.high_contrast,
        "voice_mode": current_user.voice_mode,
        "simple_mode": current_user.simple_mode,
        "created_at": current_user.created_at.isoformat()
    }


@router.put("/settings")
async def update_settings(
    settings_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user settings (accessibility, profile, etc.)"""
    allowed_fields = [
        "full_name", "phone", "large_text", "high_contrast",
        "voice_mode", "simple_mode"
    ]
    for key, value in settings_data.items():
        if key in allowed_fields:
            setattr(current_user, key, value)

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Settings updated successfully",
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "phone": current_user.phone,
            "is_active": current_user.is_active,
            "is_admin": current_user.is_admin,
            "account_frozen": current_user.account_frozen,
            "large_text": current_user.large_text,
            "high_contrast": current_user.high_contrast,
            "voice_mode": current_user.voice_mode,
            "simple_mode": current_user.simple_mode,
            "created_at": current_user.created_at.isoformat()
        }
    }


@router.post("/freeze-account")
async def freeze_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Emergency freeze account"""
    current_user.account_frozen = True
    db.commit()
    return {"message": "Account frozen successfully. Contact support to unfreeze."}


@router.post("/unfreeze-account")
async def unfreeze_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unfreeze account"""
    current_user.account_frozen = False
    db.commit()
    return {"message": "Account unfrozen successfully."}
