import api from './api';

export function adminGetReportsOverviewRequest() {
  return api.get('/admin/reports/overview');
}

export function adminListAuditLogsRequest(params) {
  return api.get('/admin/audit-logs', { params });
}
