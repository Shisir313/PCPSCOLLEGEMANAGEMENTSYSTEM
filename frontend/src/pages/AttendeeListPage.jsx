import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import { getEventImage, getCategoryColor } from '../utils/imageUtils';

export default function AttendeeListPage() {
  const { id } = useParams();
  const [attendees, setAttendees] = useState([]);
  const [event, setEvent]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');

  useEffect(() => {
    Promise.all([
      axiosInstance.get(`/api/events/${id}/attendees/`),
      axiosInstance.get(`/api/events/${id}/`),
    ])
      .then(([aRes, eRes]) => { setAttendees(aRes.data); setEvent(eRes.data); })
      .catch(() => setError('Unable to load attendee list.'))
      .finally(() => setLoading(false));
  }, [id]);

  const filtered = useMemo(() => {
    if (!search) return attendees;
    const q = search.toLowerCase();
    return attendees.filter(a =>
      a.username.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q)
    );
  }, [attendees, search]);

  // Export to CSV
  const handleExport = () => {
    const rows = [
      ['#', 'Username', 'Email', 'Registered At'],
      ...attendees.map((a, i) => [
        i + 1,
        a.username,
        a.email,
        new Date(a.registered_at).toLocaleString(),
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendees-${event?.title ?? id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const imgSrc   = event ? getEventImage(event) : null;
  const catColor = event ? getCategoryColor(event?.category) : 'from-pcps-blue to-pcps-blue-mid';
  const spotsLeft = event?.capacity != null
    ? Math.max(0, event.capacity - attendees.length)
    : null;

  return (
    <div className="min-h-full">

      {/* Hero */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        {imgSrc && (
          <img src={imgSrc} alt={event?.title}
            className="w-full h-full object-cover object-center" />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-pcps-blue/88 via-pcps-blue/60 to-pcps-red/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        <div className="relative h-full flex flex-col justify-center max-w-5xl mx-auto px-4">
          <Link to="/dashboard"
            className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white
                       text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-white/30 transition-all
                       border border-white/20 w-fit mb-3">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-5 bg-pcps-red rounded-full" />
            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">Attendee List</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight line-clamp-1">
            {event?.title || 'Event Attendees'}
          </h1>
          {!loading && (
            <p className="text-blue-200 text-sm mt-1">
              {attendees.length} registered attendee{attendees.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 30 Q360 5 720 15 Q1080 25 1440 5 L1440 30 Z" fill="#F7F8FA" />
          </svg>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Stat cards */}
        {event && !loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 animate-fade-up">
            {[
              { label: 'Registered',  value: attendees.length,           icon: '🎟', color: 'text-pcps-blue' },
              { label: 'Capacity',    value: event.capacity ?? '∞',       icon: '🏟', color: 'text-gray-600' },
              { label: 'Spots Left',  value: spotsLeft ?? '∞',            icon: '✅', color: spotsLeft === 0 ? 'text-pcps-red' : 'text-green-600' },
              { label: 'Fill Rate',   value: event.capacity ? `${Math.round((attendees.length / event.capacity) * 100)}%` : '—', icon: '📊', color: 'text-pcps-blue' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="card p-4 text-center hover:shadow-card-hover transition-shadow">
                <div className="text-2xl mb-1">{icon}</div>
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className="text-[10px] text-pcps-muted font-bold uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search + export bar */}
        {!loading && !error && attendees.length > 0 && (
          <div className="card p-4 mb-5 animate-fade-up stagger-1">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search attendees…"
                  className="form-input pl-11"
                />
              </div>
              <button
                onClick={handleExport}
                className="btn-outline-blue shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="card overflow-hidden animate-pulse">
            <div className={`h-1.5 bg-gradient-to-r ${catColor}`} />
            {[1,2,3,4].map(i => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0">
                <div className="skeleton w-9 h-9 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-1/3 rounded-lg" />
                  <div className="skeleton h-3 w-1/2 rounded-lg" />
                </div>
                <div className="skeleton h-3 w-28 rounded-lg" />
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

        {/* Empty */}
        {!loading && !error && attendees.length === 0 && (
          <div className="card text-center py-16 animate-fade-up">
            <div className="w-16 h-16 bg-pcps-blue-light rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
              <svg className="w-8 h-8 text-pcps-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-lg font-bold text-pcps-blue mb-1">No attendees yet</p>
            <p className="text-pcps-muted text-sm mb-5">Share your event QR code so people can register.</p>
            <Link to={`/events/${id}`} className="btn-blue">View Event →</Link>
          </div>
        )}

        {/* Table */}
        {!loading && !error && attendees.length > 0 && (
          <div className="card overflow-hidden animate-fade-up stagger-2">
            <div className={`h-1.5 bg-gradient-to-r ${catColor}`} />
            <div className="bg-gradient-to-r from-pcps-blue to-pcps-blue-mid px-5 py-3.5 flex items-center justify-between">
              <p className="text-white text-sm font-bold">Registered Attendees</p>
              <span className="text-xs font-bold bg-white/20 text-white px-3 py-1 rounded-full">
                {filtered.length} / {attendees.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-pcps-blue-light text-pcps-blue text-[11px] uppercase tracking-wider border-b border-pcps-blue/10">
                    {['#', 'Attendee', 'Email', 'Registered At'].map(h => (
                      <th key={h} className="px-5 py-3 text-left font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((a, i) => (
                    <tr key={`${a.username}-${i}`}
                      className="hover:bg-blue-50/40 transition-colors group animate-fade-up"
                      style={{ animationDelay: `${i * 0.025}s` }}
                    >
                      <td className="px-5 py-3.5 text-pcps-muted font-mono text-xs">{i + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${catColor}
                                          flex items-center justify-center text-white font-black text-sm shrink-0
                                          group-hover:scale-110 transition-transform duration-200`}>
                            {a.username[0]?.toUpperCase()}
                          </div>
                          <span className="font-semibold text-pcps-blue">{a.username}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-pcps-muted">{a.email || '—'}</td>
                      <td className="px-5 py-3.5 text-pcps-muted text-xs whitespace-nowrap">
                        {new Date(a.registered_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-pcps-muted text-sm">
                        No attendees match "{search}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
