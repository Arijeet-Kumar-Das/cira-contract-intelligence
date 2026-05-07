import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('All fields are required');
    setLoading(true);
    try {
      const res = await loginUser(email, password);
      const d = res.data;
      login(d.access_token, {
        id: d.user_id,
        email,
        organization_id: d.organization_id,
        organization_name: d.organization_name,
      });
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-orange-50/30 px-4 gradient-mesh">
      {/* Decorative */}
      <div className="fixed top-20 left-[10%] h-72 w-72 rounded-full bg-orange-400/[0.06] blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-[15%] h-56 w-56 rounded-full bg-sky-400/[0.05] blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/">
            <img src={logo} alt="CIRA" className="h-14 w-auto" />
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-sm p-8 shadow-xl shadow-slate-900/[0.04]">
          <h1 className="text-2xl font-extrabold text-slate-900 text-center">Sign in</h1>
          <p className="mt-2 text-sm text-slate-500 text-center">Access your contract workspace</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white"
                placeholder="••••••••"
              />
            </div>
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 py-3 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:shadow-orange-600/30 active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-orange-600 hover:text-orange-700 transition">
              Create workspace
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          <Link to="/" className="hover:text-slate-600 transition">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
