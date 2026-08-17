import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); setMenuOpen(false); };
  const isActive = (path) => pathname === path || pathname.startsWith(path + '/');

  const NavLink = ({ to, children, onClick }) => (
    <Link to={to} onClick={() => { setMenuOpen(false); onClick?.(); }}
      className={`relative text-sm font-semibold px-3.5 py-2 rounded-xl transition-all duration-200 group ${
        isActive(to)
          ? 'text-white bg-white/20 shadow-sm'
          : 'text-blue-100 hover:text-white hover:bg-white/10'
      }`}>
      {children}
      {/* Active underline dot */}
      {isActive(to) && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-pcps-red rounded-full" />
      )}
    </Link>
  );

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-xl' : 'shadow-lg'}`}>

      {/* ── Main nav bar ── */}
      <div className={`transition-all duration-300 ${scrolled
        ? 'bg-pcps-blue/95 backdrop-blur-md'
        : 'bg-gradient-to-r from-pcps-blue-dark via-pcps-blue to-pcps-blue-mid'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ── */}
            <Link to="/events" className="flex items-center gap-3 group shrink-0">
              <div className="relative">
                <img src="/pcps-logo.png" alt="PCPS College"
                  className="h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    document.getElementById('logo-fallback').style.display = 'flex';
                  }}
                />
                <div id="logo-fallback" style={{display:'none'}}
                  className="w-11 h-11 rounded-xl bg-gradient-to-br from-pcps-red to-pcps-red-dark items-center justify-center shadow-glow-red">
                  <span className="text-white font-black text-xl">P</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <p className="text-white font-black text-base leading-tight tracking-tight">
                  PCPS College
                </p>
                <p className="text-blue-300 text-[11px] font-medium tracking-widest uppercase">
                  Event Management
                </p>
              </div>
            </Link>

            {/* ── Desktop links ── */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/events">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Events
                </span>
              </NavLink>
              {user?.role === 'attendee' && (
                <NavLink to="/my-events">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    My Events
                  </span>
                </NavLink>
              )}
              {user?.role === 'organizer' && (
                <>
                  <NavLink to="/events/new">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Create
                    </span>
                  </NavLink>
                  <NavLink to="/dashboard">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Dashboard
                    </span>
                  </NavLink>
                </>
              )}
              {user?.role === 'admin' && (
                <NavLink to="/admin/users">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Users
                  </span>
                </NavLink>
              )}
            </nav>

            {/* ── Auth buttons ── */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <button onClick={handleLogout}
                  className="text-sm font-semibold bg-white text-pcps-red hover:bg-pcps-red hover:text-white
                             px-4 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5
                             hover:shadow-glow-red border-2 border-white hover:border-pcps-red">
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login"
                    className="text-sm font-semibold text-blue-200 hover:text-white px-3 py-2 rounded-xl transition-colors">
                    Login
                  </Link>
                  <Link to="/register"
                    className="text-sm font-bold bg-pcps-red hover:bg-pcps-red-dark text-white
                               px-5 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5
                               hover:shadow-glow-red shadow-md">
                    Register Free
                  </Link>
                </>
              )}
            </div>

            {/* ── Mobile hamburger ── */}
            <button onClick={() => setMenuOpen(o => !o)}
              className="md:hidden text-white p-2 rounded-xl hover:bg-white/15 transition-all">
              <svg className={`w-5 h-5 transition-transform duration-300 ${menuOpen ? 'rotate-90' : ''}`}
                fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>

          {/* ── Mobile menu ── */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
            <div className="pt-2 border-t border-white/10 space-y-1">
              <NavLink to="/events">Events</NavLink>
              {user?.role === 'attendee' && <NavLink to="/my-events">My Events</NavLink>}
              {user?.role === 'organizer' && (
                <><NavLink to="/events/new">+ Create Event</NavLink><NavLink to="/dashboard">Dashboard</NavLink></>
              )}
              {user?.role === 'admin' && <NavLink to="/admin/users">Manage Users</NavLink>}
              <div className="pt-3 border-t border-white/10 flex gap-2">
                {user ? (
                  <button onClick={handleLogout} className="flex-1 text-sm font-bold bg-white text-pcps-red py-2.5 rounded-xl">Logout</button>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center text-sm text-white border-2 border-white/30 py-2.5 rounded-xl hover:bg-white/10">Login</Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center text-sm font-bold text-white bg-pcps-red py-2.5 rounded-xl hover:bg-pcps-red-dark">Register</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
