/**
 * TypeScript type definitions for Agriculture Module
 * Prices and plants_per_acre are per-crop.
 */

export interface FarmResources {
  total_land: number;
}

export interface Crop {
  name: string;
  base_yield_per_plant: number;      // lbs per plant
  plants_per_acre: number;           // plants per acre (crop-specific)
  materials_cost_per_acre: number;   // $/acre
  purchase_price_per_lb: number;     // $/lb from local vendor
  requirement: number;               // lbs required to deliver
  selling_price: number;             // $/lb to buyer
  selling_price_own_store: number;   // $/lb at own store (surplus)
}

export interface AgricultureScenario {
  name: string;
  probability: number;
  yield_changes: Record<string, number>; // fraction: 0.1 = +10%
}

export interface AgricultureInput {
  farm_resources: FarmResources;
  crops: Crop[];
  scenarios: AgricultureScenario[];
}

// --- Result types ---

export interface ScenarioResult {
  scenario_name: string;
  probability: number;
  yield_realized: Record<string, number>;
  vendor_purchases: Record<string, number>;
  own_store_sales: Record<string, number>;
  own_store_revenue: number;
  vendor_cost: number;
  profit: number;
}

export interface AgricultureResult {
  status: string;
  objective_value: number;
  stage1_decisions: {
    planting_plan: Record<string, number>;
    total_land_used: number;
    land_utilization_pct: number;
  };
  stage2_decisions: ScenarioResult[];
  financial_summary: {
    buyer_revenue: number;
    planting_cost: number;
    expected_profit: number;
    worst_case_profit: number;
    best_case_profit: number;
    profit_range: number;
  };
  risk_metrics: {
    expected_profit: number;
    std_deviation: number;
    min_profit: number;
    max_profit: number;
    profit_range: number;
  };
}
