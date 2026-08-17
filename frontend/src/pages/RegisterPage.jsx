import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/authService';

const ROLE_OPTIONS = [
  { value: 'attendee',  icon: '🎟', label: 'Attendee',  desc: 'Browse and register for events' },
  { value: 'organizer', icon: '🗓', label: 'Organizer', desc: 'Create and manage events'        },
];

const FIELDS = [
  { name:'username',  label:'Username',         type:'text',     ph:'john_doe',         ac:'username'     },
  { name:'email',     label:'Email Address',    type:'email',    ph:'you@example.com',  ac:'email'        },
  { name:'password',  label:'Password',         type:'password', ph:'••••••••',         ac:'new-password' },
  { name:'password2', label:'Confirm Password', type:'password', ph:'Re-enter password',ac:'new-password' },
];

const ICONS = {
  username: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  email:    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
  password: <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />,
  password2:<path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ username:'', email:'', password:'', password2:'', role:'attendee' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [step, setStep]     = useState(1); // 1 = credentials, 2 = success

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (form.password !== form.password2) { setErrors({ password2:'Passwords do not match.' }); return; }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.password2, form.role);
      navigate('/login');
    } catch (err) {
      const d = err?.data;
      setErrors(d && typeof d === 'object' && Object.keys(d).length ? d : { non_field_errors:'Registration failed.' });
    } finally { setLoading(false); }
  };

  const fe = (name) => { const v = errors?.[name]; return Array.isArray(v) ? v[0] : (typeof v === 'string' ? v : null); };

  return (
    <div className="min-h-[calc(100vh-112px)] flex">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-5/12 hero-bg flex-col items-center justify-center p-10 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-56 h-56 rounded-full bg-white/5 blur-2xl animate-pulse-slow" />
        <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-pcps-red/20 blur-3xl animate-pulse-slow" style={{animationDelay:'1s'}} />

        <div className="relative z-10 text-center max-w-xs">
          <div className="mb-6 animate-float">
            <img src="/pcps-logo.png" alt="PCPS" className="h-20 w-auto object-contain mx-auto drop-shadow-2xl"
              onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 animate-fade-up">Join PCPS College</h2>
          <div className="h-0.5 bg-gradient-to-r from-transparent via-pcps-red to-transparent mb-4 animate-fade-up stagger-1" />
          <p className="text-blue-200 text-sm leading-relaxed animate-fade-up stagger-2">
            Create your account and become part of the PCPS Events community.
          </p>

          {/* Progress steps */}
          <div className="mt-8 space-y-3 animate-fade-up stagger-3">
            {['Create credentials','Choose your role','Start exploring'].map((s, i) => (
              <div key={s} className="flex items-center gap-3 text-left">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                  i === 0 ? 'bg-pcps-red text-white shadow-glow-red' : 'glass-card text-white'
                }`}>{i + 1}</div>
                <span className="text-sm text-blue-200 font-medium">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: form ── */}
      <div className="flex-1 flex items-center justify-center bg-pcps-offwhite px-6 py-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30"
          style={{backgroundImage:'radial-gradient(circle at 20px 20px, #E2E8F0 1px, transparent 0)', backgroundSize:'40px 40px'}} />

        <div className="relative w-full max-w-md animate-scale-in">
          <div className="lg:hidden text-center mb-6">
            <img src="/pcps-logo.png" alt="PCPS" className="h-14 mx-auto" onError={(e) => { e.currentTarget.style.display='none'; }} />
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Gradient top bar */}
            <div className="h-1.5 bg-gradient-to-r from-pcps-blue via-pcps-red to-pcps-blue" />

            <div className="p-8">
              <div className="mb-6">
                <h1 className="text-2xl font-black text-pcps-blue">Create Account</h1>
                <p className="text-pcps-muted text-sm mt-1">Register for the PCPS Event Portal</p>
              </div>

              {errors.non_field_errors && (
                <div className="flex items-start gap-2.5 bg-red-50 border-l-4 border-pcps-red text-pcps-red text-sm rounded-xl px-4 py-3 mb-5 animate-scale-in">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  {errors.non_field_errors}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Input fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {FIELDS.map(({ name, label, type, ph, ac }, i) => (
                    <div key={name} className={`space-y-1.5 ${i >= 2 ? '' : ''} animate-fade-up`}
                      style={{animationDelay:`${i * 0.07}s`}}>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">{label}</label>
                      <div className={`relative transition-transform duration-200 ${focused === name ? 'scale-[1.02]' : ''}`}>
                        <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${focused === name ? 'text-pcps-blue' : 'text-gray-400'}`}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            {ICONS[name === 'password2' ? 'password2' : name] || ICONS.username}
                          </svg>
                        </div>
                        <input name={name} type={type} value={form[name]} onChange={handleChange}
                          onFocus={() => setFocused(name)} onBlur={() => setFocused('')}
                          required autoComplete={ac} placeholder={ph}
                          className={`${fe(name) ? 'form-input-error' : 'form-input'} pl-9 py-2.5 text-sm`} />
                      </div>
                      {fe(name) && (
                        <p className="text-pcps-red text-xs flex items-center gap-1 animate-scale-in">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
                          </svg>
                          {fe(name)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Role selector */}
                <div className="animate-fade-up stagger-4">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Account Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {ROLE_OPTIONS.map(({ value, icon, label, desc }) => (
                      <label key={value}
                        className={`cursor-pointer rounded-2xl p-4 border-2 transition-all duration-200 ${
                          form.role === value
                            ? 'border-pcps-blue bg-pcps-blue-light shadow-glow-blue scale-[1.02]'
                            : 'border-gray-200 bg-white hover:border-pcps-blue/40 hover:scale-[1.01]'
                        }`}>
                        <input type="radio" name="role" value={value} checked={form.role === value}
                          onChange={handleChange} className="sr-only" />
                        <div className="text-2xl mb-1">{icon}</div>
                        <p className={`text-sm font-bold ${form.role === value ? 'text-pcps-blue' : 'text-gray-700'}`}>{label}</p>
                        <p className="text-xs text-pcps-muted mt-0.5">{desc}</p>
                      </label>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-red w-full py-3 text-base shadow-lg animate-fade-up stagger-5">
                  {loading ? (
                    <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account…</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>Create Account</>
                  )}
                </button>
              </form>

              <div className="mt-5 pt-5 border-t border-gray-100 text-center">
                <p className="text-sm text-pcps-muted">
                  Already have an account?{' '}
                  <Link to="/login" className="text-pcps-red font-bold hover:text-pcps-red-dark transition-colors">
                    Sign in →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
