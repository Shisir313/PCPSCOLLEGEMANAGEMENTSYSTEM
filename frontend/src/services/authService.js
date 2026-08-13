import axiosInstance from './axiosInstance';

/**
 * Log in a user: get tokens then fetch profile from /me/.
 * Returns { access, refresh, user }.
 */
export async function login(username, password) {
  try {
    // Step 1: get tokens
    const { data: tokens } = await axiosInstance.post('/api/auth/login/', { username, password });
    // Step 2: store access token temporarily so the /me/ call succeeds
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    // Step 3: fetch user profile
    const { data: user } = await axiosInstance.get('/api/auth/me/');
    return { access: tokens.access, refresh: tokens.refresh, user };
  } catch (error) {
    // Clean up partial state on failure
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    throw normalizeError(error);
  }
}

/**
 * Register a new user.
 */
export async function register(username, email, password, password2, role) {
  try {
    const { data } = await axiosInstance.post('/api/auth/register/', {
      username, email, password, password2, role,
    });
    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Log out: clear local storage (token invalidation is handled by the Axios interceptor).
 */
export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
}

function normalizeError(error) {
  if (error.response?.data) {
    return Object.assign(new Error('API error'), { data: error.response.data, status: error.response.status });
  }
  return error;
}
