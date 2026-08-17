import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRsvp, deleteRsvp } from '../services/rsvpService';
import { useAuth } from '../hooks/useAuth';
import { FlagsContext } from '../context/FlagsContext';

/**
 * RSVPButton — handles RSVP creation and cancellation for an event.
 *
 * @param {Object}   event        - Full event object (needs id, capacity, rsvp_count)
 * @param {number|null} currentRsvpId - The attendee's existing RSVP id, or null if not registered
 * @param {Function} onRsvpChange - Callback(newRsvpId) called after RSVP state changes
 */
export default function RSVPButton({ event, currentRsvpId, onRsvpChange }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { flags, loading: flagsLoading } = useContext(FlagsContext);
  const navigate = useNavigate();

  const isSoldOut =
    event.capacity != null && event.rsvp_count >= event.capacity && !currentRsvpId;

  // Disable RSVP for past events (compare date+time to now)
  const eventDateTime = new Date(`${event.date}T${event.time ?? '00:00:00'}`);
  const isPastEvent = eventDateTime.getTime() < Date.now();

  // Respect runtime flag: if RSVPs require auth and user is anonymous, show login prompt
  const requireRsvpAuth = flagsLoading ? true : Boolean(flags?.require_rsvp_auth);
  if (requireRsvpAuth && !user) {
    return (
      <div className="mt-4">
        <button
          onClick={() => navigate('/login')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg"
        >
          Log in to RSVP
        </button>
      </div>
    );
  }
  if (!user || user.role !== 'attendee') return null;
  if (isPastEvent) {
    return (
      <div className="mt-4">
        <button disabled className="bg-gray-300 text-gray-600 font-semibold px-6 py-2 rounded-lg cursor-not-allowed">
          Event Ended
        </button>
      </div>
    );
  }

  const handleRsvp = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await createRsvp(event.id);
      // pass both the RSVP id and its qr_token back to the parent
      onRsvpChange(data.id, data.qr_token ?? null);
    } catch (err) {
      setError(err?.data?.non_field_errors?.[0] || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteRsvp(currentRsvpId);
      onRsvpChange(null);
    } catch {
      setError('Failed to cancel registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {error && (
        <p className="text-sm text-red-600 mb-2">{error}</p>
      )}

      {currentRsvpId ? (
        <button
          onClick={handleCancel}
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          {loading ? 'Cancelling…' : 'Cancel RSVP'}
        </button>
      ) : isSoldOut ? (
        <button
          disabled
          className="bg-gray-300 text-gray-500 font-semibold px-6 py-2 rounded-lg cursor-not-allowed"
        >
          Sold Out
        </button>
      ) : (
        <button
          onClick={handleRsvp}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          {loading ? 'Registering…' : 'Click Here to Register'}
        </button>
      )}
    </div>
  );
}
