import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login(form.username, form.password);
      authLogin(data.user, data.access, data.refresh);
      // Redirect back to where the user came from, or default to /events
      const from = location.state?.from || '/events';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.data?.detail || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-112px)] flex">

      {/* ── Left: animated branding panel ── */}
      <div className="hidden lg:flex lg:w-1/2 hero-bg flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute top-10 right-10 w-56 h-56 rounded-full
                        bg-white/5 blur-2xl animate-pulse-slow" />
        <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full
                        bg-pcps-red/20 blur-3xl animate-pulse-slow" style={{animationDelay:'1s'}} />
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <div className="w-[500px] h-[500px] rounded-full border-[60px] border-white animate-spin-slow" />
        </div>

        <div className="relative z-10 text-center max-w-sm">
          {/* Logo */}
          <div className="mb-8 animate-float">
            <img src="/pcps-logo.png" alt="PCPS College"
              className="h-24 w-auto object-contain mx-auto drop-shadow-2xl"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                document.getElementById('login-logo-fallback').style.display = 'flex';
              }} />
            <div id="login-logo-fallback" style={{display:'none'}}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pcps-red to-pcps-red-dark
                         items-center justify-center mx-auto shadow-glow-red">
              <span className="text-white font-black text-4xl">P</span>
            </div>
          </div>

          <h2 className="text-4xl font-black text-white mb-3 animate-fade-up">
            Welcome Back
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4 animate-fade-up stagger-1">
            <div className="h-0.5 w-12 bg-gradient-to-r from-transparent to-white/50 rounded" />
            <span className="text-blue-200 text-sm font-semibold uppercase tracking-widest">
              PCPS Portal
            </span>
            <div className="h-0.5 w-12 bg-gradient-to-l from-transparent to-white/50 rounded" />
          </div>
          <p className="text-blue-200 leading-relaxed animate-fade-up stagger-2">
            Sign in to discover events, register your attendance, and manage your college experience.
          </p>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-3 mt-8">
            {[
              { icon:'🎟', label:'Easy RSVP' },
              { icon:'📅', label:'All Events' },
              { icon:'📊', label:'Dashboard' },
              { icon:'🔒', label:'Secure Auth' },
            ].map(({ icon, label }, i) => (
              <div key={label}
                className={`glass-card p-3 text-center animate-fade-up`}
                style={{animationDelay:`${0.1 + i * 0.08}s`}}>
                <div className="text-2xl mb-1">{icon}</div>
                <p className="text-white text-xs font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: login form ── */}
      <div className="flex-1 flex items-center justify-center bg-pcps-offwhite px-6 py-12 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30"
          style={{backgroundImage:'radial-gradient(circle at 20px 20px, #E2E8F0 1px, transparent 0)', backgroundSize:'40px 40px'}} />

        <div className="relative w-full max-w-sm animate-scale-in">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img src="/pcps-logo.png" alt="PCPS" className="h-16 mx-auto"
              onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 overflow-hidden relative">
            {/* Top color bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5
                            bg-gradient-to-r from-pcps-blue via-pcps-red to-pcps-blue" />

            <div className="pt-2 mb-7">
              <h1 className="text-2xl font-black text-pcps-blue">Sign In</h1>
              <p className="text-pcps-muted text-sm mt-1">Access your PCPS account</p>
            </div>

            {/* Error alert */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border-l-4 border-pcps-red
                              text-pcps-red text-sm rounded-xl px-4 py-3 mb-5 animate-scale-in">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">Username</label>
                <div className={`relative transition-all duration-200 ${focused==='username' ? 'scale-[1.01]' : ''}`}>
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused==='username' ? 'text-pcps-blue' : 'text-gray-400'}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input name="username" value={form.username} onChange={handleChange}
                    onFocus={() => setFocused('username')} onBlur={() => setFocused('')}
                    required autoComplete="username" autoFocus placeholder="your_username"
                    className="form-input pl-11" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">Password</label>
                <div className={`relative transition-all duration-200 ${focused==='password' ? 'scale-[1.01]' : ''}`}>
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused==='password' ? 'text-pcps-blue' : 'text-gray-400'}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input name="password" type="password" value={form.password} onChange={handleChange}
                    onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                    required autoComplete="current-password" placeholder="••••••••"
                    className="form-input pl-11" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="btn-red w-full py-3 text-base mt-2 shadow-lg">
                {loading ? (
                  <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>Sign In</>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <p className="text-sm text-pcps-muted">
                Don't have an account?{' '}
                <Link to="/register" className="text-pcps-red font-bold hover:text-pcps-red-dark transition-colors">
                  Create one free →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
