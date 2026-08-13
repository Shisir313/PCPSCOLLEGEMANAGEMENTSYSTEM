import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import { getEventImage, getCategoryColor } from '../utils/imageUtils';

export default function AttendeeListPage() {
  const { id } = useParams();
  const [attendees, setAttendees] = useState([]);
  const [event, setEvent]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    Promise.all([
      axiosInstance.get(`/api/events/${id}/attendees/`),
      axiosInstance.get(`/api/events/${id}/`),
    ])
      .then(([aRes, eRes]) => { setAttendees(aRes.data); setEvent(eRes.data); })
      .catch(() => setError('Unable to load attendee list.'))
      .finally(() => setLoading(false));
  }, [id]);

  const imgSrc   = event ? getEventImage(event) : null;
  const catColor = event ? getCategoryColor(event?.category) : 'from-pcps-blue to-pcps-blue-mid';

  return (
    <div className="min-h-full">
      {/* Hero */}
      <div className="relative h-44 sm:h-52 overflow-hidden">
        {imgSrc && (
          <img src={imgSrc} alt={event?.title}
            className="w-full h-full object-cover object-center" />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-pcps-blue/88 via-pcps-blue/60 to-pcps-red/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        <div className="relative h-full flex flex-col justify-center max-w-5xl mx-auto px-4">
          <Link to="/dashboard"
            className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white text-xs font-semibold mb-3 transition-colors w-fit">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
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

        {/* Summary cards */}
        {event && !loading && (
          <div className="grid grid-cols-3 gap-4 mb-6 animate-fade-up">
            {[
              { label: 'Registered', value: attendees.length, color: 'text-pcps-blue' },
              { label: 'Capacity',   value: event.capacity ?? '∞', color: 'text-gray-600' },
              { label: 'Spots Left', value: event.capacity != null ? Math.max(0, event.capacity - attendees.length) : '∞',
                color: attendees.length >= (event.capacity ?? Infinity) ? 'text-pcps-red' : 'text-green-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card p-4 text-center">
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className="text-xs text-pcps-muted font-semibold uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="card overflow-hidden animate-pulse">
            <div className={`h-1.5 bg-gradient-to-r ${catColor}`} />
            {[1,2,3,4].map(i => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0">
                <div className="skeleton w-9 h-9 rounded-full" />
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
            <p className="text-pcps-muted text-sm">Share your event so people can register.</p>
          </div>
        )}

        {/* Attendee table */}
        {!loading && !error && attendees.length > 0 && (
          <div className="card overflow-hidden animate-fade-up">
            <div className={`h-1.5 bg-gradient-to-r ${catColor}`} />

            {/* Table header */}
            <div className="bg-pcps-blue px-5 py-3 flex items-center justify-between">
              <p className="text-white text-sm font-bold">Registered Attendees</p>
              <span className="badge-red text-[10px]">{attendees.length} total</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-pcps-blue-light text-pcps-blue text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 text-left font-bold">#</th>
                    <th className="px-5 py-3 text-left font-bold">Student</th>
                    <th className="px-5 py-3 text-left font-bold">Email</th>
                    <th className="px-5 py-3 text-left font-bold">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {attendees.map((a, i) => (
                    <tr key={`${a.username}-${i}`}
                      className="hover:bg-pcps-blue-light/30 transition-colors group animate-fade-up"
                      style={{animationDelay:`${i * 0.03}s`}}>
                      <td className="px-5 py-3.5 text-pcps-muted font-mono text-xs">{i + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {/* Avatar */}
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${catColor}
                                          flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                            {a.username[0]?.toUpperCase()}
                          </div>
                          <span className="font-semibold text-pcps-blue">{a.username}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-pcps-muted">{a.email}</td>
                      <td className="px-5 py-3.5 text-pcps-muted text-xs">
                        {new Date(a.registered_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
