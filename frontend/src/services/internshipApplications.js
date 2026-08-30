import api from './api';

export function submitInternshipApplication(formData) {
  return api.post('/internship-applications', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

// Admin
export function adminListApplicationsRequest(params) {
  return api.get('/admin/internship-applications', { params });
}

export function adminUpdateApplicationStatusRequest(id, status) {
  return api.patch(`/admin/internship-applications/${id}/status`, { status });
}

export async function downloadResume(id, fileName) {
  const response = await api.get(`/admin/internship-applications/${id}/resume`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName || 'resume');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
