"""
Pydantic schemas for Agriculture module API endpoints.
Two-stage stochastic model.
Prices and plants_per_acre are now per-crop.
"""

from pydantic import BaseModel, Field, field_validator
from typing import List, Dict
from .common import Scenario


class FarmResources(BaseModel):
    """Farm-level constraints."""
    total_land: float = Field(..., gt=0, description="Total available land in acres")


class Crop(BaseModel):
    """Individual crop (berry variety) configuration."""
    name: str = Field(..., description="Crop name (e.g., 'Mohawk')")
    base_yield_per_plant: float = Field(..., gt=0, description="Base yield in lbs per plant")
    plants_per_acre: float = Field(..., gt=0, description="Number of plants per acre for this variety")
    materials_cost_per_acre: float = Field(..., ge=0, description="Materials/planting cost per acre ($)")
    purchase_price_per_lb: float = Field(..., ge=0, description="Cost to purchase from local vendor ($/lb)")
    requirement: float = Field(..., ge=0, description="Required delivery in lbs")
    selling_price: float = Field(..., ge=0, description="Selling price to buyer ($/lb)")
    selling_price_own_store: float = Field(..., ge=0, description="Selling price at own store for surplus ($/lb)")


class AgricultureScenario(Scenario):
    """Weather scenario for agriculture."""
    yield_changes: Dict[str, float] = Field(
        ...,
        description="Yield change fractions per crop (e.g., {'Mohawk': 0.1} for +10%)"
    )


class AgricultureInput(BaseModel):
    """Complete input for agriculture optimization."""
    farm_resources: FarmResources
    crops: List[Crop] = Field(..., min_length=1, description="List of berry varieties to optimize")
    scenarios: List[AgricultureScenario] = Field(..., min_length=1, description="Weather scenarios")

    @field_validator('scenarios')
    @classmethod
    def validate_scenario_probabilities(cls, v):
        total_prob = sum(s.probability for s in v)
        if not (0.999 <= total_prob <= 1.001):
            raise ValueError(f'Scenario probabilities must sum to 1.0, got {total_prob}')
        return v
