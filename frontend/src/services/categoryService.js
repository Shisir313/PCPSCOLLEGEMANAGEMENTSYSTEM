import axiosInstance from './axiosInstance';

function normalizeError(error) {
  if (error.response?.data) {
    return Object.assign(new Error('API error'), { data: error.response.data, status: error.response.status });
  }
  return error;
}

export async function getCategories() {
  try {
    const { data } = await axiosInstance.get('/api/categories/');
    // DRF list view uses pagination; return results array when present
    return data.results ?? data;
  } catch (error) { throw normalizeError(error); }
}
