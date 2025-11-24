from pydantic import BaseModel, Field
from typing import List, Optional


class ChartRequest(BaseModel):
    """Birth data input from user"""
    firstName: str = Field(..., min_length=2, max_length=50)
    birthDate: str = Field(..., description="Format: TT.MM.JJJJ")
    birthTime: str = Field(..., description="Format: HH:MM")
    birthTimeApproximate: bool = Field(default=False)
    birthPlace: str = Field(..., min_length=2, max_length=200)


class TypeInfo(BaseModel):
    """Human Design Type information"""
    code: str
    label: str
    shortDescription: str


class AuthorityInfo(BaseModel):
    """Decision Authority information"""
    code: str
    label: str
    decisionHint: str


class ProfileInfo(BaseModel):
    """Profile information"""
    code: str  # e.g., "4/1"
    shortDescription: str


class Center(BaseModel):
    """Energy Center information"""
    name: str
    code: str
    defined: bool


class Channel(BaseModel):
    """Channel information"""
    code: str  # e.g., "34-20"


class Gate(BaseModel):
    """Gate information"""
    code: str  # e.g., "34.2"


class IncarnationCross(BaseModel):
    """Incarnation Cross information"""
    code: str
    name: str
    gates: List[str]  # e.g., ["15", "10", "5", "35"]


class ChartResponse(BaseModel):
    """Complete HD chart data response"""
    firstName: str
    type: TypeInfo
    authority: AuthorityInfo
    profile: ProfileInfo
    centers: List[Center]
    channels: List[Channel]
    gates: dict  # {"conscious": [...], "unconscious": [...]}
    incarnationCross: IncarnationCross
    shortImpulse: str
