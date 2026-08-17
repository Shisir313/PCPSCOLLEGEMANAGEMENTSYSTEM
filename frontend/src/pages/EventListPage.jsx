import { useState, useEffect, useCallback } from 'react';
import { getEvents } from '../services/eventService';
import EventCard from '../components/EventCard';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

// Rotating hero background images (college/event themed)
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&q=80', // graduation
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80', // conference
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&q=80', // event crowd
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80', // concert crowd
];

// Feature category tiles shown in hero
const CATEGORIES = [
  { icon: '🎓', label: 'Academic',   gradient: 'from-blue-500 to-blue-700'    },
  { icon: '⚽', label: 'Sports',     gradient: 'from-green-500 to-emerald-600' },
  { icon: '🎨', label: 'Cultural',   gradient: 'from-purple-500 to-pink-600'  },
  { icon: '💻', label: 'Technology', gradient: 'from-cyan-500 to-blue-600'    },
  { icon: '🏆', label: 'Competition',gradient: 'from-amber-500 to-orange-600' },
  { icon: '🤝', label: 'Networking', gradient: 'from-teal-500 to-cyan-600'    },
];

export default function EventListPage() {
  const { user } = useAuth();
  const [events, setEvents]           = useState([]);
  const [search, setSearch]           = useState('');
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalCount, setTotalCount]   = useState(0);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [heroImg, setHeroImg]         = useState(0);

  // Rotate hero image every 5 seconds
  useEffect(() => {
    const t = setInterval(() => setHeroImg(i => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = { page };
      if (search.trim()) params.search = search.trim();
      const data    = await getEvents(params);
      const results = Array.isArray(data) ? data : data.results ?? [];
      setEvents(results);
      setTotalCount(data.count ?? results.length);
      setTotalPages(Math.max(1, Math.ceil((data.count ?? results.length) / 10)));
    } catch { setError('Failed to load events.'); }
    finally  { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  return (
    <div className="min-h-full">

      {/* ══════════════════════════════════════════
          HERO — full-bleed image with gradient overlay
      ══════════════════════════════════════════ */}
      <div className="relative h-[420px] sm:h-[500px] overflow-hidden">
        {/* Background images — crossfade */}
        {HERO_IMAGES.map((src, i) => (
          <img key={src} src={src} alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              i === heroImg ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        {/* Dark + brand gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-pcps-blue/90 via-pcps-blue/60 to-pcps-red/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-pcps-red/20 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-white/10 blur-3xl animate-pulse-slow" style={{animationDelay:'1.5s'}} />

        {/* Hero content */}
        <div className="relative h-full flex flex-col justify-center max-w-5xl mx-auto px-4">
          <div className="animate-fade-up">
            {/* PCPS label */}
            <div className="flex items-center gap-3 mb-4">
              <img src="/pcps-logo.png" alt="PCPS"
                className="h-10 w-auto object-contain brightness-0 invert opacity-90"
                onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <div className="h-6 w-px bg-white/30" />
              <span className="text-white/80 text-sm font-semibold tracking-widest uppercase">
                Event Management Portal
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-4">
              Discover &amp;{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-clip-text text-transparent
                                 bg-gradient-to-r from-red-300 via-white to-blue-200">
                  Attend Events
                </span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-pcps-red/30 rounded-full blur-sm" />
              </span>
            </h1>

            <p className="text-blue-100 text-base sm:text-lg max-w-lg leading-relaxed mb-6">
              Browse and register for college events — academic, cultural, sports, and more.
              {totalCount > 0 && (
                <span className="ml-2 bg-white/20 text-white text-sm font-bold px-3 py-0.5 rounded-full">
                  {totalCount} live
                </span>
              )}
            </p>

            <div className="flex flex-wrap gap-3">
              {user?.role === 'organizer' && (
                <Link to="/events/new"
                  className="group relative overflow-hidden inline-flex items-center gap-2
                             bg-pcps-red text-white font-bold px-6 py-3 rounded-2xl
                             shadow-glow-red hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Create Event
                </Link>
              )}
              {!user && (
                <Link to="/register"
                  className="inline-flex items-center gap-2 bg-white text-pcps-blue font-bold
                             px-6 py-3 rounded-2xl hover:-translate-y-0.5 transition-all text-sm shadow-lg">
                  Get Started Free →
                </Link>
              )}
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mt-8 animate-fade-up" style={{animationDelay:'0.2s'}}>
            {CATEGORIES.map(({ icon, label, gradient }) => (
              <span key={label}
                className={`inline-flex items-center gap-1.5 text-xs font-bold text-white
                             px-3 py-1.5 rounded-full bg-gradient-to-r ${gradient}
                             shadow-sm hover:scale-105 transition-transform cursor-default`}>
                {icon} {label}
              </span>
            ))}
          </div>
        </div>

        {/* Image slide dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {HERO_IMAGES.map((_, i) => (
            <button key={i} onClick={() => setHeroImg(i)}
              className={`transition-all duration-300 rounded-full ${
                i === heroImg ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`} />
          ))}
        </div>

        {/* Wavy bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 50 Q360 10 720 30 Q1080 50 1440 15 L1440 50 Z" fill="#F7F8FA" />
          </svg>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Search */}
        <div className="card p-4 mb-6 animate-fade-up">
          <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchEvents(); }}
            className="flex gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search events by name or description…"
                className="form-input pl-11" />
              {search && (
                <button type="button" onClick={() => { setSearch(''); setPage(1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pcps-red transition-colors p-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button type="submit" className="btn-blue shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </form>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="flex h-28">
                  <div className="skeleton w-36 h-full" />
                  <div className="flex-1 p-5 space-y-3">
                    <div className="flex gap-2">
                      <div className="skeleton h-5 w-16 rounded-full" />
                      <div className="skeleton h-5 w-20 rounded-full" />
                    </div>
                    <div className="skeleton h-5 w-3/4 rounded-lg" />
                    <div className="skeleton h-3 w-1/2 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card p-5 border-l-4 border-pcps-red bg-red-50">
            <p className="text-pcps-red font-semibold text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              {error}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && events.length === 0 && (
          <div className="text-center py-20 animate-fade-up">
            <img
              src="https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&q=80"
              alt="No events"
              className="w-32 h-32 object-cover rounded-2xl mx-auto mb-5 opacity-60"
            />
            <p className="text-xl font-bold text-pcps-blue mb-1">No events found</p>
            <p className="text-pcps-muted text-sm">
              {search ? 'Try a different search term' : 'Check back soon for new events'}
            </p>
          </div>
        )}

        {/* Event list */}
        {!loading && !error && events.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-pcps-muted font-medium">
                Showing <span className="text-pcps-blue font-bold">{events.length}</span> of{' '}
                <span className="text-pcps-blue font-bold">{totalCount}</span> events
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {events.map((event, i) => (
                <div key={event.id} className="animate-fade-up" style={{animationDelay:`${i * 0.05}s`}}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6 border-t border-gray-100">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                  className="btn-outline-blue disabled:opacity-40 px-4 py-2 text-xs">← Prev</button>
                <div className="flex gap-1.5">
                  {Array.from({length: Math.min(totalPages, 7)}, (_, i) => {
                    const p = i + 1;
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition-all duration-200 ${
                          page === p
                            ? 'bg-card-gradient text-white shadow-glow-blue scale-110'
                            : 'bg-white text-pcps-muted border-2 border-gray-100 hover:border-pcps-blue hover:text-pcps-blue'
                        }`}>{p}</button>
                    );
                  })}
                </div>
                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
                  className="btn-outline-blue disabled:opacity-40 px-4 py-2 text-xs">Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
