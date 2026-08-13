import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EventsProvider } from './context/EventsContext';
import { FlagsProvider } from './context/FlagsContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventListPage from './pages/EventListPage';
import EventDetailPage from './pages/EventDetailPage';
import EventFormPage from './pages/EventFormPage';
import MyEventsPage from './pages/MyEventsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import OrganizerDashboardPage from './pages/OrganizerDashboardPage';
import AttendeeListPage from './pages/AttendeeListPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <FlagsProvider>
            <EventsProvider>
              <Router>
                <div className="min-h-screen bg-pcps-offwhite flex flex-col">
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Navigate to="/events" replace />} />

                      {/* Public */}
                      <Route path="/login"    element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/events"   element={<EventListPage />} />
                      <Route path="/events/:id" element={<EventDetailPage />} />

                      {/* Attendee */}
                      <Route element={<ProtectedRoute roles={['attendee']} />}>
                        <Route path="/my-events" element={<MyEventsPage />} />
                      </Route>

                      {/* Organizer */}
                      <Route element={<ProtectedRoute roles={['organizer']} />}>
                        <Route path="/events/new"        element={<EventFormPage />} />
                        <Route path="/events/:id/edit"   element={<EventFormPage />} />
                        <Route path="/dashboard"         element={<OrganizerDashboardPage />} />
                        <Route path="/events/:id/attendees" element={<AttendeeListPage />} />
                      </Route>

                      {/* Admin */}
                      <Route element={<ProtectedRoute roles={['admin']} />}>
                        <Route path="/admin/users" element={<AdminUsersPage />} />
                      </Route>

                      {/* 404 */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </main>

                  <footer className="bg-pcps-blue mt-auto">
                    <div className="h-1 bg-pcps-red" />
                    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src="/pcps-logo.png" alt="PCPS"
                          className="h-8 w-auto object-contain brightness-0 invert"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        <div>
                          <p className="text-white text-sm font-bold leading-tight">PCPS College</p>
                          <p className="text-blue-300 text-xs">Event Management System</p>
                        </div>
                      </div>
                      <p className="text-blue-300 text-xs text-center sm:text-right">
                        © {new Date().getFullYear()} PCPS College. All rights reserved.
                        <span className="mx-2 opacity-40">|</span>
                        Powered by React + Django
                      </p>
                    </div>
                  </footer>
                </div>
              </Router>
            </EventsProvider>
          </FlagsProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
