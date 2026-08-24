import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Attach the current auth token to every outgoing request, read fresh from
// localStorage at request time. This replaces setting a one-time default
// header from inside a page/layout's own useEffect: React runs a mounting
// child's effects before its parent's, so a child component's mount-time
// data fetch could otherwise fire before a parent layout had set the
// Authorization default, silently sending that first request unauthenticated
// (the app's fetch helpers swallow the resulting 401s, leaving the UI stuck
// on an empty state until the user manually retries).
window.axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
