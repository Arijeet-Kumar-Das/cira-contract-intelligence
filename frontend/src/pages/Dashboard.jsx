import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getContracts } from '../services/api';
import ContractTable from '../components/ContractTable';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await getContracts();
      setContracts(res.data);
    } catch (err) {
      setError('Failed to load contracts.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter contracts by search query
  const filtered = searchQuery
    ? contracts.filter((c) =>
        c.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.risk_score.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : contracts;

  const highRisk = contracts.filter((c) => c.risk_score === 'high_risk').length;
  const mediumRisk = contracts.filter((c) => c.risk_score === 'medium_risk').length;
  const lowRisk = contracts.filter((c) => c.risk_score === 'low_risk').length;

  const riskPercent = contracts.length > 0
    ? Math.round((highRisk / contracts.length) * 100)
    : 0;

  return (
    <div className="animate-fade-in space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of your contract risk activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {contracts.length} tracked
          </span>
          <button
            onClick={fetchContracts}
            disabled={loading}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshIcon spinning={loading} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 animate-fade-in-up delay-100">
        <StatCard
          label="Total Contracts"
          value={contracts.length}
          icon={<DocIcon />}
          color="slate"
        />
        <StatCard
          label="High Risk"
          value={highRisk}
          icon={<AlertIcon />}
          color="rose"
          subtitle={riskPercent > 0 ? `${riskPercent}% of total` : undefined}
        />
        <StatCard
          label="Medium Risk"
          value={mediumRisk}
          icon={<WarningIcon />}
          color="amber"
        />
        <StatCard
          label="Low Risk"
          value={lowRisk}
          icon={<CheckIcon />}
          color="emerald"
        />
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in-up delay-200">
        <ActionCard
          to="/upload"
          title="Upload Contract"
          desc="Upload a PDF, image, or text file for risk analysis"
          icon="📄"
          accentFrom="from-orange-500"
          accentTo="to-amber-500"
        />
        <ActionCard
          to="/analyze"
          title="Analyze Clause"
          desc="Paste contract text for instant clause-level risk scoring"
          icon="🔍"
          accentFrom="from-blue-500"
          accentTo="to-indigo-500"
        />
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-5 flex flex-col items-center justify-center text-center">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Organization</div>
          <div className="mt-2 text-lg font-extrabold text-slate-900">{user?.organization_name}</div>
          <div className="mt-1 text-xs text-slate-400">{user?.email}</div>
        </div>
      </div>

      {/* ── Contracts Table ── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm animate-fade-in-up delay-300">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {searchQuery ? `Search: "${searchQuery}"` : 'Recent Contracts'}
            </h3>
            <p className="mt-0.5 text-xs text-slate-400">
              {searchQuery
                ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} found`
                : 'Latest uploaded documents and risk analysis'}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-medium text-slate-400">System active</span>
          </div>
        </div>

        <div>
          {loading ? (
            <div className="px-6 py-16">
              <Loader text="Loading contracts..." />
            </div>
          ) : error ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-medium text-rose-600">{error}</p>
              <button
                onClick={fetchContracts}
                className="mt-4 inline-flex h-9 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Retry
              </button>
            </div>
          ) : (
            <ContractTable contracts={filtered} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({ label, value, icon, color, subtitle }) {
  const colors = {
    slate:   { bg: 'bg-slate-50', iconBg: 'bg-slate-100', text: 'text-slate-600', valueTxt: 'text-slate-900' },
    rose:    { bg: 'bg-rose-50/50', iconBg: 'bg-rose-100', text: 'text-rose-600', valueTxt: 'text-rose-700' },
    amber:   { bg: 'bg-amber-50/50', iconBg: 'bg-amber-100', text: 'text-amber-600', valueTxt: 'text-amber-700' },
    emerald: { bg: 'bg-emerald-50/50', iconBg: 'bg-emerald-100', text: 'text-emerald-600', valueTxt: 'text-emerald-700' },
  };
  const c = colors[color] || colors.slate;
  return (
    <div className={`rounded-2xl border border-slate-200/60 ${c.bg} p-5 transition hover:shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${c.iconBg} ${c.text}`}>
          {icon}
        </div>
      </div>
      <div className={`mt-4 text-3xl font-extrabold ${c.valueTxt}`}>{value}</div>
      <div className="mt-1 text-xs font-medium text-slate-500">{label}</div>
      {subtitle && <div className="mt-0.5 text-[11px] text-slate-400">{subtitle}</div>}
    </div>
  );
}

/* ─── Action Card ─── */
function ActionCard({ to, title, desc, icon, accentFrom, accentTo }) {
  return (
    <Link to={to} className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentFrom} ${accentTo} opacity-0 group-hover:opacity-100 transition-opacity`} />
      <div className="text-2xl mb-3">{icon}</div>
      <h4 className="text-sm font-bold text-slate-900 group-hover:text-orange-700 transition-colors">{title}</h4>
      <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{desc}</p>
      <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
        Open
        <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
      </div>
    </Link>
  );
}

/* ─── Icons ─── */
function DocIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5"/></svg>;
}
function AlertIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function WarningIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 8v4m0 4h.01M4.93 19h14.14c1.34 0 2.17-1.46 1.5-2.63L13.5 4.75a1.73 1.73 0 00-3 0L3.43 16.37c-.67 1.17.16 2.63 1.5 2.63z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function CheckIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function RefreshIcon({ spinning }) {
  return <svg className={`h-3.5 w-3.5 ${spinning ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none"><path d="M4 4v5h5M20 20v-5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20.49 9A9 9 0 005.64 5.64L4 7m16 10l-1.64 1.36A9 9 0 014.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}