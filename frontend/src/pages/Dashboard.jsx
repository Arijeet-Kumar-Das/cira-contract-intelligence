import React, { useEffect, useState } from 'react';
import { getContracts } from '../services/api';
import ContractTable from '../components/ContractTable';
import Loader from '../components/Loader';
import PageHeader from '../ui/PageHeader';
import Button from '../ui/Button';

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
      setError('Failed to load contracts.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const highRisk = contracts.filter(
    (c) => c.risk_score === 'high_risk'
  ).length;

  const mediumRisk = contracts.filter(
    (c) => c.risk_score === 'medium_risk'
  ).length;

  const lowRisk = contracts.filter(
    (c) => c.risk_score === 'low_risk'
  ).length;

  return (
    <div className="min-h-screen bg-[#f5f5f3] px-4 py-5">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="flex flex-col gap-4 border-b border-black/[0.05] pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <PageHeader
              title="Dashboard"
              description="Overview of contracts and risk activity."
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-black/[0.06] bg-white px-4 py-2 text-xs font-medium text-slate-600 md:flex">
              {contracts.length} contracts tracked
            </div>

            <Button
              variant="outline"
              onClick={fetchContracts}
              disabled={loading}
              className="
                h-10 rounded-xl border-black/[0.08]
                bg-white px-4 text-sm font-medium
                shadow-none
              "
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* HERO GRID */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          {/* LEFT LARGE PANEL */}
          <div className="rounded-3xl bg-slate-900 p-6 text-white">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.2em] text-orange-300">
                  Contract Intelligence
                </div>

                <h2 className="mt-3 max-w-lg text-3xl font-semibold leading-tight">
                  Monitor legal risks across uploaded agreements.
                </h2>

                <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
                  Analyze clauses, classify risks, and review contract
                  activity from a centralized dashboard.
                </p>
              </div>

              <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-white/10 lg:flex">
                <svg
                  className="h-7 w-7 text-orange-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01"
                  />
                </svg>
              </div>
            </div>

            {/* STATS */}
            <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard
                label="Total"
                value={contracts.length}
              />

              <StatCard
                label="High Risk"
                value={highRisk}
                tone="rose"
              />

              <StatCard
                label="Medium"
                value={mediumRisk}
                tone="amber"
              />

              <StatCard
                label="Low Risk"
                value={lowRisk}
                tone="emerald"
              />
            </div>
          </div>

          {/* RIGHT SIDE PANEL */}
          <div className="grid gap-4">
            <MiniPanel
              title="High Risk"
              value={highRisk}
              subtitle="Requires review"
              tone="rose"
            />

            <MiniPanel
              title="Low Risk"
              value={lowRisk}
              subtitle="Approved contracts"
              tone="emerald"
            />
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="mt-6 rounded-3xl border border-black/[0.05] bg-white">
          {/* TOP */}
          <div className="flex flex-col gap-3 border-b border-black/[0.05] px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Recent Contracts
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Latest uploaded documents and risk analysis.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-xs font-medium text-slate-500">
                System active
              </span>
            </div>
          </div>

          {/* BODY */}
          <div>
            {loading ? (
              <div className="px-6 py-16">
                <Loader text="Loading contracts..." />
              </div>
            ) : error ? (
              <div className="px-6 py-16 text-center">
                <p className="text-sm font-medium text-rose-600">
                  {error}
                </p>

                <Button
                  variant="outline"
                  onClick={fetchContracts}
                  className="mt-4 rounded-xl"
                >
                  Retry
                </Button>
              </div>
            ) : (
              <ContractTable contracts={contracts} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function StatCard({
  label,
  value,
  tone = 'default',
}) {
  const toneStyles = {
    default: 'bg-white/5 text-white',
    rose: 'bg-rose-500/10 text-rose-300',
    amber: 'bg-amber-500/10 text-amber-300',
    emerald: 'bg-emerald-500/10 text-emerald-300',
  };

  return (
    <div
      className={`
        rounded-2xl p-4
        ${toneStyles[tone]}
      `}
    >
      <div className="text-[11px] uppercase tracking-wider opacity-70">
        {label}
      </div>

      <div className="mt-2 text-2xl font-semibold">
        {value}
      </div>
    </div>
  );
}

function MiniPanel({
  title,
  value,
  subtitle,
  tone = 'default',
}) {
  const tones = {
    default: 'bg-white',
    rose: 'bg-rose-50',
    emerald: 'bg-emerald-50',
  };

  return (
    <div
      className={`
        rounded-3xl border border-black/[0.04]
        p-5 ${tones[tone]}
      `}
    >
      <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {title}
      </div>

      <div className="mt-3 text-3xl font-semibold text-slate-900">
        {value}
      </div>

      <div className="mt-2 text-sm text-slate-500">
        {subtitle}
      </div>
    </div>
  );
}

export default Dashboard;