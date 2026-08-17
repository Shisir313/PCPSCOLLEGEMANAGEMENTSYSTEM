import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

/**
 * QRCodeModal — shows a QR code that encodes `value` in a modal overlay.
 *
 * Props:
 *   value      {string}   — the string to encode (qr_token UUID)
 *   title      {string}   — event title shown above the QR
 *   onClose    {function} — called when the user dismisses the modal
 */
export default function QRCodeModal({ value, title, onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: 240,
      margin: 2,
      color: { dark: '#1B2F5E', light: '#FFFFFF' }, // pcps-blue on white
    });
  }, [value]);

  // Download the canvas as a PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qr-${title ?? 'event'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Close on backdrop click
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
              QR Registration Pass
            </p>
            <p className="text-white font-bold text-sm leading-tight line-clamp-2">{title}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close QR modal"
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center
                       text-white transition-colors shrink-0 ml-3"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* QR canvas */}
        <div className="flex flex-col items-center px-6 py-6 gap-4">
          <div className="p-3 bg-white rounded-xl shadow-inner border border-gray-100">
            <canvas ref={canvasRef} className="block" />
          </div>

          <p className="text-xs text-gray-500 text-center max-w-[220px] leading-relaxed">
            Show this QR code to the event organizer at the entrance to check in.
          </p>

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 bg-pcps-blue text-white
                         text-sm font-bold py-2.5 rounded-xl hover:bg-pcps-blue/90 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200
                         text-gray-600 text-sm font-bold py-2.5 rounded-xl hover:border-pcps-blue
                         hover:text-pcps-blue transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Bottom hint */}
        <div className="bg-blue-50 border-t border-blue-100 px-5 py-3">
          <p className="text-[11px] text-pcps-blue/70 text-center">
            Each QR code is unique to your registration. Keep it safe.
          </p>
        </div>
      </div>
    </div>
  );
}
