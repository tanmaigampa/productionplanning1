"""
Unit tests for Agriculture Optimizer
"""

import pytest
import json
from pathlib import Path
from app.optimizers.agriculture import AgricultureOptimizer


def load_example_data():
    """Load example agriculture input data."""
    example_file = Path(__file__).parent.parent.parent / 'examples' / 'agriculture_example.json'
    with open(example_file) as f:
        return json.load(f)


class TestAgricultureOptimizer:
    """Test suite for AgricultureOptimizer."""
    
    def test_optimizer_initialization(self):
        """Test that optimizer initializes correctly."""
        data = load_example_data()
        optimizer = AgricultureOptimizer(data)
        
        assert optimizer.total_land == 100
        assert optimizer.plants_per_acre == 1000
        assert len(optimizer.crop_names) == 2
        assert len(optimizer.scenarios) == 3
    
    def test_scenario_probabilities_sum_to_one(self):
        """Test that scenario probabilities sum to 1."""
        data = load_example_data()
        optimizer = AgricultureOptimizer(data)
        
        total_prob = sum(s['probability'] for s in optimizer.scenarios)
        assert abs(total_prob - 1.0) < 0.001
    
    def test_optimization_runs_successfully(self):
        """Test that optimization completes without errors."""
        data = load_example_data()
        optimizer = AgricultureOptimizer(data)
        
        results = optimizer.solve()
        
        assert results['status'] == 'optimal'
        assert 'stage1_decisions' in results
        assert 'stage2_decisions' in results
        assert 'financial_summary' in results
    
    def test_land_constraint_respected(self):
        """Test that total planted land doesn't exceed available land."""
        data = load_example_data()
        optimizer = AgricultureOptimizer(data)
        
        results = optimizer.solve()
        total_land_used = results['stage1_decisions']['total_land_used']
        
        assert total_land_used <= data['farm_resources']['total_land']
    
    def test_expected_profit_is_positive(self):
        """Test that expected profit is positive (for reasonable inputs)."""
        data = load_example_data()
        optimizer = AgricultureOptimizer(data)
        
        results = optimizer.solve()
        expected_profit = results['financial_summary']['expected_profit']
        
        # With reasonable prices, profit should be positive
        assert expected_profit > 0
    
    def test_all_scenarios_have_decisions(self):
        """Test that recourse decisions exist for all scenarios."""
        data = load_example_data()
        optimizer = AgricultureOptimizer(data)
        
        results = optimizer.solve()
        stage2 = results['stage2_decisions']
        
        assert len(stage2) == len(data['scenarios'])
        
        for scenario_result in stage2:
            assert 'scenario_name' in scenario_result
            assert 'profit' in scenario_result
            assert 'vendor_purchases' in scenario_result
    
    def test_invalid_probabilities_raise_error(self):
        """Test that invalid probabilities raise ValueError."""
        data = load_example_data()
        
        # Make probabilities not sum to 1
        data['scenarios'][0]['probability'] = 0.5
        data['scenarios'][1]['probability'] = 0.5
        data['scenarios'][2]['probability'] = 0.5  # Total = 1.5
        
        optimizer = AgricultureOptimizer(data)
        
        with pytest.raises(ValueError):
            optimizer.solve()
    
    def test_risk_metrics_calculated(self):
        """Test that risk metrics are calculated correctly."""
        data = load_example_data()
        optimizer = AgricultureOptimizer(data)
        
        results = optimizer.solve()
        risk_metrics = results['risk_metrics']
        
        assert 'expected_profit' in risk_metrics
        assert 'std_deviation' in risk_metrics
        assert 'min_profit' in risk_metrics
        assert 'max_profit' in risk_metrics
        
        # Standard deviation should be non-negative
        assert risk_metrics['std_deviation'] >= 0
        
        # Min should be <= Max
        assert risk_metrics['min_profit'] <= risk_metrics['max_profit']


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
