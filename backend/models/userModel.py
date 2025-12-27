from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal

RoleType = Literal['admin','analyst','viewer']

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    role: RoleType = 'analyst'

class UserOut(BaseModel):
    id: str
    email: EmailStr
    role: RoleType
    disabled: bool = False

class UserLogin(BaseModel):
    email: EmailStr
    password: str

