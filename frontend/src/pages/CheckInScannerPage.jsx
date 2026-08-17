import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axiosInstance from '../services/axiosInstance';
import { useToast } from '../context/ToastContext';

const HERO = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&q=80';

// ── Camera permission states ──────────────────────────────────────────────
// 'idle'     — page just loaded, haven't asked yet
// 'asking'   — getUserMedia() in flight
// 'granted'  — permission given, scanner can start
// 'denied'   — user or browser blocked it
// 'error'    — unexpected error while requesting
const CAM = { IDLE: 'idle', ASKING: 'asking', GRANTED: 'granted', DENIED: 'denied', ERROR: 'error' };

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function CheckInScannerPage() {
  const { id }        = useParams();
  const { addToast }  = useToast();

  // Event data
  const [event, setEvent]           = useState(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [eventError, setEventError]   = useState(null);

  // Camera permission gate
  const [camState, setCamState]       = useState(CAM.IDLE);
  const [camErrorMsg, setCamErrorMsg] = useState('');
  const streamRef = useRef(null); // hold the stream so we can stop it after scanner takes over

  // Scanner
  const scannerRef        = useRef(null);
  const scannerMountedRef = useRef(false);
  const processingRef     = useRef(false);

  // Check-in
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [lastResult, setLastResult]         = useState(null);
  const [checkInHistory, setCheckInHistory] = useState([]);
  const [sessionCount, setSessionCount]     = useState(0);

  // Manual fallback
  const [manualToken, setManualToken]   = useState('');
  const [manualLoading, setManualLoading] = useState(false);

  // ── Fetch event ───────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setEventLoading(true);
      try {
        const { data } = await axiosInstance.get(`/api/events/${id}/`);
        setEvent(data);
      } catch {
        setEventError('Failed to load event details.');
      } finally {
        setEventLoading(false);
      }
    })();
  }, [id]);

  // ── Check existing permission state on mount (non-blocking) ──────────────
  // Browsers expose navigator.permissions — if already granted we skip the gate.
  useEffect(() => {
    if (!navigator.permissions) return; // API not available, stay idle
    navigator.permissions.query({ name: 'camera' }).then((result) => {
      if (result.state === 'granted') {
        setCamState(CAM.GRANTED);
      } else if (result.state === 'denied') {
        setCamState(CAM.DENIED);
        setCamErrorMsg('Camera permission has been blocked for this site.');
      }
      // 'prompt' → stay idle so user sees the request screen
    }).catch(() => {
      // permissions API unavailable for 'camera' on some browsers — stay idle
    });
  }, []);

  // ── Request camera permission explicitly ─────────────────────────────────
  const requestCamera = useCallback(async () => {
    setCamState(CAM.ASKING);
    setCamErrorMsg('');
    try {
      // This call triggers the browser's native permission dialog
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      // Keep track of the stream so we can stop its tracks once the scanner
      // takes over (html5-qrcode opens its own stream internally)
      streamRef.current = stream;
      setCamState(CAM.GRANTED);
    } catch (err) {
      const name = err?.name ?? '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setCamState(CAM.DENIED);
        setCamErrorMsg('You denied camera access. Please allow it in your browser settings and reload.');
      } else if (name === 'NotFoundError') {
        setCamState(CAM.DENIED);
        setCamErrorMsg('No camera was found on this device.');
      } else if (name === 'NotReadableError') {
        setCamState(CAM.ERROR);
        setCamErrorMsg('Camera is already in use by another application.');
      } else {
        setCamState(CAM.ERROR);
        setCamErrorMsg(err?.message || 'An unexpected error occurred while accessing the camera.');
      }
    }
  }, []);

  // ── Mount the QR scanner once camera is granted ───────────────────────────
  useEffect(() => {
    if (camState !== CAM.GRANTED) return;
    if (scannerMountedRef.current) return;
    scannerMountedRef.current = true;

    // Stop our probe stream before html5-qrcode opens its own
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    let scanner;
    try {
      scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      scanner.render(onScanSuccess, () => {}); // onScanFailure is a no-op
      scannerRef.current = scanner;
    } catch {
      setCamState(CAM.ERROR);
      setCamErrorMsg('Could not initialise the QR scanner. Please reload.');
      scannerMountedRef.current = false;
    }

    return () => {
      scannerMountedRef.current = false;
      scanner?.clear().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camState]);

  // ── Check-in API ─────────────────────────────────────────────────────────
  const processCheckIn = useCallback(
    async (token, { setLoading, onSuccess, onError }) => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.post('/api/rsvps/checkin/', { qr_token: token });

        const entry = {
          attendee: data.attendee,
          event: data.event,
          checked_in_at: data.checked_in_at,
          timestamp: Date.now(),
        };
        setCheckInHistory((prev) => [entry, ...prev].slice(0, 10));
        setSessionCount((c) => c + 1);
        setLastResult({
          type: 'success',
          message: `${data.attendee} checked in successfully!`,
          attendee: data.attendee,
          event: data.event,
          checked_in_at: data.checked_in_at,
        });
        addToast(`✅ ${data.attendee} checked in!`, 'success');
        onSuccess?.();
      } catch (err) {
        const msg =
          err.response?.data?.error ||
          err.response?.data?.detail ||
          'Check-in failed. Please try again.';
        setLastResult({ type: 'error', message: msg });
        onError?.();
      } finally {
        setLoading(false);
      }
    },
    [addToast]
  );

  const onScanSuccess = useCallback(
    (decodedText) => {
      if (processingRef.current || checkInLoading) return;
      processingRef.current = true;
      processCheckIn(decodedText, {
        setLoading: setCheckInLoading,
        onSuccess: () => { processingRef.current = false; },
        onError:   () => { processingRef.current = false; },
      });
    },
    [checkInLoading, processCheckIn]
  );

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const token = manualToken.trim();
    if (!token) return;
    await processCheckIn(token, {
      setLoading: setManualLoading,
      onSuccess: () => setManualToken(''),
      onError: () => {},
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full animate-fade-in">

      {/* Hero */}
      <div className="relative h-44 sm:h-52 overflow-hidden">
        <img src={HERO} alt="Scanner" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-pcps-blue/88 via-pcps-blue/60 to-pcps-red/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="relative h-full flex flex-col justify-center max-w-5xl mx-auto px-4">
          <Link
            to={event ? `/events/${id}` : '/dashboard'}
            className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white
                       text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-white/30 transition-all
                       border border-white/20 w-fit mb-3"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-5 bg-pcps-red rounded-full" />
            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">QR Check-In Scanner</p>
          </div>
          {eventLoading ? (
            <div className="h-8 w-64 bg-white/20 rounded-lg animate-pulse" />
          ) : (
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {event?.title ?? 'Event Check-In'}
            </h1>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 30 Q360 5 720 15 Q1080 25 1440 5 L1440 30 Z" fill="#F7F8FA" />
          </svg>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {eventError && (
          <div className="card p-4 border-l-4 border-pcps-red bg-red-50 mb-4 text-sm text-pcps-red font-semibold">
            {eventError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: scanner area ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Session counter */}
            <div className="card p-4 flex items-center justify-between animate-fade-up">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pcps-blue-light rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-pcps-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-pcps-muted font-bold uppercase tracking-wider">Session Total</p>
                  <p className="text-xl font-black text-pcps-blue">
                    Checked in: <span className="text-green-600">{sessionCount}</span> this session
                  </p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center border-2 border-green-200">
                <span className="text-2xl font-black text-green-600">{sessionCount}</span>
              </div>
            </div>

            {/* ── Camera permission gate / Scanner ── */}
            <div className="card p-5 animate-fade-up stagger-1">
              <h2 className="text-sm font-bold text-pcps-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-pcps-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                QR Code Scanner
              </h2>

              {/* ── IDLE: show permission request UI ── */}
              {camState === CAM.IDLE && (
                <div className="flex flex-col items-center text-center py-8 px-4 gap-5">
                  {/* Camera icon */}
                  <div className="w-20 h-20 bg-pcps-blue-light rounded-2xl flex items-center justify-center">
                    <svg className="w-10 h-10 text-pcps-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>

                  <div>
                    <p className="text-lg font-bold text-pcps-blue mb-1">Camera Access Required</p>
                    <p className="text-sm text-pcps-muted max-w-xs leading-relaxed">
                      To scan attendee QR codes, this page needs access to your camera.
                      Your browser will show a permission prompt.
                    </p>
                  </div>

                  {/* What to expect callout */}
                  <div className="w-full bg-blue-50 border border-pcps-blue/20 rounded-xl px-4 py-3 text-left">
                    <p className="text-xs font-bold text-pcps-blue mb-2 uppercase tracking-wide">What happens next</p>
                    <ul className="space-y-1.5 text-xs text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-pcps-blue mt-0.5 shrink-0">①</span>
                        Your browser will ask: <em>"Allow camera access?"</em>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-pcps-blue mt-0.5 shrink-0">②</span>
                        Click <strong>Allow</strong> to start the scanner.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-pcps-blue mt-0.5 shrink-0">③</span>
                        Point your camera at an attendee's QR code to check them in.
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={requestCamera}
                    className="inline-flex items-center gap-2 bg-pcps-blue text-white font-bold
                               px-8 py-3 rounded-xl hover:bg-pcps-blue/90 transition-colors shadow-lg
                               hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Enable Camera
                  </button>

                  <p className="text-xs text-pcps-muted">
                    No camera? Use the manual token entry below instead.
                  </p>
                </div>
              )}

              {/* ── ASKING: spinner while browser prompt is open ── */}
              {camState === CAM.ASKING && (
                <div className="flex flex-col items-center text-center py-10 gap-4">
                  <div className="relative w-16 h-16">
                    <div className="w-16 h-16 border-4 border-pcps-blue/20 border-t-pcps-blue rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-6 h-6 text-pcps-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-base font-bold text-pcps-blue mb-1">Waiting for permission…</p>
                    <p className="text-sm text-pcps-muted">
                      Please respond to the browser prompt to allow camera access.
                    </p>
                  </div>
                </div>
              )}

              {/* ── GRANTED: mount the scanner ── */}
              {camState === CAM.GRANTED && (
                <>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700
                                     bg-green-100 border border-green-200 px-3 py-1 rounded-full">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                          clipRule="evenodd" />
                      </svg>
                      Camera active
                    </span>
                    <span className="text-xs text-pcps-muted">Point at an attendee's QR code</span>
                  </div>
                  {/* html5-qrcode renders into this div */}
                  <div id="qr-reader" className="rounded-xl overflow-hidden" />
                  {checkInLoading && (
                    <div className="mt-4 flex items-center justify-center gap-3 py-3">
                      <div className="w-6 h-6 border-2 border-pcps-blue/20 border-t-pcps-blue rounded-full animate-spin" />
                      <span className="text-sm text-pcps-muted font-medium">Processing check-in…</span>
                    </div>
                  )}
                </>
              )}

              {/* ── DENIED / ERROR: instructions to fix it ── */}
              {(camState === CAM.DENIED || camState === CAM.ERROR) && (
                <div className="flex flex-col items-center text-center py-8 px-4 gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center
                                  ${camState === CAM.DENIED ? 'bg-amber-50' : 'bg-red-50'}`}>
                    <svg className={`w-8 h-8 ${camState === CAM.DENIED ? 'text-amber-500' : 'text-pcps-red'}`}
                         fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>

                  <div>
                    <p className="text-base font-bold text-gray-800 mb-1">
                      {camState === CAM.DENIED ? 'Camera Access Denied' : 'Camera Error'}
                    </p>
                    <p className="text-sm text-pcps-muted max-w-xs">{camErrorMsg}</p>
                  </div>

                  {camState === CAM.DENIED && (
                    <div className="w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-left">
                      <p className="text-xs font-bold text-amber-700 mb-1.5">How to re-enable camera</p>
                      <ul className="text-xs text-amber-800 space-y-1">
                        <li>• Click the 🔒 or 📷 icon in your browser's address bar</li>
                        <li>• Set <strong>Camera</strong> to <strong>Allow</strong></li>
                        <li>• Reload this page</li>
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => { setCamState(CAM.IDLE); setCamErrorMsg(''); }}
                    className="inline-flex items-center gap-2 border-2 border-pcps-blue text-pcps-blue
                               font-bold px-6 py-2.5 rounded-xl hover:bg-pcps-blue hover:text-white
                               transition-colors text-sm"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>

            {/* Last scan result */}
            {lastResult && (
              <div className={`card p-5 border-l-4 animate-fade-up ${
                lastResult.type === 'success' ? 'border-green-500 bg-green-50' : 'border-pcps-red bg-red-50'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    lastResult.type === 'success' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {lastResult.type === 'success' ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-pcps-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-bold mb-0.5 ${
                      lastResult.type === 'success' ? 'text-green-700' : 'text-pcps-red'
                    }`}>
                      {lastResult.type === 'success' ? 'Check-In Successful' : 'Check-In Failed'}
                    </p>
                    <p className={`text-sm ${lastResult.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {lastResult.message}
                    </p>
                    {lastResult.type === 'success' && lastResult.checked_in_at && (
                      <p className="text-xs text-green-500 mt-1">at {formatDateTime(lastResult.checked_in_at)}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Manual token fallback */}
            <div className="card p-5 animate-fade-up stagger-2">
              <h3 className="text-sm font-bold text-pcps-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-pcps-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Manual Token Entry
              </h3>
              <p className="text-xs text-pcps-muted mb-3">
                {camState === CAM.DENIED || camState === CAM.ERROR
                  ? "Camera unavailable — paste the attendee's QR token to check them in."
                  : "Alternatively, paste a QR token to check in without scanning."}
              </p>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Paste QR token (UUID)…"
                  aria-label="QR token for manual check-in"
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none
                             focus:ring-2 focus:ring-pcps-blue/30 focus:border-pcps-blue bg-white"
                />
                <button
                  type="submit"
                  disabled={!manualToken.trim() || manualLoading}
                  aria-label="Submit manual check-in token"
                  className="btn-blue shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {manualLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  Check In
                </button>
              </form>
            </div>
          </div>

          {/* ── Right: check-in history ── */}
          <div className="space-y-4">
            <div className="card p-5 animate-fade-up stagger-3">
              <h3 className="text-sm font-bold text-pcps-blue uppercase tracking-wider mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Recent Check-Ins
                </span>
                {checkInHistory.length > 0 && (
                  <span className="text-xs font-bold bg-pcps-blue text-white rounded-full px-2 py-0.5">
                    {checkInHistory.length}
                  </span>
                )}
              </h3>

              {checkInHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-xs text-pcps-muted font-medium">No check-ins yet this session</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {checkInHistory.map((entry, i) => (
                    <div
                      key={entry.timestamp}
                      className="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-100 animate-fade-up"
                      style={{ animationDelay: `${i * 0.03}s` }}
                    >
                      <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-800 truncate">{entry.attendee}</p>
                        <p className="text-xs text-pcps-muted truncate">{entry.event}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {entry.checked_in_at ? formatDateTime(entry.checked_in_at) : formatTime(entry.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
