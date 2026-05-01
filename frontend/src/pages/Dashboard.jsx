import React, { useEffect, useState } from 'react';
import { getContracts } from '../services/api';
import ContractTable from '../components/ContractTable';
import Loader from '../components/Loader';

const Dashboard = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await getContracts();
      setContracts(res.data);
    } catch (err) {
      setError('Failed to load contracts. Is the backend running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Overview of all analyzed contracts
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Contracts"
          value={contracts.length}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          color="indigo"
        />
        <StatCard
          label="High Risk"
          value={contracts.filter((c) => c.risk_score === 'high_risk').length}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
          color="red"
        />
        <StatCard
          label="Medium Risk"
          value={contracts.filter((c) => c.risk_score === 'medium_risk').length}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="amber"
        />
        <StatCard
          label="Low Risk"
          value={contracts.filter((c) => c.risk_score === 'low_risk').length}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="emerald"
        />
      </div>

      {/* Contracts Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Recent Contracts</h2>
          <button
            onClick={fetchContracts}
            disabled={loading}
            className="text-xs text-slate-400 hover:text-indigo-400 transition-colors disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <Loader text="Loading contracts..." />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={fetchContracts}
              className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <ContractTable contracts={contracts} />
        )}
      </div>
    </div>
  );
};

/* ─── Stat Card Component ─── */

const colorMap = {
  indigo: {
    bg: 'bg-indigo-500/10',
    icon: 'text-indigo-400',
    border: 'border-indigo-500/20',
  },
  red: {
    bg: 'bg-red-500/10',
    icon: 'text-red-400',
    border: 'border-red-500/20',
  },
  amber: {
    bg: 'bg-amber-500/10',
    icon: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    icon: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
};

function StatCard({ label, value, icon, color }) {
  const c = colorMap[color] || colorMap.indigo;
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-5`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`${c.icon}`}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}

export default Dashboard;
