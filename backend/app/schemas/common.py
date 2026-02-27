"""
Common Pydantic schemas used across all modules.
"""

from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Optional


class Scenario(BaseModel):
    """Base scenario model."""
    name: str = Field(..., description="Scenario name")
    probability: float = Field(..., ge=0, le=1, description="Scenario probability (0-1)")
    
    @field_validator('probability')
    @classmethod
    def validate_probability(cls, v):
        if v < 0 or v > 1:
            raise ValueError('Probability must be between 0 and 1')
        return v


class OptimizationResponse(BaseModel):
    """Standard response format for optimization results."""
    status: str
    objective_value: float
    stage1_decisions: Dict
    stage2_decisions: List[Dict]
    financial_summary: Dict
    risk_metrics: Dict


class ErrorResponse(BaseModel):
    """Error response format."""
    error: str
    detail: Optional[str] = None
