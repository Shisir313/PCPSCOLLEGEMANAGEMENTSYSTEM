import { Link, useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-112px)] flex items-center justify-center px-4 bg-pcps-offwhite">
      <div className="text-center max-w-md animate-fade-up">
        {/* Big 404 */}
        <div className="relative mb-8">
          <p className="text-[120px] font-black leading-none select-none"
            style={{
              background: 'linear-gradient(135deg, #1B4F9B 0%, #CC1122 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-pcps-blue/5 animate-pulse-slow" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-pcps-blue mb-3">Page Not Found</h1>
        <p className="text-pcps-muted text-sm leading-relaxed mb-8">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="btn-outline-blue">
            ← Go Back
          </button>
          <Link to="/events" className="btn-red">
            Browse Events
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-pcps-muted mb-3 font-semibold uppercase tracking-wider">Quick Links</p>
          <div className="flex justify-center gap-4 text-sm">
            <Link to="/login"    className="text-pcps-blue hover:text-pcps-red transition-colors font-medium">Login</Link>
            <Link to="/register" className="text-pcps-blue hover:text-pcps-red transition-colors font-medium">Register</Link>
            <Link to="/events"   className="text-pcps-blue hover:text-pcps-red transition-colors font-medium">Events</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
