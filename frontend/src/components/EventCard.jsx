import { Link } from 'react-router-dom';
import { getEventImage, getCategoryColor } from '../utils/imageUtils';

export default function EventCard({ event }) {
  const { id, title, date, time, location, rsvp_count, capacity, category } = event;

  const isSoldOut = capacity != null && rsvp_count >= capacity;
  const today     = new Date(); today.setHours(0,0,0,0);
  const eDate     = new Date(`${date}T00:00:00`);
  const isToday   = eDate.getTime() === today.getTime();
  const isPast    = eDate < today;
  const spotsLeft = capacity != null ? Math.max(0, capacity - rsvp_count) : null;
  const month     = eDate.toLocaleDateString('en-US', { month: 'short' });
  const day       = eDate.getDate();
  const weekday   = eDate.toLocaleDateString('en-US', { weekday: 'short' });
  const imgSrc    = getEventImage(event);
  const catColor  = getCategoryColor(category);

  return (
    <Link
      to={`/events/${id}`}
      className="group block bg-white rounded-2xl border border-gray-100
                 shadow-card hover:shadow-card-hover hover:-translate-y-1
                 transition-all duration-300 overflow-hidden"
    >
      <div className="flex items-stretch">

        {/* ── Cover image strip ── */}
        <div className="relative shrink-0 w-28 sm:w-40 overflow-hidden">
          <img
            src={imgSrc}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling.style.display = 'flex';
            }}
          />
          {/* Fallback gradient */}
          <div style={{ display: 'none' }}
            className={`w-full h-full bg-gradient-to-b ${catColor} items-center justify-center`}>
            <svg className="w-10 h-10 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Date badge overlay */}
          <div className={`absolute bottom-0 left-0 right-0 py-2 text-center
                           ${isPast ? 'bg-gray-700/80' : 'bg-gradient-to-r from-pcps-blue/90 to-pcps-red/90'}
                           group-hover:from-pcps-red/90 group-hover:to-pcps-blue/90 transition-all duration-500`}>
            <p className="text-white/70 text-[9px] font-bold uppercase tracking-widest">{weekday}</p>
            <p className="text-white font-black text-xl leading-none">{day}</p>
            <p className="text-white/80 text-[10px] font-semibold uppercase">{month}</p>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 px-4 py-4 min-w-0">
          {/* Badges row */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {isToday && !isPast && <span className="badge-red text-[10px] animate-pulse">🔴 Today</span>}
            {isPast  && <span className="badge-gray text-[10px]">Past</span>}
            {!isPast && !isToday && <span className="badge-green text-[10px]">✓ Upcoming</span>}
            {isSoldOut && <span className="badge-red text-[10px]">Sold Out</span>}
            {category && (
              <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${catColor}`}>
                {category.name}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-bold text-pcps-blue group-hover:text-pcps-red
                         transition-colors duration-200 leading-snug line-clamp-2 mb-2">
            {title}
          </h3>

          {/* Meta */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-pcps-muted">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 text-pcps-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {time?.slice(0,5)}
            </span>
            <span className="flex items-center gap-1 truncate max-w-[160px]">
              <svg className="w-3 h-3 text-pcps-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {location}
            </span>
            {spotsLeft !== null && (
              <span className={`flex items-center gap-1 font-semibold ${
                spotsLeft === 0 ? 'text-pcps-red' : spotsLeft <= 5 ? 'text-amber-600' : 'text-green-600'
              }`}>
                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {spotsLeft === 0 ? 'Full' : `${spotsLeft} left`}
              </span>
            )}
          </div>

          {/* Capacity bar */}
          {capacity != null && (
            <div className="mt-2.5">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isSoldOut ? 'bg-pcps-red' : spotsLeft <= 5 ? 'bg-amber-400' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100,(rsvp_count/capacity)*100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Arrow */}
        <div className="hidden sm:flex items-center pr-4 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gray-50 group-hover:bg-pcps-red flex items-center justify-center
                          transition-all duration-300 group-hover:scale-110">
            <svg className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
