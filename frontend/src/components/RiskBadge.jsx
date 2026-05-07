import React from 'react';

const riskConfig = {
  low_risk: {
    label: 'Low Risk',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    dot: 'bg-emerald-600',
    ring: 'ring-1 ring-inset ring-emerald-200',
  },
  medium_risk: {
    label: 'Medium Risk',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    dot: 'bg-amber-600',
    ring: 'ring-1 ring-inset ring-amber-200',
  },
  high_risk: {
    label: 'High Risk',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    dot: 'bg-rose-600',
    ring: 'ring-1 ring-inset ring-rose-200',
  },
  unknown: {
    label: 'Unknown',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    dot: 'bg-slate-500',
    ring: 'ring-1 ring-inset ring-slate-200',
  },
};

const RiskBadge = ({ risk }) => {
  const config = riskConfig[risk] || riskConfig.unknown;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text} ${config.ring}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default RiskBadge;
