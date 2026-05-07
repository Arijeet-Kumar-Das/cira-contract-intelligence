import React from 'react';

export default function Spinner({ label = 'Loading' }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-600">
      <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-orange-600" />
      <span>{label}</span>
    </div>
  );
}

