import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../ui/cn';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: GridIcon },
  { to: '/upload', label: 'Upload', icon: UploadIcon },
  { to: '/analyze', label: 'Analyze', icon: SparkIcon },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* mobile backdrop */}
      <div
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-sm transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[var(--app-sidebar-w)] border-r border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-sm lg:translate-x-0',
          'transition-transform flex flex-col',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <img src={logo} alt="CIRA" className="h-8 w-auto" />
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-700"
            aria-label="Close sidebar"
          >
            <XIcon />
          </button>
        </div>

        <div className="px-3 py-5 flex-1 overflow-y-auto">
          <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
            Workspace
          </div>
          <nav className="mt-3 space-y-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all',
                    isActive
                      ? 'bg-orange-50 text-orange-700 shadow-sm shadow-orange-100/50'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-colors',
                        isActive
                          ? 'border-orange-200 bg-white text-orange-600 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-500',
                      )}
                    >
                      <item.icon />
                    </span>
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Tip card */}
          <div className="mt-8 rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50/50 p-4">
            <div className="text-xs font-bold text-orange-800">💡 Quick Tip</div>
            <div className="mt-1.5 text-[11px] text-orange-700/70 leading-relaxed">
              Upload a contract to build your risk dashboard. Use Analyze for quick clause checks.
            </div>
          </div>
        </div>

        {/* Organization info + logout */}
        <div className="border-t border-slate-100 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-bold shadow-md shadow-orange-500/20">
              {user?.organization_name?.[0]?.toUpperCase() || 'W'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-slate-900 truncate">
                {user?.organization_name || 'Workspace'}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {user?.email || ''}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ─── Icons ─── */

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v10m0-10 4 4m-4-4-4 4M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v2m7 7h2M3 12h2m12.364-6.364 1.414 1.414M5.222 18.778l1.414-1.414M18.778 18.778l-1.414-1.414M5.222 5.222l1.414 1.414" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 7a5 5 0 0 0-2.6 9.27c.38.22.6.64.6 1.08V18a2 2 0 1 0 4 0v-.65c0-.44.22-.86.6-1.08A5 5 0 0 0 12 7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
