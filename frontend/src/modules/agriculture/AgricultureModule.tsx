import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Leaf,
  CloudRain,
  ClipboardList,
  BarChart3,
  Loader2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Sprout,
  ShoppingCart,
  Store,
} from 'lucide-react';
import type {
  FarmResources,
  Crop,
  AgricultureScenario,
  AgricultureInput,
  AgricultureResult,
} from '@/types/agriculture';
import { agricultureService } from '@/services/agricultureService';

// ----- Defaults -----
const emptyFarm: FarmResources = { total_land: 0 };
const emptyCrop = (): Crop => ({
  name: '',
  base_yield_per_plant: 0,
  plants_per_acre: 0,
  materials_cost_per_acre: 0,
  purchase_price_per_lb: 0,
  requirement: 0,
  selling_price: 0,
  selling_price_own_store: 0,
});
const emptyScenario = (cropNames: string[]): AgricultureScenario => ({
  name: '',
  probability: 0,
  yield_changes: Object.fromEntries(cropNames.map(n => [n, 0])),
});

// ----- Helpers -----
const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtMoney = (n: number) => '$' + fmt(n, 2);

// ----- Step config -----
const STEPS = [
  { label: 'Farm & Crops', icon: Leaf },
  { label: 'Scenarios', icon: CloudRain },
  { label: 'Review & Optimize', icon: ClipboardList },
  { label: 'Results', icon: BarChart3 },
];

// ----- Label + Input helper -----
const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
      {label}
      {hint && <span className="ml-1.5 normal-case font-normal text-slate-500">{hint}</span>}
    </label>
    {children}
  </div>
);

