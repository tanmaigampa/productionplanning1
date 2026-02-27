"""
Base Optimizer Class for Two-Stage Stochastic Programming

This abstract class provides the foundation for all sector-specific optimizers.
Each sector (Agriculture, Manufacturing, Pharma, Food) extends this base class
and implements its own decision variables, constraints, and objectives.
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from pulp import LpProblem, LpMaximize, LpVariable, lpSum, LpStatus, value
import numpy as np


class BaseOptimizer(ABC):
    """
    Abstract base class for two-stage stochastic optimization.
    
    Two-Stage Framework:
    - Stage 1: "Here-and-now" decisions made before uncertainty is revealed
    - Stage 2: "Wait-and-see" recourse actions taken after scenario unfolds
    
    Objective: Maximize Expected Profit
    E[Profit] = Σ(probability_s × profit_s) for all scenarios s
    
    Where: profit_s = revenue_s - cost_s
    """
    
    def __init__(self, input_data: Dict[str, Any]):
        """
        Initialize optimizer with input data.
        
        Args:
            input_data: Dictionary containing all problem parameters
        """
        self.input_data = input_data
        self.problem = LpProblem(f"{self.__class__.__name__}_Optimization", LpMaximize)
        self.variables = {}
        self.scenarios = input_data.get('scenarios', [])
        self.results = {}
        
    @abstractmethod
    def define_stage1_variables(self) -> None:
        """
        Define Stage 1 decision variables (before uncertainty).
        
        Examples:
        - Agriculture: Acres to plant per crop
        - Manufacturing: Base production quantities
        - Pharma: Number of batches to run
        - Food: Initial production volumes
        """
        pass
    
    @abstractmethod
    def define_stage2_variables(self) -> None:
        """
        Define Stage 2 recourse variables (after uncertainty revealed).
        
        These are scenario-dependent adaptive decisions.
        
        Examples:
        - Agriculture: Vendor purchases, channel allocation, waste
        - Manufacturing: Overtime, subcontracting, inventory
        - Pharma: Rework, disposal, emergency purchases
        - Food: Spoilage handling, emergency sourcing
        """
        pass
    
    @abstractmethod
    def define_constraints(self) -> None:
        """
        Define all problem constraints.
        
        Types of constraints:
        1. Resource constraints (capacity, land, time)
        2. Flow balance (input = output + inventory)
        3. Quality/Service level requirements
        4. Logical constraints (non-negativity, etc.)
        """
        pass
    
    @abstractmethod
    def define_objective(self) -> None:
        """
        Define objective function: Maximize Expected Profit.
        
        Expected Profit = Σ(p_s × (Revenue_s - Cost_s)) for all scenarios
        
        Where:
        - p_s = probability of scenario s
        - Revenue_s = sales revenue in scenario s
        - Cost_s = total costs in scenario s (Stage 1 + Stage 2)
        """
        pass
    
    def validate_input(self) -> bool:
        """
        Validate input data before optimization.
        
        Returns:
            True if input is valid, raises ValueError otherwise
        """
        # Check scenarios exist
        if not self.scenarios:
            raise ValueError("At least one scenario must be defined")
        
        # Check probabilities sum to 1
        total_prob = sum(s.get('probability', 0) for s in self.scenarios)
        if not np.isclose(total_prob, 1.0, atol=1e-6):
            raise ValueError(f"Scenario probabilities must sum to 1.0, got {total_prob}")
        
        # Check all probabilities are non-negative
        for i, scenario in enumerate(self.scenarios):
            prob = scenario.get('probability', 0)
            if prob < 0:
                raise ValueError(f"Scenario {i} has negative probability: {prob}")
        
        return True
    
    def solve(self) -> Dict[str, Any]:
        """
        Main optimization workflow.
        
        Returns:
            Dictionary containing optimization results
        """
        # Step 1: Validate input
        self.validate_input()
        
        # Step 2: Build optimization model
        self.define_stage1_variables()
        self.define_stage2_variables()
        self.define_constraints()
        self.define_objective()
        
        # Step 3: Solve
        self.problem.solve()
        
        # Step 4: Check solution status
        status = LpStatus[self.problem.status]
        if status != 'Optimal':
            raise RuntimeError(f"Optimization failed with status: {status}")
        
        # Step 5: Extract results
        self.extract_results()
        
        return self.results
    
    @abstractmethod
    def extract_results(self) -> None:
        """
        Extract and format optimization results.
        
        Should populate self.results with:
        - Stage 1 decisions
        - Stage 2 decisions (per scenario)
        - Expected profit
        - Scenario-specific profits
        - Cost breakdown
        - Risk metrics
        """
        pass
    
    def calculate_risk_metrics(self, scenario_profits: List[float]) -> Dict[str, float]:
        """
        Calculate risk metrics from scenario profits.
        
        Args:
            scenario_profits: List of profit values for each scenario
            
        Returns:
            Dictionary of risk metrics
        """
        scenario_profits = np.array(scenario_profits)
        
        return {
            'expected_profit': float(np.mean(scenario_profits)),
            'std_deviation': float(np.std(scenario_profits)),
            'min_profit': float(np.min(scenario_profits)),
            'max_profit': float(np.max(scenario_profits)),
            'profit_range': float(np.max(scenario_profits) - np.min(scenario_profits)),
        }
    
    def get_variable_value(self, variable) -> float:
        """
        Safely extract variable value, returning 0 if None.
        
        Args:
            variable: PuLP variable
            
        Returns:
            Variable value or 0.0
        """
        if variable is None:
            return 0.0
        val = value(variable)
        return float(val) if val is not None else 0.0
