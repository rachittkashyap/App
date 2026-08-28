import api from './api';

export function registerRequest(data) {
  return api.post('/auth/register', data);
}

export function verifyEmailRequest(data) {
  return api.post('/auth/verify-email', data);
}

export function loginRequest(data) {
  return api.post('/auth/login', data);
}

export function logoutRequest() {
  return api.post('/auth/logout');
}

export function refreshRequest() {
  return api.post('/auth/refresh');
}

export function forgotPasswordRequest(data) {
  return api.post('/auth/forgot-password', data);
}

export function resetPasswordRequest(data) {
  return api.post('/auth/reset-password', data);
}

export function meRequest() {
  return api.get('/auth/me');
}
