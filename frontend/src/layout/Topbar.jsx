import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../ui/cn';
import { useAuth } from '../context/AuthContext';

const pathTitles = [
  { match: /^\/dashboard$/, title: 'Dashboard' },
  { match: /^\/upload/, title: 'Upload Contract' },
  { match: /^\/analyze/, title: 'Clause Analyzer' },
  { match: /^\/contracts\//, title: 'Contract Details' },
];

export default function Topbar({ onOpenSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const title =
    pathTitles.find((p) => p.match.test(location.pathname))?.title || 'CIRA';

  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to dashboard with a search query (handled by Dashboard)
    if (searchQuery.trim()) {
      navigate(`/dashboard?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm"
          aria-label="Open sidebar"
        >
          <MenuIcon />
        </button>

        <div className="min-w-0">
          <div className="text-sm font-bold text-slate-900">{title}</div>
          <div className="text-[11px] text-slate-400">
            {user?.organization_name || 'Workspace'}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 transition focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100">
            <SearchIcon />
            <input
              className="w-48 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
              placeholder="Search contracts…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* User avatar */}
          <div
            className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white grid place-items-center text-xs font-bold select-none shadow-md shadow-orange-500/15"
            title={user?.email}
          >
            {user?.email?.[0]?.toUpperCase() || '?'}
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-slate-400">
      <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2" />
      <path d="M16 16l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
