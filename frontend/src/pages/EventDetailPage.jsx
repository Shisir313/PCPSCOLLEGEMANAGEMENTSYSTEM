import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEvent, deleteEvent } from '../services/eventService';
import axiosInstance from '../services/axiosInstance';
import RSVPButton from '../components/RSVPButton';
import QRCodeModal from '../components/QRCodeModal';
import EventQRModal from '../components/EventQRModal';
import { useAuth } from '../hooks/useAuth';
import { getEventImage, getCategoryColor } from '../utils/imageUtils';

export default function EventDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const [event, setEvent]               = useState(null);
  const [currentRsvpId, setCurrentRsvpId] = useState(null);
  const [currentRsvpToken, setCurrentRsvpToken] = useState(null);
  const [showQR, setShowQR]             = useState(false);
  const [showEventQR, setShowEventQR]   = useState(false);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const evt = await getEvent(id);
        setEvent(evt);
        if (user?.role === 'attendee') {
          const { data: rsvps } = await axiosInstance.get('/api/rsvps/');
          const list = rsvps.results ?? rsvps;
          const rsvp = list.find?.(r => r.event_id === parseInt(id));
          if (rsvp) {
            setCurrentRsvpId(rsvp.id);
            setCurrentRsvpToken(rsvp.qr_token ?? null);
          }
        }
      } catch { setError('Event not found.'); }
      finally  { setLoading(false); }
    };
    load();
  }, [id, user]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    try { await deleteEvent(id); navigate('/events'); }
    catch { alert('Failed to delete event.'); }
  };

  const updateRsvpState = (registered) => {
    setEvent(prev => !prev ? prev : {
      ...prev,
      rsvp_count:     Math.max(0, prev.rsvp_count + (registered ? 1 : -1)),
      remaining_spots: prev.capacity == null ? prev.remaining_spots
        : Math.max(0, (prev.remaining_spots ?? prev.capacity - prev.rsvp_count) + (registered ? -1 : 1)),
    });
  };
  const isOwner = user && event && user.username === event.organizer_username;
  const isAdmin = user?.role === 'admin';

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-pcps-blue/20 border-t-pcps-blue rounded-full animate-spin" />
        <p className="text-pcps-muted text-sm font-medium">Loading event…</p>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error || !event) return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-pcps-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-xl font-bold text-pcps-blue mb-2">{error || 'Event not found'}</p>
        <Link to="/events" className="btn-blue mt-2">← Back to Events</Link>
      </div>
    </div>
  );

  const imgSrc   = getEventImage(event);
  const catColor = getCategoryColor(event.category);
  const spotsLeft = event.capacity != null
    ? (event.remaining_spots ?? Math.max(0, event.capacity - event.rsvp_count))
    : null;
  const pct = event.capacity ? Math.min(100, (event.rsvp_count / event.capacity) * 100) : 0;

  return (
    <div className="min-h-full animate-fade-in">

      {/* ── Hero image banner ── */}
      <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
        <img
          src={imgSrc} alt={event.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextSibling.style.display = 'block';
          }}
        />
        <div style={{ display:'none' }}
          className={`w-full h-full bg-gradient-to-br ${catColor}`} />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Link to="/events"
            className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white
                       text-sm font-semibold px-4 py-2 rounded-xl hover:bg-white/30 transition-all border border-white/20">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Events
          </Link>
        </div>

        {/* Title on image */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-6">
          <div className="max-w-4xl mx-auto">
            {event.category && (
              <span className={`inline-block text-xs font-bold text-white px-3 py-1 rounded-full
                               bg-gradient-to-r ${catColor} mb-3`}>
                {event.category.name}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight drop-shadow-lg">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: description + RSVP ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Description card */}
            <div className="card p-6 animate-fade-up">
              <h2 className="text-lg font-bold text-pcps-blue mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-pcps-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                About this Event
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm">{event.description}</p>
            </div>

            {/* RSVP / Registration card — hidden only for organizers (they own events, not attend them) */}
            {user?.role !== 'organizer' && (
              <div className="card p-6 border-l-4 border-pcps-blue animate-fade-up stagger-2">
                <h2 className="text-lg font-bold text-pcps-blue mb-1">Register for this Event</h2>
                <p className="text-pcps-muted text-sm mb-4">
                  {spotsLeft === 0
                    ? 'This event is fully booked.'
                    : `${spotsLeft ?? '∞'} spot${spotsLeft !== 1 ? 's' : ''} remaining.`}
                </p>

                {/* Not logged in */}
                {!user && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      to={`/login`}
                      className="inline-flex items-center gap-2 bg-pcps-blue text-white font-bold
                                 px-6 py-2.5 rounded-xl hover:bg-pcps-blue/90 transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Log in to Register
                    </Link>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 border-2 border-pcps-blue text-pcps-blue
                                 font-bold px-6 py-2.5 rounded-xl hover:bg-pcps-blue hover:text-white
                                 transition-colors text-sm"
                    >
                      Create Account
                    </Link>
                  </div>
                )}

                {/* Pending approval */}
                {user?.role === 'pending' && (
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-bold text-amber-700">Account Pending Approval</p>
                      <p className="text-xs text-amber-600 mt-0.5">
                        An admin needs to approve your account before you can register for events.
                      </p>
                    </div>
                  </div>
                )}

                {/* Admin — can view but not RSVP */}
                {user?.role === 'admin' && (
                  <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <svg className="w-5 h-5 text-pcps-blue shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-pcps-blue font-medium">
                      Admin accounts cannot register for events.
                    </p>
                  </div>
                )}

                {/* Attendee — full RSVP + QR flow */}
                {user?.role === 'attendee' && (
                  <>
                    <div className="flex flex-col sm:flex-row gap-3 items-start">
                      <RSVPButton
                        event={event}
                        currentRsvpId={currentRsvpId}
                        onRsvpChange={(newId, token) => {
                          setCurrentRsvpId(newId);
                          setCurrentRsvpToken(token ?? null);
                          updateRsvpState(Boolean(newId));
                        }}
                      />

                      {/* QR pass button — appears once registered */}
                      {currentRsvpId && currentRsvpToken && (
                        <button
                          onClick={() => setShowQR(true)}
                          className="inline-flex items-center gap-2 bg-pcps-blue/10 hover:bg-pcps-blue/20
                                     text-pcps-blue font-bold text-sm px-5 py-2.5 rounded-xl transition-colors
                                     border-2 border-pcps-blue/30 hover:border-pcps-blue"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                          Show QR Pass
                        </button>
                      )}
                    </div>

                    {currentRsvpId && !currentRsvpToken && (
                      <p className="text-xs text-pcps-muted mt-3">
                        ✓ Registered — reload the page to get your QR pass.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Organizer / Admin actions */}
            {(isOwner || isAdmin) && (
              <div className="card p-5 animate-fade-up stagger-3">
                <h3 className="text-sm font-bold text-pcps-muted uppercase tracking-wider mb-3">
                  Manage Event
                </h3>
                <div className="flex gap-3 flex-wrap">
                  <Link to={`/events/${id}/edit`} className="btn-blue flex-1 justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Link>
                  {/* Share Registration QR — lets organizer share event URL as QR */}
                  {isOwner && (
                    <button
                      onClick={() => setShowEventQR(true)}
                      className="btn-outline-blue flex-1 justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      Share QR
                    </button>
                  )}
                  {/* QR Check-in Scanner */}
                  {isOwner && (
                    <Link to={`/events/${id}/scanner`} className="btn-outline-blue flex-1 justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Scan QR
                    </Link>
                  )}
                  <button onClick={handleDelete} className="btn-outline-red flex-1 justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: details sidebar ── */}
          <div className="space-y-4">

            {/* Event info card */}
            <div className="card overflow-hidden animate-fade-up stagger-1">
              <div className={`h-2 bg-gradient-to-r ${catColor}`} />
              <div className="p-5 space-y-4">
                <h3 className="text-sm font-bold text-pcps-blue uppercase tracking-wider">Event Details</h3>

                {[
                  {
                    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
                    label: 'Date',
                    value: new Date(event.date).toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' }),
                  },
                  {
                    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
                    label: 'Time',
                    value: event.time?.slice(0,5),
                  },
                  {
                    icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></>,
                    label: 'Location',
                    value: event.location,
                  },
                  {
                    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
                    label: 'Organizer',
                    value: event.organizer_username,
                  },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-pcps-blue-light rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-pcps-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {icon}
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-semibold text-gray-800 leading-snug">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Capacity card */}
            {event.capacity != null && (
              <div className="card p-5 animate-fade-up stagger-2">
                <h3 className="text-sm font-bold text-pcps-blue uppercase tracking-wider mb-3">Registration</h3>
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-3xl font-black text-pcps-blue">{event.rsvp_count}</p>
                    <p className="text-xs text-pcps-muted">registered</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-gray-300">{event.capacity}</p>
                    <p className="text-xs text-pcps-muted">capacity</p>
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      pct >= 100 ? 'bg-pcps-red' : pct >= 80 ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-xs text-pcps-muted">
                  <span>{Math.round(pct)}% full</span>
                  <span className={`font-semibold ${spotsLeft === 0 ? 'text-pcps-red' : spotsLeft <= 5 ? 'text-amber-600' : 'text-green-600'}`}>
                    {spotsLeft === 0 ? 'Sold Out' : `${spotsLeft} spots left`}
                  </span>
                </div>
              </div>
            )}

            {/* ── Registration QR card — organizer sidebar ── */}
            {isOwner && (
              <div className="card p-5 animate-fade-up stagger-3">
                <h3 className="text-sm font-bold text-pcps-blue uppercase tracking-wider mb-1">
                  Share to Register
                </h3>
                <p className="text-xs text-pcps-muted mb-4">
                  Attendees scan this QR with their phone to open and register for this event.
                </p>
                <button
                  onClick={() => setShowEventQR(true)}
                  className="w-full flex items-center justify-center gap-2 bg-pcps-blue text-white
                             font-bold text-sm py-2.5 rounded-xl hover:bg-pcps-blue/90 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  Show Registration QR
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Attendee QR pass modal ── */}
      {showQR && currentRsvpToken && (
        <QRCodeModal
          value={String(currentRsvpToken)}
          title={event.title}
          onClose={() => setShowQR(false)}
        />
      )}

      {/* ── Event registration QR modal (organizer share) ── */}
      {showEventQR && (
        <EventQRModal
          eventId={id}
          eventTitle={event.title}
          onClose={() => setShowEventQR(false)}
        />
      )}
    </div>
  );
}
