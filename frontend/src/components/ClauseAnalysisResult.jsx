import React, { useState, useMemo } from 'react';
import RiskBadge from './RiskBadge';

/* ──────────────────────────────────────────────────────────
   ClauseAnalysisResult — Clause-Level Risk Analysis Display
   ──────────────────────────────────────────────────────────
   Renders the full clause-level analysis including:
     - Animated overall risk score card
     - Risk distribution pie chart (CSS-based)
     - Search/filter for clauses
     - Collapsible clause cards with explanations
     - Visual highlighting for high-risk clauses
   ────────────────────────────────────────────────────────── */

const RISK_COLORS = {
  high_risk: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', accent: '#ef4444', glow: 'rgba(239,68,68,0.15)' },
  medium_risk: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', accent: '#f59e0b', glow: 'rgba(245,158,11,0.15)' },
  low_risk: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', accent: '#22c55e', glow: 'rgba(34,197,94,0.15)' },
};

const OVERALL_COLORS = {
  HIGH: { gradient: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', glow: '0 0 40px rgba(220,38,38,0.3)' },
  MEDIUM: { gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', glow: '0 0 40px rgba(245,158,11,0.3)' },
  LOW: { gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', glow: '0 0 40px rgba(34,197,94,0.3)' },
};

export default function ClauseAnalysisResult({ data }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [expandedClauses, setExpandedClauses] = useState(new Set());
  const [scoreAnimated, setScoreAnimated] = useState(false);

  // Trigger score animation on mount
  React.useEffect(() => {
    const timer = setTimeout(() => setScoreAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Filter clauses based on search and risk filter
  const filteredClauses = useMemo(() => {
    if (!data?.clauses) return [];
    return data.clauses.filter((clause) => {
      const matchesSearch = !searchQuery ||
        clause.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clause.explanation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterRisk === 'all' || clause.risk === filterRisk;
      return matchesSearch && matchesFilter;
    });
  }, [data?.clauses, searchQuery, filterRisk]);

  // Toggle clause expansion
  const toggleClause = (id) => {
    setExpandedClauses((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Expand/collapse all
  const expandAll = () => {
    if (expandedClauses.size === filteredClauses.length) {
      setExpandedClauses(new Set());
    } else {
      setExpandedClauses(new Set(filteredClauses.map((c) => c.id)));
    }
  };

  if (!data) return null;

  const { overallRisk, overallScore, totalClauses, riskDistribution, clauses } = data;
  const overallColors = OVERALL_COLORS[overallRisk] || OVERALL_COLORS.MEDIUM;

  return (
    <div className="space-y-5" style={{ animation: 'fadeInUp 0.5s ease-out' }}>

      {/* ─── OVERALL RISK SCORE CARD ─── */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{
          background: overallColors.gradient,
          boxShadow: overallColors.glow,
        }}
      >
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '20px 20px',
        }} />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                Contract Risk Assessment
              </div>
              <h3 className="mt-2 text-2xl font-bold">
                Overall Risk: {overallRisk}
              </h3>
              <p className="mt-2 text-sm text-white/80">
                Analyzed {totalClauses} clause{totalClauses !== 1 ? 's' : ''} from the contract
              </p>
            </div>

            {/* Animated Score Circle */}
            <div className="relative flex-shrink-0">
              <svg width="80" height="80" viewBox="0 0 80 80">
                {/* Background circle */}
                <circle
                  cx="40" cy="40" r="34"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="6"
                />
                {/* Score arc */}
                <circle
                  cx="40" cy="40" r="34"
                  fill="none"
                  stroke="white"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${scoreAnimated ? (overallScore / 100) * 213.6 : 0} 213.6`}
                  transform="rotate(-90 40 40)"
                  style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">{overallScore}</span>
              </div>
            </div>
          </div>

          {/* Risk Distribution Mini-Stats */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { key: 'high_risk', label: 'High', icon: '🔴' },
              { key: 'medium_risk', label: 'Medium', icon: '🟡' },
              { key: 'low_risk', label: 'Low', icon: '🟢' },
            ].map(({ key, label, icon }) => (
              <div key={key} className="rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{icon}</span>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-white/60">
                    {label}
                  </span>
                </div>
                <div className="mt-1 text-lg font-bold">
                  {riskDistribution[key] || 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── RISK DISTRIBUTION PIE CHART ─── */}
      <RiskPieChart distribution={riskDistribution} total={totalClauses} />

      {/* ─── CLAUSE TOOLBAR ─── */}
      <div className="rounded-2xl border border-black/[0.04] bg-white">
        <div className="flex flex-col gap-3 border-b border-black/[0.04] px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Clause Analysis
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {filteredClauses.length} of {totalClauses} clauses shown
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search clauses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-48 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
              />
            </div>

            {/* Filter */}
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
            >
              <option value="all">All Risks</option>
              <option value="high_risk">High Risk</option>
              <option value="medium_risk">Medium Risk</option>
              <option value="low_risk">Low Risk</option>
            </select>

            {/* Expand/Collapse */}
            <button
              onClick={expandAll}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              {expandedClauses.size === filteredClauses.length ? 'Collapse' : 'Expand'} All
            </button>
          </div>
        </div>

        {/* ─── CLAUSE CARDS ─── */}
        <div className="p-4 space-y-3">
          {filteredClauses.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-slate-500">No clauses match your filters.</p>
            </div>
          ) : (
            filteredClauses.map((clause, index) => (
              <ClauseCard
                key={clause.id}
                clause={clause}
                index={index}
                isExpanded={expandedClauses.has(clause.id)}
                onToggle={() => toggleClause(clause.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Inline keyframe animation */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; max-height: 0; }
          to   { opacity: 1; max-height: 600px; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.2); }
          50%      { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
        }
      `}</style>
    </div>
  );
}


/* ──────────────────────────────────────────────────────────
   ClauseCard — Individual Clause Analysis Card
   ────────────────────────────────────────────────────────── */

function ClauseCard({ clause, index, isExpanded, onToggle }) {
  const colors = RISK_COLORS[clause.risk] || RISK_COLORS.medium_risk;
  const isHighRisk = clause.risk === 'high_risk';

  return (
    <div
      className="rounded-xl border transition-all duration-300 cursor-pointer"
      style={{
        borderColor: colors.border,
        backgroundColor: isHighRisk ? colors.bg : '#fafafa',
        animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
        ...(isHighRisk ? { animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both, pulseGlow 3s ease-in-out infinite` } : {}),
      }}
      onClick={onToggle}
    >
      {/* Header */}
      <div className="flex items-start gap-3 px-4 py-3.5">
        {/* Clause Number */}
        <div
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
          style={{ background: colors.accent }}
        >
          {clause.id}
        </div>

        {/* Clause Text Preview */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}
             style={{ color: colors.text }}>
            {clause.text}
          </p>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <RiskBadge risk={clause.risk} />

          {/* Confidence Badge */}
          <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 tabular-nums">
            {Math.round(clause.confidence * 100)}%
          </span>

          {/* Expand Icon */}
          <svg
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div
          className="border-t px-4 py-3.5"
          style={{
            borderColor: colors.border,
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          {/* Explanation */}
          <div className="rounded-lg p-3" style={{ backgroundColor: `${colors.glow}` }}>
            <div className="flex items-start gap-2">
              <ExplanationIcon color={colors.accent} />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: colors.accent }}>
                  AI Explanation
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">
                  {clause.explanation}
                </p>
              </div>
            </div>
          </div>

          {/* Risk Categories Tags */}
          {clause.risk_categories && clause.risk_categories.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Detected Indicators
              </p>
              <div className="flex flex-wrap gap-1.5">
                {clause.risk_categories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-md px-2 py-1 text-[10px] font-semibold"
                    style={{
                      backgroundColor: colors.bg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Meta Info */}
          <div className="mt-3 flex items-center gap-4 text-[10px] text-slate-400">
            <span>Clause #{clause.id}</span>
            <span>•</span>
            <span>{clause.text.length} characters</span>
            <span>•</span>
            <span>Confidence: {(clause.confidence * 100).toFixed(1)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}


/* ──────────────────────────────────────────────────────────
   RiskPieChart — CSS-based Risk Distribution Chart
   ────────────────────────────────────────────────────────── */

function RiskPieChart({ distribution, total }) {
  if (!total || total === 0) return null;

  const high = distribution.high_risk || 0;
  const medium = distribution.medium_risk || 0;
  const low = distribution.low_risk || 0;

  const highPct = (high / total) * 100;
  const mediumPct = (medium / total) * 100;
  const lowPct = (low / total) * 100;

  // Build conic gradient stops
  const stops = [];
  let currentAngle = 0;

  if (highPct > 0) {
    stops.push(`#ef4444 ${currentAngle}% ${currentAngle + highPct}%`);
    currentAngle += highPct;
  }
  if (mediumPct > 0) {
    stops.push(`#f59e0b ${currentAngle}% ${currentAngle + mediumPct}%`);
    currentAngle += mediumPct;
  }
  if (lowPct > 0) {
    stops.push(`#22c55e ${currentAngle}% ${currentAngle + lowPct}%`);
    currentAngle += lowPct;
  }

  const gradient = stops.length > 0
    ? `conic-gradient(${stops.join(', ')})`
    : 'conic-gradient(#e2e8f0 0% 100%)';

  return (
    <div className="rounded-2xl border border-black/[0.04] bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900">Risk Distribution</h3>
      <p className="mt-0.5 text-xs text-slate-500">Clause risk breakdown</p>

      <div className="mt-4 flex items-center gap-6">
        {/* Pie */}
        <div
          className="h-24 w-24 flex-shrink-0 rounded-full"
          style={{
            background: gradient,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center shadow-inner">
              <span className="text-lg font-bold text-slate-800">{total}</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2.5 flex-1">
          {[
            { label: 'High Risk', count: high, pct: highPct, color: '#ef4444' },
            { label: 'Medium Risk', count: medium, pct: mediumPct, color: '#f59e0b' },
            { label: 'Low Risk', count: low, pct: lowPct, color: '#22c55e' },
          ].map(({ label, count, pct, color }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
              <div className="flex-1 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">{label}</span>
                <span className="text-xs text-slate-500 tabular-nums">
                  {count} ({pct.toFixed(0)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


/* ──────────────────────────────────────────────────────────
   Icon Components
   ────────────────────────────────────────────────────────── */

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function ExplanationIcon({ color }) {
  return (
    <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
