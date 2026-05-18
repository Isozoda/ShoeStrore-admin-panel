import axios from 'axios';

const getBaseURL = (): string => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  return url.endsWith('/api') ? url : `${url.replace(/\/$/, '')}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue: { resolve: (v: string) => void; reject: (e: unknown) => void }[] = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const orig = error.config;
    if (error.response?.status === 401 && !orig._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          orig.headers.Authorization = `Bearer ${token}`;
          return api(orig);
        });
      }
      orig._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post(
          `${getBaseURL()}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        localStorage.setItem('admin_accessToken', data.accessToken);
        failedQueue.forEach((p) => p.resolve(data.accessToken));
        failedQueue = [];
        orig.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(orig);
      } catch (err) {
        failedQueue.forEach((p) => p.reject(err));
        failedQueue = [];
        localStorage.removeItem('admin_accessToken');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
