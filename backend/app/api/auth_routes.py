from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.organization import Organization
from app.services.auth_service import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    organization_name: str | None = None  # If provided, creates a new org. If not, needs logic to join existing (omitted for simple MVP, let's just create a new one or use default)

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    organization_id: int
    organization_name: str

@router.post("/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create Organization (either custom or default)
    org_name = user_data.organization_name if user_data.organization_name else f"{user_data.email.split('@')[0]}'s Workspace"
    new_org = Organization(name=org_name)
    db.add(new_org)
    db.commit()
    db.refresh(new_org)

    # Create User
    new_user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        organization_id=new_org.id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create token
    access_token = create_access_token(data={"sub": str(new_user.id), "org_id": new_org.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": new_user.id,
        "organization_id": new_org.id,
        "organization_name": new_org.name
    }

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    org = db.query(Organization).filter(Organization.id == user.organization_id).first()

    access_token = create_access_token(data={"sub": str(user.id), "org_id": user.organization_id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "organization_id": user.organization_id,
        "organization_name": org.name
    }

@router.get("/me")
def read_users_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    return {
        "id": current_user.id,
        "email": current_user.email,
        "organization_id": current_user.organization_id,
        "organization_name": org.name
    }
