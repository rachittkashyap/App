import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Called by AuthContext whenever the access token changes (login/refresh/logout)
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

// AuthContext registers a handler here so the interceptor can trigger a
// silent refresh + retry when a request comes back 401 (expired access token).
let onUnauthorized = null;
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

// Endpoints that should NEVER trigger a silent-refresh retry:
// - /auth/refresh itself (otherwise a failed refresh retries itself forever)
// - /auth/login, /auth/register (a 401/403 here means bad credentials /
//   unverified email, not an expired access token - refreshing won't help)
const NO_RETRY_PATHS = ['/auth/refresh', '/auth/login', '/auth/register'];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const url = original?.url || '';
    const isExcluded = NO_RETRY_PATHS.some((path) => url.includes(path));

    if (error.response?.status === 401 && !original._retry && !isExcluded && onUnauthorized) {
      original._retry = true;
      const newToken = await onUnauthorized();
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
