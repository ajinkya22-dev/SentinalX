from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
import jwt
from backend.utils.config import settings
from backend.database import get_db
from backend.models.userModel import UserCreate, UserOut
from backend.utils.logger import get_logger

router = APIRouter(prefix="/auth", tags=["auth"])
log = get_logger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _hash(pw: str) -> str:
    return pwd_context.hash(pw)


def _verify(pw: str, hashed: str) -> bool:
    return pwd_context.verify(pw, hashed)


def _token(payload: dict, minutes: int = None) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=minutes or settings.JWT_EXPIRE_MINUTES)
    payload = {**payload, "exp": exp}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")


@router.post("/register", response_model=UserOut)
async def register(user: UserCreate):
    db = get_db()
    exists = await db.users.find_one({"email": user.email})
    if exists:
        raise HTTPException(status_code=409, detail="User already exists")
    doc = {
        "email": user.email,
        "password": _hash(user.password),
        "role": user.role,
        "disabled": False,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    res = await db.users.insert_one(doc)
    return UserOut(id=str(res.inserted_id), email=user.email, role=user.role)


@router.post("/login")
async def login(form: OAuth2PasswordRequestForm = Depends()):
    db = get_db()
    user = await db.users.find_one({"email": form.username})
    success = False
    try:
        if not user or not _verify(form.password, user.get("password", "")):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        token = _token({"sub": str(user["_id"]), "email": user["email"], "role": user.get("role", "analyst")})
        success = True
        return {"access_token": token, "token_type": "bearer"}
    finally:
        await db.auth_logs.insert_one({
            "email": form.username,
            "success": success,
            "time": datetime.now(timezone.utc).isoformat(),
            "source": "local"
        })


@router.get("/me", response_model=UserOut)
async def me(request: Request):
    try:
        auth = request.headers.get('Authorization') or ''
        if not auth.startswith('Bearer '):
            raise HTTPException(status_code=401, detail="Missing token")
        token = auth.split(' ',1)[1]
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        uid = payload.get("sub")
        db = get_db()
        user = await db.users.find_one({"_id": __import__('bson').ObjectId(uid)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return UserOut(id=str(user["_id"]), email=user["email"], role=user.get("role", "analyst"))
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
