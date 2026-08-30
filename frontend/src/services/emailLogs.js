import api from './api';

export function adminListEmailLogsRequest(params) {
  return api.get('/admin/email-logs', { params });
}

export function adminRetryEmailLogRequest(id) {
  return api.post(`/admin/email-logs/${id}/retry`);
}
