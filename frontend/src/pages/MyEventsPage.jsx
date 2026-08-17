import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import EventCard from '../components/EventCard';
import QRCodeModal from '../components/QRCodeModal';

// Hero image for My Events page
const MY_EVENTS_HERO = 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=1600&q=80';

export default function MyEventsPage() {
  const [events, setEvents]       = useState([]);
  // Map of eventId → { id, qr_token, checked_in, checked_in_at }
  const [rsvpMap, setRsvpMap]     = useState({});
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  // QR modal state
  const [qrTarget, setQrTarget]   = useState(null); // { token, title }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch events + RSVPs in parallel so we have qr_token per event
        const [eventsRes, rsvpsRes] = await Promise.all([
          axiosInstance.get('/api/rsvps/my-events/'),
          axiosInstance.get('/api/rsvps/'),
        ]);
        const evtList  = eventsRes.data.results ?? eventsRes.data;
        const rsvpList = rsvpsRes.data.results  ?? rsvpsRes.data;

        setEvents(Array.isArray(evtList) ? evtList : []);

        // Build a lookup: eventId → rsvp details
        const map = {};
        (Array.isArray(rsvpList) ? rsvpList : []).forEach((r) => {
          map[r.event_id] = r;
        });
        setRsvpMap(map);
      } catch {
        setError('Failed to load your events.');
      } finally {
        setLoading(false);
      }
    };
    load();
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
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Browse Events
            </Link>
          </div>
        )}

        {/* Event list */}
        {!loading && !error && events.length > 0 && (
          <>
            <p className="text-sm font-semibold text-pcps-muted mb-4">
              You are registered for{' '}
              <span className="text-pcps-blue font-bold">{events.length}</span>{' '}
              event{events.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-3">
              {events.map((event, i) => {
                const rsvp = rsvpMap[event.id];
                return (
                  <div key={event.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                    {/* Event card */}
                    <EventCard event={event} />

                    {/* QR pass bar below the card */}
                    {rsvp?.qr_token && (
                      <div className="mx-1 -mt-1 bg-pcps-blue/5 border border-pcps-blue/20 border-t-0
                                      rounded-b-xl px-4 py-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          {rsvp.checked_in ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700
                                             bg-green-100 border border-green-200 px-2.5 py-1 rounded-full shrink-0">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                                  clipRule="evenodd" />
                              </svg>
                              Checked In
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-pcps-blue/70
                                             bg-pcps-blue/10 border border-pcps-blue/20 px-2.5 py-1 rounded-full shrink-0">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
                                <circle cx="12" cy="12" r="9" strokeLinecap="round" />
                              </svg>
                              Not Yet Checked In
                            </span>
                          )}
                          <p className="text-[11px] text-pcps-muted truncate">
                            Scan QR code at the entrance
                          </p>
                        </div>
                        <button
                          onClick={() => setQrTarget({ token: rsvp.qr_token, title: event.title })}
                          className="inline-flex items-center gap-1.5 bg-pcps-blue text-white text-[11px]
                                     font-bold px-3 py-1.5 rounded-lg hover:bg-pcps-blue/90 transition-colors shrink-0"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                          QR Pass
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* QR Code Modal */}
      {qrTarget && (
        <QRCodeModal
          value={String(qrTarget.token)}
          title={qrTarget.title}
          onClose={() => setQrTarget(null)}
        />
      )}
    </div>
  );
}
