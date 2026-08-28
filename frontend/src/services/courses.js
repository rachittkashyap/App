import api from './api';

// Public
export function listCoursesRequest(params) {
  return api.get('/courses', { params });
}

export function getCourseBySlugRequest(slug) {
  return api.get(`/courses/${slug}`);
}

// Admin
export function adminListCoursesRequest(params) {
  return api.get('/admin/courses', { params });
}

export function adminGetCourseRequest(id) {
  return api.get(`/admin/courses/${id}`);
}

export function adminCreateCourseRequest(data) {
  return api.post('/admin/courses', data);
}

export function adminUpdateCourseRequest(id, data) {
  return api.put(`/admin/courses/${id}`, data);
}

export function adminDeleteCourseRequest(id) {
  return api.delete(`/admin/courses/${id}`);
}

export function adminPublishCourseRequest(id) {
  return api.patch(`/admin/courses/${id}/publish`);
}

export function adminUnpublishCourseRequest(id) {
  return api.patch(`/admin/courses/${id}/unpublish`);
}

export function adminAddModuleRequest(courseId, data) {
  return api.post(`/admin/courses/${courseId}/modules`, data);
}

export function adminUpdateModuleRequest(courseId, moduleId, data) {
  return api.put(`/admin/courses/${courseId}/modules/${moduleId}`, data);
}

export function adminDeleteModuleRequest(courseId, moduleId) {
  return api.delete(`/admin/courses/${courseId}/modules/${moduleId}`);
}

export function adminAddLessonRequest(courseId, moduleId, data) {
  return api.post(`/admin/courses/${courseId}/modules/${moduleId}/lessons`, data);
}

export function adminUpdateLessonRequest(courseId, moduleId, lessonId, data) {
  return api.put(`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, data);
}

export function adminDeleteLessonRequest(courseId, moduleId, lessonId) {
  return api.delete(`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
}
