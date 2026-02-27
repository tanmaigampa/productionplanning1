"""
Agriculture Optimizer - Two-Stage Stochastic Model

Stage 1:  How many acres to plant per berry variety (before weather known)
Stage 2:  After weather scenario unfolds:
          - P_ij: Buy from local vendor if yield < requirement
          - S_ij: Sell surplus at own store

Prices and plants_per_acre are now per-crop.
"""

from typing import Dict, Any
from pulp import LpVariable, lpSum
from ..base import BaseOptimizer


class AgricultureOptimizer(BaseOptimizer):

    def __init__(self, input_data: Dict[str, Any]):
        super().__init__(input_data)

        farm = input_data['farm_resources']
        self.total_land = farm['total_land']

        self.crops = input_data['crops']
        self.crop_names = [c['name'] for c in self.crops]
        self.crop_data = {c['name']: c for c in self.crops}

    def define_stage1_variables(self) -> None:
        self.variables['acres'] = {
            crop: LpVariable(f"acres_{crop}", lowBound=0)
            for crop in self.crop_names
        }

    def define_stage2_variables(self) -> None:
        self.variables['vendor_purchase'] = {
            (crop, s['name']): LpVariable(f"buy_{crop}_{s['name']}", lowBound=0)
            for crop in self.crop_names
            for s in self.scenarios
        }
        self.variables['own_store_sales'] = {
            (crop, s['name']): LpVariable(f"own_{crop}_{s['name']}", lowBound=0)
            for crop in self.crop_names
            for s in self.scenarios
        }

    def define_constraints(self) -> None:
        # 1. Total land constraint
        self.problem += (
            lpSum(self.variables['acres'][crop] for crop in self.crop_names) <= self.total_land,
            "total_land_limit"
        )

        # 2. Supply >= requirement per crop, per scenario
        for crop in self.crop_names:
            info = self.crop_data[crop]
            base_yield = info['base_yield_per_plant']
            plants_per_acre = info['plants_per_acre']
            requirement = info['requirement']

            for scenario in self.scenarios:
                s_name = scenario['name']
                yield_change = scenario['yield_changes'].get(crop, 0.0)
                yield_multiplier = 1.0 + yield_change

                realized_yield = (
                    self.variables['acres'][crop]
                    * plants_per_acre
                    * base_yield
                    * yield_multiplier
                )

                self.problem += (
                    realized_yield
                    + self.variables['vendor_purchase'][(crop, s_name)]
                    - self.variables['own_store_sales'][(crop, s_name)]
                    >= requirement,
                    f"supply_demand_{crop}_{s_name}"
                )

    def define_objective(self) -> None:
        """
        Maximize Expected Profit:
          Fixed:    sum_i(selling_price_i * requirement_i)
          Variable: E[ sum_i(selling_price_own_store_i * S_ij) ]
          Cost:     sum_i(materials_cost_i * acres_i) + E[sum_i(purchase_price_i * P_ij)]
        """
        buyer_revenue = sum(
            self.crop_data[c]['selling_price'] * self.crop_data[c]['requirement']
            for c in self.crop_names
        )

        planting_cost = lpSum(
            self.crop_data[c]['materials_cost_per_acre'] * self.variables['acres'][c]
            for c in self.crop_names
        )

        expected_own_store = lpSum(
            scenario['probability']
            * self.crop_data[c]['selling_price_own_store']
            * self.variables['own_store_sales'][(c, scenario['name'])]
            for c in self.crop_names
            for scenario in self.scenarios
        )

        expected_vendor_cost = lpSum(
            scenario['probability']
            * self.crop_data[c]['purchase_price_per_lb']
            * self.variables['vendor_purchase'][(c, scenario['name'])]
            for c in self.crop_names
            for scenario in self.scenarios
        )

        self.problem += (
            buyer_revenue + expected_own_store - planting_cost - expected_vendor_cost,
            "maximize_expected_profit"
        )

    def extract_results(self) -> None:
        planting_plan = {
            c: self.get_variable_value(self.variables['acres'][c])
            for c in self.crop_names
        }
        total_land_used = sum(planting_plan.values())

        buyer_revenue = sum(
            self.crop_data[c]['selling_price'] * self.crop_data[c]['requirement']
            for c in self.crop_names
        )

        planting_cost = sum(
            self.crop_data[c]['materials_cost_per_acre'] * planting_plan[c]
            for c in self.crop_names
        )

        scenario_results = []
        scenario_profits = []

        for scenario in self.scenarios:
            s_name = scenario['name']
            prob = scenario['probability']

            vendor_purchases = {
                c: self.get_variable_value(self.variables['vendor_purchase'][(c, s_name)])
                for c in self.crop_names
            }
            own_store_sales = {
                c: self.get_variable_value(self.variables['own_store_sales'][(c, s_name)])
                for c in self.crop_names
            }

            yield_realized = {}
            for c in self.crop_names:
                info = self.crop_data[c]
                yc = scenario['yield_changes'].get(c, 0.0)
                yield_realized[c] = (
                    planting_plan[c]
                    * info['plants_per_acre']
                    * info['base_yield_per_plant']
                    * (1.0 + yc)
                )

            own_store_rev = sum(
                self.crop_data[c]['selling_price_own_store'] * own_store_sales[c]
                for c in self.crop_names
            )
            vendor_cost = sum(
                self.crop_data[c]['purchase_price_per_lb'] * vendor_purchases[c]
                for c in self.crop_names
            )

            profit = buyer_revenue + own_store_rev - planting_cost - vendor_cost
            scenario_profits.append(profit)

            scenario_results.append({
                'scenario_name': s_name,
                'probability': prob,
                'yield_realized': yield_realized,
                'vendor_purchases': vendor_purchases,
                'own_store_sales': own_store_sales,
                'own_store_revenue': own_store_rev,
                'vendor_cost': vendor_cost,
                'profit': profit,
            })

        # Probability-weighted expected profit  Σ p_s * profit_s
        expected_profit = sum(
            sc['probability'] * sp
            for sc, sp in zip(scenario_results, scenario_profits)
        )
        risk = self.calculate_risk_metrics(scenario_profits)
        risk['expected_profit'] = expected_profit   # override simple mean with weighted mean

        self.results = {
            'status': 'optimal',
            'objective_value': self.get_variable_value(self.problem.objective),
            'stage1_decisions': {
                'planting_plan': planting_plan,
                'total_land_used': total_land_used,
                'land_utilization_pct': (total_land_used / self.total_land * 100) if self.total_land else 0,
            },
            'stage2_decisions': scenario_results,
            'financial_summary': {
                'buyer_revenue': buyer_revenue,
                'planting_cost': planting_cost,
                'expected_profit': expected_profit,
                'worst_case_profit': risk['min_profit'],
                'best_case_profit': risk['max_profit'],
                'profit_range': risk['profit_range'],
            },
            'risk_metrics': risk,
        }
