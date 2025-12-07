from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from uuid import UUID


class EmailCaptureRequest(BaseModel):
    """Email capture request"""
    email: EmailStr


class EmailCaptureResponse(BaseModel):
    """Email capture response"""
    success: bool
    id: int
    message: str


class LeadEmail(BaseModel):
    """Lead email database model"""
    id: UUID
    email: str
    status: str = "pending"
    source: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    notes: Optional[str] = None
    consent_given: bool = False
    consent_date: Optional[datetime] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
