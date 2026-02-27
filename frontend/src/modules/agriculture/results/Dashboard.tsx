// Dashboard.tsx — legacy file, superseded by AgricultureModule results view.
// Kept as a stub to avoid breaking imports in old code paths.
import React from 'react';
import type { AgricultureResult } from '@/types/agriculture';

interface DashboardProps {
  results: AgricultureResult;
  onBack: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onBack }) => (
  <div className="min-h-screen bg-[#0f1117] flex items-center justify-center text-slate-400">
    <div className="text-center">
      <p className="mb-4">Results are displayed inside the Agriculture Module wizard.</p>
      <button onClick={onBack} className="btn-secondary">← Go Back</button>
    </div>
  </div>
);

export default Dashboard;
