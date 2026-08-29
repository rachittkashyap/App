import api from './api';

// Public
export function listTrainingsRequest(params) {
  return api.get('/trainings', { params });
}

export function getTrainingBySlugRequest(slug) {
  return api.get(`/trainings/${slug}`);
}

// Admin
export function adminListTrainingsRequest(params) {
  return api.get('/admin/trainings', { params });
}

export function adminGetTrainingRequest(id) {
  return api.get(`/admin/trainings/${id}`);
}

export function adminCreateTrainingRequest(data) {
  return api.post('/admin/trainings', data);
}

export function adminUpdateTrainingRequest(id, data) {
  return api.put(`/admin/trainings/${id}`, data);
}

export function adminDeleteTrainingRequest(id) {
  return api.delete(`/admin/trainings/${id}`);
}

export function adminPublishTrainingRequest(id) {
  return api.patch(`/admin/trainings/${id}/publish`);
}

export function adminUnpublishTrainingRequest(id) {
  return api.patch(`/admin/trainings/${id}/unpublish`);
}

export function adminAddDayRequest(trainingId, data) {
  return api.post(`/admin/trainings/${trainingId}/days`, data);
}

export function adminDeleteDayRequest(trainingId, dayId) {
  return api.delete(`/admin/trainings/${trainingId}/days/${dayId}`);
}

export function adminAddTaskRequest(trainingId, dayId, data) {
  return api.post(`/admin/trainings/${trainingId}/days/${dayId}/tasks`, data);
}

export function adminDeleteTaskRequest(trainingId, dayId, taskId) {
  return api.delete(`/admin/trainings/${trainingId}/days/${dayId}/tasks/${taskId}`);
}
