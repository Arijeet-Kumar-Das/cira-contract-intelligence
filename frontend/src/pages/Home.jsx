import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 glass">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="CIRA" className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/" className="inline-flex h-10 items-center rounded-xl bg-orange-600 px-5 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 active:scale-[.97]">
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
                  Sign in
                </Link>
                <Link to="/register" className="inline-flex h-10 items-center rounded-xl bg-orange-600 px-5 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 active:scale-[.97]">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-20 gradient-mesh">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-[10%] h-72 w-72 rounded-full bg-orange-400/[0.07] blur-3xl" />
        <div className="absolute top-40 right-[15%] h-56 w-56 rounded-full bg-sky-400/[0.06] blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-5">
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <div className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-xs font-semibold text-orange-700">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
              Intelligent Contract Risk Analysis
            </div>

            {/* Headline */}
            <h1 className="animate-fade-in-up delay-100 mt-8 max-w-3xl text-5xl font-black tracking-tight text-slate-900 leading-[1.1] sm:text-6xl">
              Protect your business from{' '}
              <span className="relative">
                <span className="relative z-10 text-orange-600">risky contracts</span>
                <svg className="absolute -bottom-1 left-0 w-full h-3 text-orange-200" viewBox="0 0 200 8" preserveAspectRatio="none">
                  <path d="M0 7 Q50 0 100 5 Q150 0 200 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>

            <p className="animate-fade-in-up delay-200 mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Upload legal documents, analyze each clause for hidden dangers, and get instant risk scores — all from one intelligent dashboard.
            </p>

            {/* CTA */}
            <div className="animate-fade-in-up delay-300 mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to="/register" className="inline-flex h-12 items-center rounded-2xl bg-orange-600 px-7 text-sm font-bold text-white shadow-xl shadow-orange-600/25 transition hover:bg-orange-700 hover:shadow-orange-600/30 active:scale-[.97]">
                Start Free Analysis
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </Link>
              <Link to="/login" className="inline-flex h-12 items-center rounded-2xl border border-slate-200 bg-white px-7 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[.97]">
                Sign in to workspace
              </Link>
            </div>

            {/* Stats row */}
            <div className="animate-fade-in-up delay-400 mt-16 flex items-center gap-10 text-center">
              {[
                { value: '50+', label: 'Risk Patterns' },
                { value: '10', label: 'Legal Categories' },
                { value: '<3s', label: 'Analysis Time' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-extrabold text-slate-900">{s.value}</div>
                  <div className="mt-1 text-xs font-medium text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
              Core Capabilities
            </div>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to manage contract risk
            </h2>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: '📄', title: 'Smart Document Upload', desc: 'Upload PDF, images, or text files. Our OCR engine extracts text from scanned documents automatically.' },
              { icon: '🔍', title: 'Clause-Level Analysis', desc: 'Every clause is individually scored for risk, with detailed explanations and category tags.' },
              { icon: '⚖️', title: '50+ Legal Risk Patterns', desc: 'Detects liability waivers, non-competes, unilateral control, arbitration clauses, and more.' },
              { icon: '📊', title: 'Risk Dashboard', desc: 'Centralized view of all contracts with risk distribution, trend tracking, and quick filters.' },
              { icon: '🏢', title: 'Multi-Tenant Workspaces', desc: 'Each organization gets isolated contract storage with team-based access control.' },
              { icon: '🤖', title: 'Hybrid ML + Rules Engine', desc: 'Combines a trained ML model with 50+ weighted legal rules for accurate classification.' },
            ].map((f) => (
              <div key={f.title} className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-orange-200/60 hover:-translate-y-0.5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-lg border border-orange-100">
                  {f.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Ready to analyze your contracts?
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Create a free workspace and start identifying risks in minutes.
          </p>
          <div className="mt-8">
            <Link to="/register" className="inline-flex h-12 items-center rounded-2xl bg-orange-600 px-8 text-sm font-bold text-white shadow-xl shadow-orange-600/25 transition hover:bg-orange-700 active:scale-[.97]">
              Create Free Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="CIRA" className="h-7 w-auto opacity-70" />
          </div>
          <div className="text-xs text-slate-400">
            © {new Date().getFullYear()} CIRA — Contract Intelligence & Risk Analysis
          </div>
        </div>
      </footer>
    </div>
  );
}
