import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import axiosInstance from '../services/axiosInstance';
import { useToast } from '../context/ToastContext';

/**
 * CheckInQRPage — attendee view to see and download their QR code for an event.
 * Route: /events/:id/qr
 * Generates the QR entirely client-side from the qr_token UUID.
 */
export default function CheckInQRPage() {
  const { id }        = useParams();
  const { addToast }  = useToast();
  const canvasRef     = useRef(null);

  const [event, setEvent]   = useState(null);
  const [rsvp, setRsvp]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [eventRes, rsvpRes] = await Promise.all([
          axiosInstance.get(`/api/events/${id}/`),
          axiosInstance.get('/api/rsvps/'),
        ]);

        const evt      = eventRes.data;
        const rsvpList = rsvpRes.data.results ?? rsvpRes.data;
        const foundRsvp = (Array.isArray(rsvpList) ? rsvpList : [])
          .find(r => r.event_id === parseInt(id));

        if (!foundRsvp) {
          setError("You don't have an RSVP for this event.");
          setLoading(false);
          return;
        }

        setEvent(evt);
        setRsvp(foundRsvp);
      } catch {
        setError('Failed to load your QR code. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Render QR onto canvas once we have the token
  useEffect(() => {
    if (!canvasRef.current || !rsvp?.qr_token) return;
    QRCode.toCanvas(canvasRef.current, String(rsvp.qr_token), {
      width: 256,
      margin: 2,
      color: { dark: '#1B2F5E', light: '#FFFFFF' },
    });
  }, [rsvp]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qr-checkin-${event?.title ?? 'event'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    addToast('QR code downloaded!', 'success');
  };

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
    : '—';
  const formatTime = (t) => {
    if (!t) return '—';
    const [h, m] = t.split(':');
    const dt = new Date(); dt.setHours(+h, +m);
    return dt.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
  };
  const formatDateTime = (s) => s
    ? new Date(s).toLocaleString('en-US', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
    : '';

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-pcps-blue/20 border-t-pcps-blue rounded-full animate-spin" />
        <p className="text-pcps-muted text-sm font-medium">Loading your QR code…</p>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="card p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-pcps-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-lg font-bold text-pcps-blue mb-2">No QR Code Available</p>
        <p className="text-pcps-muted text-sm mb-6">{error}</p>
        <div className="flex gap-3">
          <Link to="/my-events" className="btn-blue flex-1 justify-center">← My Events</Link>
          <Link to={`/events/${id}`} className="btn-outline-blue flex-1 justify-center">Event Page</Link>
        </div>
      </div>
    </div>
  );

  /* ── Main ── */
  return (
    <div className="min-h-full animate-fade-in">

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-pcps-blue via-pcps-blue to-pcps-blue/90 py-10 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-pcps-red/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <Link to="/my-events"
            className="inline-flex items-center gap-1.5 text-blue-300 hover:text-white text-sm font-medium mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            My Events
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 bg-pcps-red rounded-full" />
            <p className="text-blue-300 text-xs font-bold uppercase tracking-widest">QR Check-In Pass</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{event.title}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* Event details */}
        <div className="card p-5 animate-fade-up">
          <h2 className="text-xs font-bold text-pcps-muted uppercase tracking-wider mb-4">Event Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Date',     value: formatDate(event.date) },
              { label: 'Time',     value: formatTime(event.time) },
              { label: 'Location', value: event.location },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-gray-800 leading-snug mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* QR code card */}
        <div className="card p-6 animate-fade-up stagger-1">
          <div className="flex flex-col items-center gap-5">

            {/* Check-in badge */}
            <div className="w-full flex justify-center">
              {rsvp.checked_in ? (
                <div className="flex flex-col items-center gap-1">
                  <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-green-100
                                   text-green-800 font-bold text-sm border border-green-200">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                        clipRule="evenodd" />
                    </svg>
                    ✓ Checked In
                  </span>
                  {rsvp.checked_in_at && (
                    <p className="text-xs text-pcps-muted mt-1">
                      Checked in at {formatDateTime(rsvp.checked_in_at)}
                    </p>
                  )}
                </div>
              ) : (
                <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gray-100
                                 text-gray-600 font-bold text-sm border border-gray-200">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  Not Yet Checked In
                </span>
              )}
            </div>

            {/* Canvas where QR is rendered */}
            <div className="p-3 bg-white rounded-2xl shadow-inner border border-gray-100">
              <canvas ref={canvasRef} className="block rounded-lg" />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={handleDownload}
                className="btn-blue flex-1 justify-center"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download QR Code
              </button>
              <Link
                to={`/events/${id}`}
                className="btn-outline-blue flex-1 justify-center"
              >
                ← Back to Event
              </Link>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="card p-5 border-l-4 border-pcps-blue animate-fade-up stagger-2">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-pcps-blue-light rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-pcps-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-pcps-blue mb-1">How to Check In</p>
              <p className="text-sm text-gray-600">
                Show this QR code to the event organizer at the entrance. You can also download it
                and display it from your photo gallery — no internet connection required at the venue.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
