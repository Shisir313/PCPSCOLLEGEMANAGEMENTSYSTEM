import { createContext, useState, useEffect } from 'react';
import flagsService from '../services/flagsService';

export const FlagsContext = createContext({});

export function FlagsProvider({ children }) {
  const [flags, setFlags] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    flagsService.getFlags().then((data) => {
      if (mounted) setFlags(data);
    }).catch(() => {
      // If flags endpoint fails, fall back to defaults (null means unknown)
      if (mounted) setFlags(null);
    }).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await flagsService.getFlags();
      setFlags(data);
    } catch {
      setFlags(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FlagsContext.Provider value={{ flags, loading, refresh }}>
      {children}
    </FlagsContext.Provider>
  );
}
