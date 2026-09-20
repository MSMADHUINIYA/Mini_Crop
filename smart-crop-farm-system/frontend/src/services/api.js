import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('agrismart_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, error => Promise.reject(error));

api.interceptors.response.use(r => r, error => {
  if (error.response?.status === 401) {
    localStorage.removeItem('agrismart_token');
    localStorage.removeItem('agrismart_user');
    if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
});

// Auth
export async function loginUser(email, password) {
  const {data} = await api.post('/auth/login', {email, password});
  return data;
}

export async function registerUser(name, email, password, role) {
  const {data} = await api.post('/auth/register', {name, email, password, role});
  return data;
}

// Farm API
export async function getFarms() { const {data} = await api.get('/farms'); return data; }
export async function getFarmById(id) { const {data} = await api.get(`/farms/${id}`); return data; }
export async function createFarm(farmData) { const {data} = await api.post('/farms', farmData); return data; }
export async function updateFarm(id, farmData) { const {data} = await api.put(`/farms/${id}`, farmData); return data; }
export async function deleteFarm(id) { await api.delete(`/farms/${id}`); }

// Crop recommendation
export async function getCropRecommendation(payload) {
  const {data} = await api.post('/recommendations', payload);
  return data;
}

// Irrigation planning
export async function calculateIrrigationPlan(payload) {
  const {data} = await api.post('/irrigation/plan', payload);
  return data;
}
export async function getIrrigationPlansForFarm(farmId) {
  const {data} = await api.get(`/irrigation/farm/${farmId}`);
  return data;
}

export default api;
