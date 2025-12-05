"""
Error models for chart calculation failures.

Defines structured error responses for API endpoints.
"""

from typing import Optional
from pydantic import BaseModel, Field


class CalculationError(BaseModel):
    """
    Structured error response for chart calculation failures.
    Returned as JSON with appropriate HTTP status code.
    """

    code: str = Field(
        ...,
        description="Machine-readable error code for client handling",
    )
    message: str = Field(
        ...,
        description="English error message for logging and debugging",
    )
    message_de: str = Field(
        ...,
        description="German error message for user display (per constitution)",
    )
    field: Optional[str] = Field(
        None,
        description="Which input field caused the error (for validation errors)",
    )
    retry_after: Optional[int] = Field(
        None,
        description="Seconds to wait before retrying (for rate limit/transient errors)",
    )


# Error code constants for consistent usage (per spec)
ERROR_INVALID_DATE = "INVALID_DATE"
ERROR_DATE_OUT_OF_RANGE = "DATE_OUT_OF_RANGE"
ERROR_INVALID_LOCATION = "INVALID_LOCATION"
ERROR_EPHEMERIS_UNAVAILABLE = "EPHEMERIS_UNAVAILABLE"
ERROR_CALCULATION_FAILED = "CALCULATION_FAILED"
