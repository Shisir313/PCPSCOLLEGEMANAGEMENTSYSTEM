import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrganizerDashboard } from '../services/eventService';
import { getEventImage, getCategoryColor } from '../utils/imageUtils';

const HERO = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&q=80';

function StatusBadge({ event }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const eDate = new Date(`${event.date}T00:00:00`);
  if (eDate < today) return <span className="badge-gray text-[10px]">Past</span>;
  if (eDate.getTime() === today.getTime()) return <span className="badge-red text-[10px] animate-pulse">Today</span>;
  return <span className="badge-green text-[10px]">Upcoming</span>;
}

function StatCard({ icon, label, value, gradient, delay }) {
  return (
    <div className={`card p-5 animate-fade-up`} style={{animationDelay: delay}}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-pcps-muted uppercase tracking-wider mb-1">{label}</p>
          <p className={`text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br ${gradient}`}>
            {value}
          </p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-sm`}>
          <span className="text-white text-lg">{icon}</span>
        </div>
      </div>
    </div>
  );
}

export default function OrganizerDashboardPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getOrganizerDashboard()
      .then(setEvents)
      .catch(() => setError('Unable to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => ({
    total:    events.length,
    rsvps:    events.reduce((s, e) => s + (e.rsvp_count || 0), 0),
    upcoming: events.filter(e => new Date(`${e.date}T00:00:00`) >= new Date(new Date().setHours(0,0,0,0))).length,
    soldOut:  events.filter(e => e.capacity != null && e.rsvp_count >= e.capacity).length,
  }), [events]);

  return (
    <div className="min-h-full">
      {/* Hero */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <img src={HERO} alt="Dashboard" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-pcps-blue/88 via-pcps-blue/60 to-pcps-red/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="relative h-full flex flex-col justify-center max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 bg-pcps-red rounded-full" />
            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">Organizer Panel</p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">My Dashboard</h1>
          <p className="text-blue-200 text-sm mt-1">Manage your events and track attendance</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 30 Q360 5 720 15 Q1080 25 1440 5 L1440 30 Z" fill="#F7F8FA" />
          </svg>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon="🗓" label="Total Events"  value={stats.total}    gradient="from-pcps-blue to-pcps-blue-mid"   delay="0s" />
          <StatCard icon="🎟" label="Total RSVPs"   value={stats.rsvps}    gradient="from-green-500 to-emerald-600"     delay="0.05s" />
          <StatCard icon="⏳" label="Upcoming"       value={stats.upcoming} gradient="from-amber-500 to-orange-500"      delay="0.1s" />
          <StatCard icon="🔥" label="Sold Out"       value={stats.soldOut}  gradient="from-pcps-red to-pcps-red-dark"    delay="0.15s" />
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black text-pcps-blue">Your Events</h2>
          <Link to="/events/new" className="btn-red shadow-md text-xs px-4 py-2">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Event
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="card p-5 animate-pulse flex gap-4">
                <div className="skeleton w-28 h-24 rounded-xl" />
                <div className="flex-1 space-y-3">
                  <div className="skeleton h-5 w-2/3 rounded-lg" />
                  <div className="skeleton h-3 w-1/2 rounded-lg" />
                  <div className="skeleton h-3 w-1/3 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card p-5 border-l-4 border-pcps-red bg-red-50">
            <p className="text-pcps-red text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && events.length === 0 && (
          <div className="card text-center py-16 animate-fade-up">
            <img src="https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&q=80"
              alt="" className="w-32 h-24 object-cover rounded-2xl mx-auto mb-5 opacity-50" />
            <p className="text-xl font-bold text-pcps-blue mb-2">No events created yet</p>
            <p className="text-pcps-muted text-sm mb-6">Create your first event to start building an audience.</p>
            <Link to="/events/new" className="btn-red shadow-lg">Create First Event</Link>
          </div>
        )}

        {/* Event rows */}
        {!loading && !error && events.length > 0 && (
          <div className="space-y-4">
            {events.map((event, i) => {
              const imgSrc   = getEventImage(event);
              const catColor = getCategoryColor(event.category);
              const pct      = event.capacity ? Math.min(100, (event.rsvp_count / event.capacity) * 100) : 0;

              return (
                <div key={event.id}
                  className="card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 animate-fade-up overflow-hidden"
                  style={{animationDelay:`${i * 0.05}s`}}>
                  <div className={`h-1 bg-gradient-to-r ${catColor}`} />
                  <div className="flex flex-col sm:flex-row gap-0">
                    {/* Image */}
                    <div className="shrink-0 w-full sm:w-36 h-36 relative overflow-hidden">
                      <img src={imgSrc} alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        onError={(e) => { e.currentTarget.style.display='none'; }} />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 sm:bg-none" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-bold text-pcps-blue leading-snug">{event.title}</h3>
                            <StatusBadge event={event} />
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-pcps-muted">
                            <span>📅 {new Date(`${event.date}T00:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
                            <span>⏰ {event.time?.slice(0,5)}</span>
                            <span>📍 {event.location}</span>
                          </div>
                        </div>

                        {/* Stats box */}
                        <div className="shrink-0 text-right hidden sm:block">
                          <p className="text-2xl font-black text-pcps-blue">{event.rsvp_count}</p>
                          <p className="text-[10px] text-pcps-muted font-semibold uppercase">RSVPs</p>
                          {event.capacity && (
                            <p className="text-xs text-gray-400">of {event.capacity}</p>
                          )}
                        </div>
                      </div>

                      {/* Capacity bar */}
                      {event.capacity != null && (
                        <div className="mb-3">
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ${
                              pct >= 100 ? 'bg-pcps-red' : pct >= 80 ? 'bg-amber-500' : 'bg-green-500'
                            }`} style={{width:`${pct}%`}} />
                          </div>
                          <p className="text-[10px] text-pcps-muted mt-0.5">{Math.round(pct)}% full — {event.remaining_spots ?? Math.max(0, event.capacity - event.rsvp_count)} spots left</p>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Link to={`/events/${event.id}`} className="btn-ghost text-xs px-3 py-1.5 border border-gray-200">
                          View
                        </Link>
                        <Link to={`/events/${event.id}/edit`} className="btn-outline-blue text-xs px-3 py-1.5">
                          Edit
                        </Link>
                        <Link to={`/events/${event.id}/attendees`}
                          className="btn-blue text-xs px-3 py-1.5">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Attendees ({event.rsvp_count})
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