// ================================================================
export const AgricultureModule: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [farm, setFarm] = useState<FarmResources>(emptyFarm);
  const [crops, setCrops] = useState<Crop[]>([emptyCrop()]);
  const [scenarios, setScenarios] = useState<AgricultureScenario[]>([emptyScenario([''])]);
  const [results, setResults] = useState<AgricultureResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // ----- Crop helpers -----
  const updateCrop = (i: number, field: keyof Crop, val: any) => {
    setCrops(prev => {
      const next = prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c);
      if (field === 'name') {
        const oldName = prev[i].name, newName = val as string;
        setScenarios(scs => scs.map(s => {
          const yc = { ...s.yield_changes };
          if (oldName in yc) { yc[newName] = yc[oldName]; delete yc[oldName]; }
          return { ...s, yield_changes: yc };
        }));
      }
      return next;
    });
  };
  const addCrop = () => { setCrops(p => [...p, emptyCrop()]); setScenarios(scs => scs.map(s => ({ ...s, yield_changes: { ...s.yield_changes, '': 0 } }))); };
  const removeCrop = (i: number) => {
    const removed = crops[i].name;
    setCrops(p => p.filter((_, idx) => idx !== i));
    setScenarios(scs => scs.map(s => { const yc = { ...s.yield_changes }; delete yc[removed]; return { ...s, yield_changes: yc }; }));
  };

  // ----- Scenario helpers -----
  const addScenario = () => setScenarios(p => [...p, emptyScenario(crops.map(c => c.name))]);
  const removeScenario = (i: number) => setScenarios(p => p.filter((_, idx) => idx !== i));
  const updateScenarioName = (i: number, val: string) => setScenarios(p => p.map((s, idx) => idx === i ? { ...s, name: val } : s));
  const updateScenarioProb = (i: number, val: string) => {
    const parsed = parseFloat(val);
    setScenarios(p => p.map((s, idx) => idx === i ? { ...s, probability: Number.isFinite(parsed) ? parsed : 0 } : s));
  };
  const updateYieldChange = (sIdx: number, cropName: string, val: string) => {
    const parsed = parseFloat(val);
    setScenarios(p => p.map((s, idx) =>
      idx === sIdx ? { ...s, yield_changes: { ...s.yield_changes, [cropName]: Number.isFinite(parsed) ? parsed : 0 } } : s
    ));
  };

  const totalProb = scenarios.reduce((s, sc) => s + (sc.probability || 0), 0);
  const probOk = Math.abs(totalProb - 1) < 0.001;

  // ----- Optimize -----
  const handleOptimize = async () => {
    setIsOptimizing(true); setError(null);
    const input: AgricultureInput = {
      farm_resources: farm,
      crops,
      scenarios: scenarios.map(s => ({
        ...s,
        yield_changes: Object.fromEntries(
          crops.map(c => { const v = s.yield_changes[c.name]; return [c.name, Number.isFinite(v) ? v : 0.0]; })
        ),
      })),
    };
    try {
      const res = await agricultureService.optimize(input);
      setResults(res); setStep(4);
    } catch (e: any) {
      setError(e.message || 'Optimization failed');
    } finally {
      setIsOptimizing(false);
    }
  };

  // ================================================================
  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-200">

      {/* ── Top Bar ── */}
      <div className="border-b border-[#2a3348] bg-[#0f1117]/90 backdrop-blur-md sticky top-0 z-20 px-6 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-all"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-base font-bold text-white leading-tight tracking-tight">Agriculture Module</h1>
          <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Weather-Driven Crop Planning</p>
        </div>
      </div>

      {/* ── Stepper ── */}
      <div className="border-b border-[#2a3348] bg-[#181d27]/60 backdrop-blur-sm sticky top-[57px] z-10 px-6 py-3 flex items-center gap-1 overflow-x-auto">
        {STEPS.map(({ label, icon: Icon }, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <React.Fragment key={n}>
              <div className="flex items-center gap-2 whitespace-nowrap px-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${done ? 'bg-teal-500/20 border border-teal-500/40 text-teal-400' :
                  active ? 'bg-sky-500/20  border border-sky-500/40  text-sky-400 shadow-glow-sky' :
                    'bg-white/5     border border-white/10     text-slate-500'
                  }`}>
                  {done ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                </div>
                <span className={`text-xs font-semibold transition-colors ${done ? 'text-teal-400' :
                  active ? 'text-sky-400' :
                    'text-slate-500'
                  }`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px min-w-6 mx-1 rounded transition-colors duration-500 ${done ? 'bg-teal-500/40' : 'bg-white/8'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* ── Step 1: Farm & Crops ── */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-white">Farm & Crops</h2>
              <p className="text-sm text-slate-500 mt-1">Define your land resources and crop varieties.</p>
            </div>

            {/* Total Land */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Sprout size={16} className="text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Farm Resources</h3>
              </div>
              <Field label="Total Available Land" hint="acres">
                <input
                  type="number"
                  className="input-field w-48"
                  value={farm.total_land || ''}
                  onChange={e => setFarm(f => ({ ...f, total_land: parseFloat(e.target.value) || 0 }))}
                  placeholder="e.g. 100"
                />
              </Field>
            </div>

            {/* Crop cards */}
            {crops.map((crop, i) => (
              <div key={i} className="card">
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-sky-400">{i + 1}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">Crop Variety {i + 1}</h3>
                  </div>
                  {crops.length > 1 && (
                    <button
                      onClick={() => removeCrop(i)}
                      className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-400/40 px-2.5 py-1.5 rounded-lg bg-red-500/5 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Variety Name">
                    <input className="input-field" value={crop.name} onChange={e => updateCrop(i, 'name', e.target.value)} placeholder="e.g. Tomato" />
                  </Field>
                  <Field label="Yield" hint="lbs / plant">
                    <input type="number" step="0.01" className="input-field" value={crop.base_yield_per_plant || ''} onChange={e => updateCrop(i, 'base_yield_per_plant', parseFloat(e.target.value) || 0)} placeholder="e.g. 1.97" />
                  </Field>
                  <Field label="Plants per Acre">
                    <input type="number" step="1" className="input-field" value={crop.plants_per_acre || ''} onChange={e => updateCrop(i, 'plants_per_acre', parseFloat(e.target.value) || 0)} placeholder="e.g. 1000" />
                  </Field>
                  <Field label="Materials Cost" hint="$ / acre">
                    <input type="number" step="1" className="input-field" value={crop.materials_cost_per_acre || ''} onChange={e => updateCrop(i, 'materials_cost_per_acre', parseFloat(e.target.value) || 0)} placeholder="e.g. 200" />
                  </Field>
                  <Field label="Vendor Purchase Price" hint="$ / lb">
                    <input type="number" step="0.01" className="input-field" value={crop.purchase_price_per_lb || ''} onChange={e => updateCrop(i, 'purchase_price_per_lb', parseFloat(e.target.value) || 0)} placeholder="e.g. 0.50" />
                  </Field>
                  <Field label="Requirement" hint="lbs">
                    <input type="number" step="100" className="input-field" value={crop.requirement || ''} onChange={e => updateCrop(i, 'requirement', parseFloat(e.target.value) || 0)} placeholder="e.g. 5000" />
                  </Field>
                  <Field label="Market Selling Price" hint="$ / lb">
                    <input type="number" step="0.01" className="input-field" value={crop.selling_price || ''} onChange={e => updateCrop(i, 'selling_price', parseFloat(e.target.value) || 0)} placeholder="e.g. 0.80" />
                  </Field>
                  <Field label="Own Store Price" hint="$ / lb">
                    <input type="number" step="0.01" className="input-field" value={crop.selling_price_own_store || ''} onChange={e => updateCrop(i, 'selling_price_own_store', parseFloat(e.target.value) || 0)} placeholder="e.g. 1.20" />
                  </Field>
                </div>
              </div>
            ))}

            <button className="btn-secondary w-full justify-center py-3 border-dashed" onClick={addCrop}>
              <Plus size={15} /> Add Another Crop
            </button>
          </div>
        )}

        {/* ── Step 2: Scenarios ── */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white">Weather Scenarios</h2>
                <p className="text-sm text-slate-500 mt-1">Model uncertainty with probability-weighted outcomes.</p>
              </div>
              <button className="btn-primary" onClick={addScenario}><Plus size={14} /> Add Scenario</button>
            </div>

            {scenarios.map((sc, sIdx) => (
              <div key={sIdx} className="card space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CloudRain size={15} className="text-sky-400" />
                    <h3 className="text-sm font-bold text-white">Scenario {sIdx + 1}</h3>
                  </div>
                  {scenarios.length > 1 && (
                    <button onClick={() => removeScenario(sIdx)} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/20 px-2.5 py-1.5 rounded-lg bg-red-500/5 hover:bg-red-500/10 transition-all">
                      <Trash2 size={12} /> Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Scenario Name">
                    <input className="input-field" value={sc.name} onChange={e => updateScenarioName(sIdx, e.target.value)} placeholder="e.g. Drought" />
                  </Field>
                  <Field label="Probability" hint="0 – 1">
                    <input type="number" step="0.01" min="0" max="1" className="input-field" value={sc.probability || ''} onChange={e => updateScenarioProb(sIdx, e.target.value)} placeholder="e.g. 0.3" />
                  </Field>
                </div>
                {crops.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Yield Changes per Crop</p>
                    <div className="grid grid-cols-2 gap-4">
                      {crops.map(crop => (
                        <Field key={crop.name} label={crop.name || '(unnamed)'} hint="fraction: 0.1 = +10%">
                          <input type="number" step="0.01" className="input-field" value={sc.yield_changes[crop.name] ?? ''} onChange={e => updateYieldChange(sIdx, crop.name, e.target.value)} placeholder="e.g. −0.2" />
                        </Field>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className={`flex items-center gap-2 text-sm font-semibold px-4 py-3 rounded-lg border ${probOk ? 'bg-teal-500/10 border-teal-500/20 text-teal-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
              {probOk ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              Total probability: <span className="font-mono">{totalProb.toFixed(2)}</span>
              {!probOk && ' — must equal 1.0'}
            </div>
          </div>
        )}

        {/* ── Step 3: Review ── */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-white">Review & Optimize</h2>
              <p className="text-sm text-slate-500 mt-1">Confirm your inputs before running the solver.</p>
            </div>

            <div className="card space-y-5">
              {/* Farm summary */}
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Farm</p>
                <div className="flex items-center gap-3">
                  <span className="badge badge-blue">Land</span>
                  <span className="font-mono text-sm text-white">{farm.total_land} acres</span>
                </div>
              </div>

              <hr className="border-[#2a3348]" />

              {/* Crops summary */}
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Crops ({crops.length})</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-[#2a3348]">
                      <th className="pb-2 pr-4 text-xs text-slate-500 font-semibold">Variety</th>
                      <th className="pb-2 pr-4 text-xs text-slate-500 font-semibold text-right">Req (lbs)</th>
                      <th className="pb-2 pr-4 text-xs text-slate-500 font-semibold text-right">Market ($/lb)</th>
                      <th className="pb-2 text-xs text-slate-500 font-semibold text-right">Vendor ($/lb)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crops.map(c => (
                      <tr key={c.name} className="border-b border-[#2a3348]/50 last:border-0">
                        <td className="py-2 pr-4 font-medium text-white">{c.name}</td>
                        <td className="py-2 pr-4 text-right font-mono text-slate-300">{fmt(c.requirement)}</td>
                        <td className="py-2 pr-4 text-right font-mono text-slate-300">${c.selling_price}</td>
                        <td className="py-2 text-right font-mono text-slate-300">${c.purchase_price_per_lb}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <hr className="border-[#2a3348]" />

              {/* Scenarios summary */}
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Scenarios ({scenarios.length})</p>
                <div className="flex flex-wrap gap-2">
                  {scenarios.map(s => (
                    <span key={s.name} className="badge badge-violet">
                      {s.name || 'Unnamed'} · {(s.probability * 100).toFixed(0)}%
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div><strong>Optimization Error:</strong> {error}</div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 4: Results ── */}
        {step === 4 && results && (() => {
          const { stage1_decisions: s1, stage2_decisions: s2, financial_summary: fin } = results;
          return (
            <div className="space-y-6 animate-fade-in">

              {/* Financial KPIs */}
              <div>
                <h2 className="text-xl font-bold text-white mb-5">Optimization Results</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="stat-card border-amber-500/20 bg-amber-500/5">
                    <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1"><DollarSign size={11} /> Expected Profit</p>
                    <p className="text-2xl font-extrabold text-amber-300 font-mono mt-1">{fmtMoney(fin.expected_profit)}</p>
                  </div>
                  <div className="stat-card">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1"><TrendingUp size={11} /> Best Case</p>
                    <p className="text-xl font-bold text-green-400 font-mono mt-1">{fmtMoney(fin.best_case_profit)}</p>
                  </div>
                  <div className="stat-card">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1"><TrendingDown size={11} /> Worst Case</p>
                    <p className="text-xl font-bold text-red-400 font-mono mt-1">{fmtMoney(fin.worst_case_profit)}</p>
                  </div>
                  <div className="stat-card">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1"><Sprout size={11} /> Planting Cost</p>
                    <p className="text-xl font-bold text-slate-200 font-mono mt-1">{fmtMoney(fin.planting_cost)}</p>
                  </div>
                </div>
              </div>

              {/* Stage 1 — Planting Plan */}
              <div className="card">
                <div className="flex items-center gap-2 mb-5">
                  <Sprout size={16} className="text-sky-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Stage 1 · Optimal Planting Plan</h3>
                  <span className="badge badge-blue ml-auto">{fmt(s1.total_land_used, 2)} / {farm.total_land} acres used</span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#2a3348]">
                      <th className="text-left pb-2 pr-4 text-xs text-slate-500 font-semibold">Variety</th>
                      <th className="text-right pb-2 pr-4 text-xs text-slate-500 font-semibold">Acres Planted</th>
                      <th className="text-right pb-2 pr-4 text-xs text-slate-500 font-semibold">Plants / Acre</th>
                      <th className="text-right pb-2 text-xs text-slate-500 font-semibold">Typical Yield (lbs)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crops.map(crop => {
                      const acres = s1.planting_plan[crop.name] ?? 0;
                      return (
                        <tr key={crop.name} className="border-b border-[#2a3348]/50 last:border-0">
                          <td className="py-2 pr-4 font-semibold text-white">{crop.name}</td>
                          <td className="py-2 pr-4 text-right font-mono text-slate-300">{fmt(acres, 2)}</td>
                          <td className="py-2 pr-4 text-right font-mono text-slate-300">{fmt(crop.plants_per_acre)}</td>
                          <td className="py-2 text-right font-mono text-slate-300">{fmt(acres * crop.plants_per_acre * crop.base_yield_per_plant)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Stage 2 — Scenario Decisions */}
              <div className="card">
                <div className="flex items-center gap-2 mb-5">
                  <CloudRain size={16} className="text-violet-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Stage 2 · Scenario Decisions</h3>
                </div>
                <div className="space-y-6">
                  {s2.map(sc => (
                    <div key={sc.scenario_name}>
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className="text-sm font-bold text-white">{sc.scenario_name}</span>
                        <span className="badge badge-violet">{(sc.probability * 100).toFixed(0)}% probability</span>
                        <span className="badge badge-green ml-auto">Profit: {fmtMoney(sc.profit)}</span>
                      </div>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-[#2a3348]">
                            <th className="text-left pb-2 pr-3 text-slate-500 font-semibold">Variety</th>
                            <th className="text-right pb-2 pr-3 text-slate-500 font-semibold"><span className="flex items-center gap-1 justify-end"><Sprout size={10} /> Yield (lbs)</span></th>
                            <th className="text-right pb-2 pr-3 text-slate-500 font-semibold"><span className="flex items-center gap-1 justify-end"><ShoppingCart size={10} /> Purch. (lbs)</span></th>
                            <th className="text-right pb-2 text-slate-500 font-semibold"><span className="flex items-center gap-1 justify-end"><Store size={10} /> Own Store (lbs)</span></th>
                          </tr>
                        </thead>
                        <tbody>
                          {crops.map(crop => (
                            <tr key={crop.name} className="border-b border-[#2a3348]/50 last:border-0">
                              <td className="py-1.5 pr-3 font-semibold text-white">{crop.name}</td>
                              <td className="py-1.5 pr-3 text-right font-mono text-slate-300">{fmt(sc.yield_realized[crop.name] ?? 0)}</td>
                              <td className={`py-1.5 pr-3 text-right font-mono ${(sc.vendor_purchases[crop.name] ?? 0) > 0 ? 'text-amber-400 font-semibold' : 'text-slate-600'}`}>
                                {fmt(sc.vendor_purchases[crop.name] ?? 0)}
                              </td>
                              <td className={`py-1.5 text-right font-mono ${(sc.own_store_sales[crop.name] ?? 0) > 0 ? 'text-teal-400 font-semibold' : 'text-slate-600'}`}>
                                {fmt(sc.own_store_sales[crop.name] ?? 0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          );
        })()}

        {/* ── Navigation ── */}
        <div className="flex justify-between mt-10 pt-6 border-t border-[#2a3348]">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
            className="btn-secondary disabled:opacity-30"
          >
            <ChevronLeft size={15} /> Previous
          </button>

          {step < 3 && (
            <button onClick={() => setStep(s => s + 1)} className="btn-primary">
              Next <ChevronRight size={15} />
            </button>
          )}
          {step === 3 && (
            <button
              onClick={handleOptimize}
              disabled={isOptimizing || !probOk}
              className="btn-primary disabled:opacity-40"
            >
              {isOptimizing ? <><Loader2 size={15} className="animate-spin" /> Solving…</> : <>Run Optimization <ChevronRight size={15} /></>}
            </button>
          )}
          {step === 4 && (
            <button onClick={() => { setResults(null); setError(null); setStep(3); }} className="btn-secondary">
              Run Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgricultureModule;
