import { Link } from 'react-router-dom';
import { getEventImage, getCategoryColor } from '../utils/imageUtils';

export default function EventCard({ event }) {
  const { id, title, date, time, location, rsvp_count, capacity, category, organizer_username } = event;

  const isSoldOut  = capacity != null && rsvp_count >= capacity;
  const today      = new Date(); today.setHours(0,0,0,0);
  const eDate      = new Date(`${date}T00:00:00`);
  const isToday    = eDate.getTime() === today.getTime();
  const isPast     = eDate < today;
  const spotsLeft  = capacity != null ? Math.max(0, capacity - rsvp_count) : null;
  const pct        = capacity ? Math.min(100, (rsvp_count / capacity) * 100) : 0;
  const month      = eDate.toLocaleDateString('en-US', { month: 'short' });
  const day        = eDate.getDate();
  const imgSrc     = getEventImage(event);
  const catColor   = getCategoryColor(category);

  return (
    <Link
      to={`/events/${id}`}
      className="group block bg-white rounded-2xl border border-gray-100
                 shadow-card hover:shadow-card-hover hover:-translate-y-1
                 transition-all duration-300 overflow-hidden"
    >
      <div className="flex items-stretch">

        {/* ── Cover image ── */}
        <div className="relative shrink-0 w-32 sm:w-44 overflow-hidden">
          <img
            src={imgSrc}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling.style.display = 'flex';
            }}
          />
          {/* Gradient fallback */}
          <div style={{ display: 'none' }}
            className={`w-full h-full bg-gradient-to-br ${catColor} items-center justify-center`}>
            <svg className="w-12 h-12 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Date badge */}
          <div className="absolute bottom-0 left-0 right-0 py-2.5 text-center
                          bg-gradient-to-t from-black/80 via-black/40 to-transparent
                          group-hover:from-pcps-blue/90 transition-all duration-500">
            <p className="text-white font-black text-2xl leading-none">{day}</p>
            <p className="text-white/80 text-[11px] font-bold uppercase tracking-wider">{month}</p>
          </div>

          {/* Today pulse ring */}
          {isToday && (
            <div className="absolute top-2 right-2 w-3 h-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pcps-red opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-pcps-red" />
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 px-4 py-4 min-w-0 flex flex-col justify-between">
          <div>
            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {isToday && !isPast && (
                <span className="badge-red text-[10px] animate-pulse">🔴 Today</span>
              )}
              {isPast && <span className="badge-gray text-[10px]">Past</span>}
              {!isPast && !isToday && <span className="badge-green text-[10px]">✓ Upcoming</span>}
              {isSoldOut && <span className="badge-red text-[10px]">🔥 Sold Out</span>}
              {category && (
                <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5
                                  rounded-full text-white bg-gradient-to-r ${catColor}`}>
                  {category.name}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-sm sm:text-base font-bold text-pcps-blue group-hover:text-pcps-red
                           transition-colors duration-200 leading-snug line-clamp-2 mb-2.5">
              {title}
            </h3>

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-pcps-muted">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-pcps-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {time?.slice(0,5)}
              </span>
              <span className="flex items-center gap-1.5 truncate max-w-[180px]">
                <svg className="w-3.5 h-3.5 text-pcps-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {location}
              </span>
              {organizer_username && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-pcps-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {organizer_username}
                </span>
              )}
            </div>
          </div>

          {/* Bottom: capacity bar + spots */}
          <div className="mt-3">
            {capacity != null ? (
              <>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-pcps-muted font-medium">
                    {rsvp_count} / {capacity} registered
                  </span>
                  <span className={`text-[10px] font-bold ${
                    isSoldOut ? 'text-pcps-red' : spotsLeft <= 5 ? 'text-amber-600' : 'text-green-600'
                  }`}>
                    {isSoldOut ? 'Full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isSoldOut ? 'bg-pcps-red' : pct >= 80 ? 'bg-amber-400' : 'bg-green-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </>
            ) : (
              <span className="text-[10px] text-pcps-muted">
                {rsvp_count} registered · Unlimited capacity
              </span>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden sm:flex items-center pr-4 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-pcps-blue-light group-hover:bg-pcps-red
                          flex items-center justify-center transition-all duration-300
                          group-hover:scale-110 group-hover:shadow-glow-red">
            <svg className="w-4 h-4 text-pcps-blue group-hover:text-white transition-colors"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
