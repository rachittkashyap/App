import api from './api';

// Enrollment
export function enrollRequest(itemType, itemId) {
  return api.post('/enrollments', { itemType, itemId });
}

export function myEnrollmentsRequest() {
  return api.get('/enrollments/my');
}

export function enrollmentStatusRequest(itemType, itemId) {
  return api.get('/enrollments/status', { params: { itemType, itemId } });
}

export function markItemCompleteRequest(enrollmentId, subItemId) {
  return api.patch(`/enrollments/${enrollmentId}/complete-item`, { subItemId });
}

// Submissions (assignments)
export function submitAssignmentRequest(data) {
  return api.post('/submissions', data);
}

export function mySubmissionsRequest() {
  return api.get('/submissions/my');
}

export function adminListSubmissionsRequest(params) {
  return api.get('/admin/submissions', { params });
}

export function adminReviewSubmissionRequest(id, data) {
  return api.patch(`/admin/submissions/${id}/review`, data);
}

// Tests
export function listAvailableTestsRequest(itemType, itemId) {
  return api.get('/tests', { params: { itemType, itemId } });
}

export function getTestForAttemptRequest(id) {
  return api.get(`/tests/${id}`);
}

export function attemptTestRequest(id, answers) {
  return api.post(`/tests/${id}/attempt`, { answers });
}

export function myTestAttemptsRequest() {
  return api.get('/tests/my-attempts');
}

// Admin test management
export function adminListTestsRequest(params) {
  return api.get('/admin/tests', { params });
}

export function adminCreateTestRequest(data) {
  return api.post('/admin/tests', data);
}

export function adminGetTestRequest(id) {
  return api.get(`/admin/tests/${id}`);
}

export function adminDeleteTestRequest(id) {
  return api.delete(`/admin/tests/${id}`);
}

export function adminPublishTestRequest(id) {
  return api.patch(`/admin/tests/${id}/publish`);
}

export function adminUnpublishTestRequest(id) {
  return api.patch(`/admin/tests/${id}/unpublish`);
}

export function adminAddQuestionRequest(testId, data) {
  return api.post(`/admin/tests/${testId}/questions`, data);
}

export function adminDeleteQuestionRequest(testId, questionId) {
  return api.delete(`/admin/tests/${testId}/questions/${questionId}`);
}
