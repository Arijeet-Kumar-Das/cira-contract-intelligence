import React from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '../ui/cn';

const pathTitles = [
  { match: /^\/$/, title: 'Dashboard' },
  { match: /^\/upload/, title: 'Upload contract' },
  { match: /^\/analyze/, title: 'Analyze clause' },
  { match: /^\/contracts\//, title: 'Contract details' },
];

export default function Topbar({ onOpenSidebar }) {
  const location = useLocation();
  const title =
    pathTitles.find((p) => p.match.test(location.pathname))?.title || 'CIRA';

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm"
          aria-label="Open sidebar"
        >
          <MenuIcon />
        </button>

        <div className="min-w-0">
          <div className="text-sm font-extrabold text-slate-900">{title}</div>
          <div className="text-xs text-slate-500">
            Contract risk analysis workspace
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <SearchIcon />
            <input
              className={cn(
                'w-56 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none',
              )}
              placeholder="Search (placeholder)"
              disabled
            />
          </div>

          <button
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
            disabled
          >
            <BellIcon />
            <span className="hidden sm:inline">Alerts</span>
          </button>

          <div className="h-10 w-10 rounded-full bg-slate-200" />
        </div>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 6h16M4 12h16M4 18h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M16 16l5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 17H6a4 4 0 0 0 2-3.5V10a4 4 0 1 1 8 0v3.5A4 4 0 0 0 18 17h-3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M10 17a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

