import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; name: string; role: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  getMe: () =>
    api.get('/auth/me')
};

// Documents API
export const documentsApi = {
  getAll: (params?: Record<string, string>) =>
    api.get('/documents', { params }),
  
  getFeatured: () =>
    api.get('/documents/featured'),
  
  getBestsellers: () =>
    api.get('/documents/bestsellers'),
  
  getById: (id: string) =>
    api.get(`/documents/${id}`),
  
  create: (data: any) =>
    api.post('/documents', data),
  
  update: (id: string, data: any) =>
    api.put(`/documents/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/documents/${id}`),
  
  getCategories: () =>
    api.get('/documents/meta/categories'),
  
  getLevels: () =>
    api.get('/documents/meta/levels'),
  
  getSubjects: () =>
    api.get('/documents/meta/subjects')
};

// Orders API
export const ordersApi = {
  getMyOrders: () =>
    api.get('/orders/my-orders'),
  
  getSellerOrders: () =>
    api.get('/orders/seller-orders'),
  
  getById: (id: string) =>
    api.get(`/orders/${id}`),
  
  create: (data: { documentId: string; paymentIntentId: string }) =>
    api.post('/orders', data),
  
  download: (id: string) =>
    api.get(`/orders/${id}/download`, { responseType: 'blob' }),
  
  getStats: () =>
    api.get('/orders/stats/seller')
};

// Cart API
export const cartApi = {
  get: () =>
    api.get('/cart'),
  
  add: (documentId: string) =>
    api.post('/cart', { documentId }),
  
  remove: (documentId: string) =>
    api.delete(`/cart/${documentId}`),
  
  clear: () =>
    api.delete('/cart'),
  
  check: (documentId: string) =>
    api.get(`/cart/check/${documentId}`)
};

// Upload API
export const uploadApi = {
  uploadDocument: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  uploadThumbnail: (file: File) => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    return api.post('/upload/thumbnail', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  delete: (filename: string) =>
    api.delete(`/upload/${filename}`)
};

// Payment API
export const paymentApi = {
  createIntent: (items: string[]) =>
    api.post('/payment/create-intent', { items }),
  
  confirm: (paymentIntentId: string) =>
    api.post('/payment/confirm', { paymentIntentId }),
  
  getConfig: () =>
    api.get('/payment/config')
};

// User API
export const userApi = {
  getProfile: () =>
    api.get('/users/profile'),
  
  updateProfile: (data: { name?: string; avatar?: string }) =>
    api.put('/users/profile', data),
  
  getMyDocuments: () =>
    api.get('/users/my-documents'),
  
  getStats: () =>
    api.get('/users/stats'),
  
  becomeSeller: () =>
    api.post('/users/become-seller')
};

export default api;
