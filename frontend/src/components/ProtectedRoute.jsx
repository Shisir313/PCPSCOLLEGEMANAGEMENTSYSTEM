import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * A wrapper component that guards routes by authentication status and role.
 *
 * Usage:
 *   <Route element={<ProtectedRoute roles={['organizer']} />}>
 *     <Route path="/events/new" element={<EventFormPage />} />
 *   </Route>
 *
 * - If loading: show a spinner.
 * - If not authenticated: redirect to /login.
 * - If authenticated but wrong role: redirect to /events.
 * - Otherwise: render the nested <Outlet />.
 */
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: pathname }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/events" replace />;
  }

  return <Outlet />;
}
