import axiosInstance from './axiosInstance';

function normalizeError(error) {
  if (error.response?.data) {
    return Object.assign(new Error('API error'), { data: error.response.data, status: error.response.status });
  }
  return error;
}

export async function getEvents(params = {}) {
  try {
    const { data } = await axiosInstance.get('/api/events/', { params });
    return data;
  } catch (error) { throw normalizeError(error); }
}

export async function getEvent(id) {
  try {
    const { data } = await axiosInstance.get(`/api/events/${id}/`);
    return data;
  } catch (error) { throw normalizeError(error); }
}

export async function createEvent(payload) {
  try {
    const { data } = await axiosInstance.post('/api/events/', payload);
    return data;
  } catch (error) { throw normalizeError(error); }
}

export async function updateEvent(id, payload) {
  try {
    const { data } = await axiosInstance.patch(`/api/events/${id}/`, payload);
    return data;
  } catch (error) { throw normalizeError(error); }
}

export async function deleteEvent(id) {
  try {
    await axiosInstance.delete(`/api/events/${id}/`);
  } catch (error) { throw normalizeError(error); }
}

export async function getOrganizerDashboard() {
  try {
    const { data } = await axiosInstance.get('/api/dashboard/');
    return data;
  } catch (error) { throw normalizeError(error); }
}
