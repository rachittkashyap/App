import api from './api';

export function myCertificatesRequest() {
  return api.get('/certificates/my');
}

// Downloads require the auth header, so we fetch as a blob and trigger the
// browser's save dialog ourselves rather than linking directly to the URL.
export async function downloadCertificate(certificateId) {
  const response = await api.get(`/certificates/${certificateId}/download`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${certificateId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function verifyCertificateRequest(certificateId) {
  return api.get(`/certificates/verify/${certificateId}`);
}

// Admin
export function adminListCertificatesRequest(params) {
  return api.get('/admin/certificates', { params });
}

export function adminRevokeCertificateRequest(id) {
  return api.patch(`/admin/certificates/${id}/revoke`);
}

export function adminReinstateCertificateRequest(id) {
  return api.patch(`/admin/certificates/${id}/reinstate`);
}

export function adminGetTemplateRequest() {
  return api.get('/admin/certificates/template');
}

export function adminUpdateTemplateRequest(data) {
  return api.put('/admin/certificates/template', data);
}
