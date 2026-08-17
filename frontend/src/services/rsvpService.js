import axiosInstance from './axiosInstance';

function normalizeError(error) {
  if (error.response?.data) {
    return Object.assign(new Error('API error'), { data: error.response.data, status: error.response.status });
  }
  return error;
}

export async function createRsvp(eventId) {
  try {
    const { data } = await axiosInstance.post('/api/rsvps/', { event_id: eventId });
    return data;
  } catch (error) { throw normalizeError(error); }
}

export async function deleteRsvp(rsvpId) {
  try {
    await axiosInstance.delete(`/api/rsvps/${rsvpId}/`);
  } catch (error) { throw normalizeError(error); }
}

export async function getMyEvents() {
  try {
    const { data } = await axiosInstance.get('/api/rsvps/my-events/');
    return data;
  } catch (error) { throw normalizeError(error); }
}
