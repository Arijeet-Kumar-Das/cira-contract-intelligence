import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { cn } from '../ui/cn';

const nav = [
  { to: '/', label: 'Dashboard', icon: GridIcon },
  { to: '/upload', label: 'Upload', icon: UploadIcon },
  { to: '/analyze', label: 'Analyze', icon: SparkIcon },
];

export default function Sidebar({ mobileOpen, onClose }) {
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
          'fixed inset-y-0 left-0 z-50 w-[var(--app-sidebar-w)] border-r border-slate-200 bg-white shadow-sm lg:translate-x-0',
          'transition-transform',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-orange-600 text-white shadow-sm shadow-orange-600/20">
              <LogoMark />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-slate-900">
                CIRA
              </div>
              <div className="text-[11px] text-slate-500 -mt-0.5">
                Contract Intelligence
              </div>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-700"
            aria-label="Close sidebar"
          >
            <XIcon />
          </button>
        </div>

        <div className="px-3 py-4">
          <div className="px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Workspace
          </div>
          <nav className="mt-3 space-y-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold',
                    isActive
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-slate-700 hover:bg-slate-100',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'grid h-9 w-9 place-items-center rounded-xl border',
                        isActive
                          ? 'border-orange-100 bg-white text-orange-700'
                          : 'border-slate-200 bg-white text-slate-600',
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

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-bold text-slate-900">Tip</div>
            <div className="mt-1 text-xs text-slate-600 leading-relaxed">
              Upload a contract to build your risk dashboard. Use Analyze for quick clause checks.
            </div>
          </div>
        </div>

        <div className="mt-auto border-t border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">
                Demo Workspace
              </div>
              <div className="text-xs text-slate-500 truncate">
                Local environment
              </div>
            </div>
            <div className="h-9 w-9 rounded-full bg-slate-200" />
          </div>
        </div>
      </aside>
    </>
  );
}

function LogoMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 7.5h8M8 12h8M8 16.5h5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3v10m0-10 4 4m-4-4-4 4M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3v2m7 7h2M3 12h2m12.364-6.364 1.414 1.414M5.222 18.778l1.414-1.414M18.778 18.778l-1.414-1.414M5.222 5.222l1.414 1.414"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 7a5 5 0 0 0-2.6 9.27c.38.22.6.64.6 1.08V18a2 2 0 1 0 4 0v-.65c0-.44.22-.86.6-1.08A5 5 0 0 0 12 7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

