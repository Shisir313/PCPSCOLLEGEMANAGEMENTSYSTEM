import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyEvents } from '../services/rsvpService';
import EventCard from '../components/EventCard';

// Hero image for My Events page
const MY_EVENTS_HERO = 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=1600&q=80';

export default function MyEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMyEvents()
      .then(setEvents)
      .catch(() => setError('Failed to load your events.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-full">

      {/* ── Hero banner with image ── */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <img src={MY_EVENTS_HERO} alt="My Events"
          className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-pcps-blue/85 via-pcps-blue/60 to-pcps-red/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        <div className="relative h-full flex flex-col justify-center max-w-5xl mx-auto px-4">
          <div className="animate-fade-up">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-5 bg-pcps-red rounded-full" />
              <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">PCPS College</p>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">My Registered Events</h1>
            <p className="text-blue-200 text-sm mt-1">
              {!loading && `${events.length} event${events.length !== 1 ? 's' : ''} in your schedule`}
            </p>
          </div>
        </div>

        {/* Wavy bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 30 Q360 5 720 15 Q1080 25 1440 5 L1440 30 Z" fill="#F7F8FA" />
          </svg>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="flex h-28">
                  <div className="skeleton w-36 h-full" />
                  <div className="flex-1 p-5 space-y-3">
                    <div className="skeleton h-5 w-16 rounded-full" />
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
            <p className="text-pcps-red font-semibold text-sm">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && events.length === 0 && (
          <div className="text-center py-16 animate-fade-up">
            <img
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80"
              alt="No events"
              className="w-40 h-28 object-cover rounded-2xl mx-auto mb-6 opacity-50"
            />
            <p className="text-xl font-bold text-pcps-blue mb-2">No events registered yet</p>
            <p className="text-pcps-muted text-sm mb-6 max-w-xs mx-auto">
              Browse upcoming college events and register to see them here.
            </p>
            <Link to="/events" className="btn-red shadow-lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Browse Events
            </Link>
          </div>
        )}

        {/* Event list */}
        {!loading && !error && events.length > 0 && (
          <>
            <p className="text-sm font-semibold text-pcps-muted mb-4">
              You are registered for <span className="text-pcps-blue font-bold">{events.length}</span> event{events.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-3">
              {events.map((event, i) => (
                <div key={event.id} className="animate-fade-up" style={{animationDelay:`${i * 0.06}s`}}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
