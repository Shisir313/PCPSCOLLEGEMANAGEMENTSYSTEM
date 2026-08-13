import axiosInstance from './axiosInstance';

export async function getFlags() {
  const { data } = await axiosInstance.get('/api/flags/');
  return data;
}

export default { getFlags };
