import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

/**
 * EventQRModal — shows a shareable registration QR for an event.
 *
 * The QR encodes the full event URL (e.g. https://yoursite.com/events/5).
 * Attendees scan it with their phone camera → browser opens the event page → they register.
 *
 * Props:
 *   eventId   {number}   — event id
 *   eventTitle {string}  — event title shown in the header
 *   onClose   {function} — called when dismissed
 */
export default function EventQRModal({ eventId, eventTitle, onClose }) {
  const canvasRef = useRef(null);

  // Build the full public URL for this event
  const eventUrl = `${window.location.origin}/events/${eventId}`;

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, eventUrl, {
      width: 240,
      margin: 2,
      color: { dark: '#1B2F5E', light: '#FFFFFF' },
    });
  }, [eventUrl]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `event-qr-${eventTitle ?? eventId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      // brief visual feedback handled by the button label toggle in parent if needed
      alert('Link copied to clipboard!');
    } catch {
      alert('Could not copy — please copy manually:\n' + eventUrl);
    }
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-up overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-pcps-blue to-pcps-blue/80 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-0.5">
              Event Registration QR
            </p>
            <p className="text-white font-bold text-sm leading-tight line-clamp-2">{eventTitle}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center
                       text-white transition-colors shrink-0 ml-3"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col items-center px-6 py-6 gap-4">

          {/* QR canvas */}
          <div className="p-3 bg-white rounded-xl shadow-inner border border-gray-100">
            <canvas ref={canvasRef} className="block" />
          </div>

          {/* URL pill */}
          <div className="flex items-center gap-2 w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <svg className="w-3.5 h-3.5 text-pcps-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="text-xs text-gray-500 truncate flex-1">{eventUrl}</span>
          </div>

          {/* Instructions */}
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Share or print this QR code. Attendees scan it with their phone camera to open the event page and register.
          </p>

          {/* Action buttons */}
          <div className="flex gap-3 w-full">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 bg-pcps-blue text-white
                         text-sm font-bold py-2.5 rounded-xl hover:bg-pcps-blue/90 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200
                         text-gray-600 text-sm font-bold py-2.5 rounded-xl hover:border-pcps-blue
                         hover:text-pcps-blue transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3" />
              </svg>
              Copy Link
            </button>
          </div>
        </div>

        {/* Footer hint */}
        <div className="bg-blue-50 border-t border-blue-100 px-5 py-3">
          <p className="text-[11px] text-pcps-blue/70 text-center">
            No app needed — works with any phone camera
          </p>
        </div>
      </div>
    </div>
  );
}
