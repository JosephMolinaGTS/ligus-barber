import axios from 'axios';

// ============================================================
// API Service — Capa de comunicación con el backend
// Usa axios con base URL '/api' (proxy configurado en Vite)
// ============================================================

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// -----------------------------------------------------------
// Request Interceptor: adjuntar token JWT automáticamente
// -----------------------------------------------------------
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ligus-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// -----------------------------------------------------------
// Response Interceptor: manejar errores 401 (no autorizado)
// -----------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ligus-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================
// Endpoints agrupados por módulo
// ============================================================
const api = {
  // -----------------------------------------------------------
  // Auth
  // -----------------------------------------------------------
  auth: {
    login: (data) => apiClient.post('/auth/login', data),
    register: (data) => apiClient.post('/auth/register', data),
    getMe: () => apiClient.get('/auth/me'),
    updateProfile: (data) => apiClient.put('/auth/me', data),
    changePassword: (data) => apiClient.put('/auth/change-password', data),
  },

  // -----------------------------------------------------------
  // Branches
  // -----------------------------------------------------------
  branches: {
    getAll: (params) => apiClient.get('/branches', { params }),
    getById: (id) => apiClient.get(`/branches/${id}`),
    create: (data) => apiClient.post('/branches', data),
    update: (id, data) => apiClient.put(`/branches/${id}`, data),
    delete: (id) => apiClient.delete(`/branches/${id}`),
  },

  // -----------------------------------------------------------
  // Services
  // -----------------------------------------------------------
  services: {
    getAll: (params) => apiClient.get('/services', { params }),
    getById: (id) => apiClient.get(`/services/${id}`),
    create: (data) => apiClient.post('/services', data),
    update: (id, data) => apiClient.put(`/services/${id}`, data),
    delete: (id) => apiClient.delete(`/services/${id}`),
    getPublic: (params) => apiClient.get('/public/services', { params }),
  },

  // -----------------------------------------------------------
  // Employees
  // -----------------------------------------------------------
  employees: {
    getAll: (params) => apiClient.get('/employees', { params }),
    getById: (id) => apiClient.get(`/employees/${id}`),
    create: (data) => apiClient.post('/employees', data),
    update: (id, data) => apiClient.put(`/employees/${id}`, data),
    delete: (id) => apiClient.delete(`/employees/${id}`),
  },

  // -----------------------------------------------------------
  // Clients
  // -----------------------------------------------------------
  clients: {
    getAll: (params) => apiClient.get('/clients', { params }),
    getById: (id) => apiClient.get(`/clients/${id}`),
    create: (data) => apiClient.post('/clients', data),
    update: (id, data) => apiClient.put(`/clients/${id}`, data),
    delete: (id) => apiClient.delete(`/clients/${id}`),
  },

  // -----------------------------------------------------------
  // Appointments
  // -----------------------------------------------------------
  appointments: {
    getAll: (params) => apiClient.get('/appointments', { params }),
    getMine: (params) => apiClient.get('/appointments/mine', { params }),
    getById: (id) => apiClient.get(`/appointments/${id}`),
    create: (data) => apiClient.post('/appointments', data),
    update: (id, data) => apiClient.put(`/appointments/${id}`, data),
    cancel: (id) => apiClient.patch(`/appointments/${id}/cancel`),
    getAvailableSlots: (params) =>
      apiClient.get('/appointments/available-slots', { params }),
  },

  // -----------------------------------------------------------
  // Products
  // -----------------------------------------------------------
  products: {
    getAll: (params) => apiClient.get('/products', { params }),
    getById: (id) => apiClient.get(`/products/${id}`),
    create: (data) => apiClient.post('/products', data),
    update: (id, data) => apiClient.put(`/products/${id}`, data),
    delete: (id) => apiClient.delete(`/products/${id}`),
    getPublic: (params) => apiClient.get('/public/products', { params }),
  },

  // -----------------------------------------------------------
  // Dashboard (solo owner)
  // -----------------------------------------------------------
  dashboard: {
    getStats: (params) => apiClient.get('/dashboard', { params }),
  },

  // -----------------------------------------------------------
  // Public (sin auth)
  // -----------------------------------------------------------
  public: {
    getBranches: () => apiClient.get('/public/branches'),
    getServices: (params) => apiClient.get('/public/services', { params }),
    getProducts: (params) => apiClient.get('/public/products', { params }),
    getBarbersByBranch: (branchId) => apiClient.get(`/public/barbers/${branchId}`),
    createAppointment: (data) => apiClient.post('/public/appointments', data),
  },
};

export default api;
