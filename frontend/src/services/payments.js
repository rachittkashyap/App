import api from './api';

export function createOrderRequest(itemType, itemId) {
  return api.post('/payments/create-order', { itemType, itemId });
}

export function verifyPaymentRequest(data) {
  return api.post('/payments/verify', data);
}

export function myOrdersRequest() {
  return api.get('/payments/my');
}

// Admin
export function adminListPaymentsRequest(params) {
  return api.get('/admin/payments', { params });
}

export function adminGetRevenueRequest() {
  return api.get('/admin/payments/revenue');
}

export function adminRefundPaymentRequest(id) {
  return api.post(`/admin/payments/${id}/refund`);
}
