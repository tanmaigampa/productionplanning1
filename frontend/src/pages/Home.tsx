import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  GitBranch,
  BarChart3,
  ArrowRight,
  Wheat,
  Factory,
  FlaskConical,
  Package,
  ChevronRight,
  Zap,
} from 'lucide-react';

const FEATURES = [
  {
    icon: GitBranch,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 border-sky-500/20',
    title: 'Two-Stage Pipeline',
    desc: 'Commit first-stage decisions, then adapt each scenario with full recourse optimization.',
  },
  {
    icon: BarChart3,
    color: 'text-teal-400',
    bg: 'bg-teal-500/10 border-teal-500/20',
    title: 'Scenario Modelling',
    desc: 'Build probability-weighted scenarios and stress-test your plan against every outcome.',
  },
  {
    icon: TrendingUp,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    title: 'Profit Maximization',
    desc: 'Linear-programming solver maximizes expected profit while respecting all operational constraints.',
  },
];

const SECTORS = [
  { icon: Wheat, label: 'Agriculture', sub: 'Weather-driven crop planning', active: true },
  { icon: Factory, label: 'Manufacturing', sub: 'Demand-driven production', active: false },
  { icon: FlaskConical, label: 'Pharma', sub: 'Quality risk management', active: false },
  { icon: Package, label: 'Food & Beverage', sub: 'Perishable production', active: false },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const sectorsRef = useRef<HTMLDivElement>(null);

  const scrollToSectors = () => {
    sectorsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#0f1117] dot-grid text-slate-200">

      {/* ── Navbar ── */}
      <header className="border-b border-[#2a3348] bg-[#0f1117]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="w-full max-w-[1600px] mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center shadow-glow-sky">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">Quantix</span>
              <span className="ml-2 text-xs text-slate-500 font-mono uppercase tracking-widest">v1.0</span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full max-w-[1600px] mx-auto px-10 sm:px-16 py-16 space-y-32" style={{ zoom: 1.2 }}>

        {/* ── Hero ── */}
        <section className="text-center animate-slide-up mt-12">
          <h1 className="text-6xl sm:text-[5.5rem] font-extrabold text-white tracking-tight leading-[1.1] mb-8">
            Plan with Confidence.<br />
            <span className="text-sky-400">Execute with Precision.</span>
          </h1>

          <p className="text-xl sm:text-2xl text-slate-400 max-w-4xl mx-auto leading-relaxed mb-12">
            A next-generation optimization that models uncertainty and prepares your production strategy for every scenario
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <button
              onClick={scrollToSectors}
              className="btn-primary text-lg px-9 py-4 animate-pulse-glow"
            >
              Select Sector <ArrowRight size={20} />
            </button>
          </div>

          {/* Quick stats row */}
          <div className="mt-20 grid grid-cols-3 gap-px bg-[#2a3348] rounded-xl overflow-hidden max-w-3xl mx-auto border border-[#2a3348]">
            {[
              { label: 'Solver', value: 'PuLP / CBC' },
              { label: 'Method', value: '2-Stage SP' },
              { label: 'Sectors', value: '4 (1 Active)' },
            ].map(s => (
              <div key={s.label} className="bg-[#181d27] px-8 py-5 text-center">
                <p className="text-sm text-slate-500 uppercase tracking-wider font-medium mb-2">{s.label}</p>
                <p className="text-lg font-semibold text-white font-mono">{s.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">Three core capabilities that power every optimization run.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="card group hover:border-[#3b455c]/50 border border-[#2a3348] bg-[#13161f] transition-all duration-300 p-10 flex flex-col items-start text-left">
                <div className={`w-14 h-14 rounded-xl border flex items-center justify-center mb-6 ${bg}`}>
                  <Icon size={26} className={color} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-base text-slate-400 leading-relaxed font-normal">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Sectors ── */}
        <section ref={sectorsRef} className="pb-20">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-white mb-4">Supported Sectors</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 hover:cursor-default">
            {SECTORS.map(({ icon: Icon, label, sub, active }) => (
              <button
                key={label}
                onClick={() => active && navigate('/agriculture')}
                disabled={!active}
                className={`card flex flex-col items-center text-center group transition-all duration-300 p-10 bg-[#13161f] border border-[#2a3348] ${active
                  ? 'cursor-pointer hover:border-[#3b455c]/50'
                  : 'opacity-50 cursor-not-allowed'
                  }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${active ? 'bg-sky-500/10 border border-sky-500/20' : 'bg-white/5 border border-white/10'}`}>
                  <Icon size={26} className={active ? 'text-sky-400' : 'text-slate-500'} />
                </div>
                <p className="font-bold text-lg text-white mb-2">{label}</p>
                <p className={`text-sm tracking-wide ${active ? 'text-teal-400' : 'text-slate-500'}`}>{sub}</p>

                <div className={`mt-8 flex items-center gap-1 text-sm font-semibold tracking-wide ${active ? 'text-sky-400 hover:text-sky-300' : 'text-slate-500'}`}>
                  {active ? 'Open' : 'Coming soon'} <ChevronRight size={16} />
                </div>
              </button>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#2a3348] mt-10 py-8">
        <p className="text-center text-xs text-slate-600 font-mono">
          Quantix · Two-Stage Stochastic Production Planning · API at{' '}
          <a href="http://localhost:8000/docs" className="text-sky-600 hover:text-sky-400 transition-colors">localhost:8000/docs</a>
        </p>
      </footer>
    </div>
  );
};

export default Home;
