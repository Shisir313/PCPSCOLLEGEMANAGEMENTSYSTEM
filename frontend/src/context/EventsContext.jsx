import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { getEvents } from '../services/eventService';

const EventsContext = createContext(null);

export function EventsProvider({ children, pagesToPrefetch = 3, adaptive = true, maxPages = 6 }) {
  // pages: { [pageNumber]: { results: [], count: 0 } }
  const [pages, setPages] = useState({});
  const [loading, setLoading] = useState(true);

  const PER_PAGE = 10; // server-side pagination size
  const CARD_HEIGHT = 180; // px estimate for one EventCard height

  const prefetchPage = useCallback(async (page) => {
    try {
      const data = await getEvents({ page });
      const results = Array.isArray(data) ? data : data.results ?? [];
      const count = data.count ?? results.length;
      setPages((prev) => ({ ...prev, [page]: { results, count } }));
      return { results, count };
    } catch {
      return null;
    }
  }, []);

  const computeAdaptivePages = useCallback(() => {
    if (!adaptive || typeof window === 'undefined') return pagesToPrefetch;
    try {
      const vh = window.innerHeight || 800;
      const visibleCards = Math.max(1, Math.floor(vh / CARD_HEIGHT));
      const buffer = 1.5; // fetch a bit more than visible
      const desiredItems = Math.ceil(visibleCards * buffer);
      const pagesNeeded = Math.ceil(desiredItems / PER_PAGE);
      return Math.min(maxPages, Math.max(1, pagesNeeded));
    } catch {
      return pagesToPrefetch;
    }
  }, [adaptive, pagesToPrefetch, maxPages]);

  const prefetch = useCallback(async () => {
    setLoading(true);
    setPages({});
    const first = await prefetchPage(1);
    if (first) {
      const totalPages = Math.max(1, Math.ceil(first.count / PER_PAGE));
      const desired = computeAdaptivePages();
      const toFetch = Math.min(desired, totalPages);
      const jobs = [];
      for (let p = 2; p <= toFetch; p++) jobs.push(prefetchPage(p));
      await Promise.all(jobs);
    }
    setLoading(false);
  }, [computeAdaptivePages, prefetchPage]);

  useEffect(() => { prefetch(); }, [prefetch]);

  const getPrefetchedPage = (page) => pages[page] ?? null;

  return (
    <EventsContext.Provider value={{ pages, getPrefetchedPage, loading, refresh: prefetch }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEventsContext() {
  return useContext(EventsContext);
}

export default EventsContext;
