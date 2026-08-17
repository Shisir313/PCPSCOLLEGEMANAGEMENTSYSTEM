import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none" style={{maxWidth:'360px'}}>
        {toasts.map(toast => (
          <div key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl border
                        text-sm font-medium animate-slide-in-right
                        ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                          toast.type === 'error'   ? 'bg-red-50 border-red-200 text-pcps-red' :
                          toast.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                          'bg-pcps-blue-light border-pcps-blue/20 text-pcps-blue'}`}>
            {/* Icon */}
            <span className="shrink-0 text-base mt-0.5">
              {toast.type === 'success' ? '✅' :
               toast.type === 'error'   ? '❌' :
               toast.type === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)}
              className="shrink-0 opacity-50 hover:opacity-100 transition-opacity ml-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
