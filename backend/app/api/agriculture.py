"""
Agriculture Module API Endpoint
"""

from fastapi import APIRouter, HTTPException
from app.schemas.agriculture import AgricultureInput
from app.schemas.common import OptimizationResponse, ErrorResponse
from app.optimizers.agriculture import AgricultureOptimizer

router = APIRouter(prefix="/agriculture", tags=["Agriculture"])


@router.post("/optimize", response_model=OptimizationResponse)
async def optimize_agriculture(input_data: AgricultureInput):
    """
    Optimize agricultural production planning under weather uncertainty.
    
    This endpoint solves a two-stage stochastic programming problem:
    - Stage 1: Determine optimal acres to plant per crop
    - Stage 2: Determine recourse actions (purchasing, allocation) for each weather scenario
    
    Returns:
    - Optimal planting plan
    - Expected profit
    - Scenario-specific decisions
    - Risk metrics
    """
    try:
        # Convert Pydantic model to dict
        data_dict = input_data.model_dump()
        
        # Initialize and solve optimizer
        optimizer = AgricultureOptimizer(data_dict)
        results = optimizer.solve()
        
        return results
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/health")
async def health_check():
    """Health check endpoint for agriculture module."""
    return {"status": "healthy", "module": "agriculture"}
