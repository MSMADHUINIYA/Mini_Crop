import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
});

// Attach JWT token automatically
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('agrismart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor with smooth auth error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('agrismart_token');
      localStorage.removeItem('agrismart_user');
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export async function loginUser(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function registerUser(name, email, password, role) {
  const { data } = await api.post('/auth/register', { name, email, password, role });
  return data;
}

// Farm APIs
export async function getFarms() {
  const { data } = await api.get('/farms');
  return data;
}

export async function getFarmById(id) {
  const { data } = await api.get(`/farms/${id}`);
  return data;
}

export async function createFarm(farmData) {
  const { data } = await api.post('/farms', farmData);
  return data;
}

export async function updateFarm(id, farmData) {
  const { data } = await api.put(`/farms/${id}`, farmData);
  return data;
}

export async function deleteFarm(id) {
  await api.delete(`/farms/${id}`);
}

// Crop recommendation APIs
export async function getCropRecommendation(payload) {
  const { data } = await api.post('/recommendations', payload);
  return data;
}

export async function getRecommendationHistory(farmId) {
  const { data } = await api.get(`/recommendations/farm/${farmId}`);
  return data;
}

// Irrigation planning APIs
export async function calculateIrrigationPlan(payload) {
  const { data } = await api.post('/irrigation/plan', payload);
  return data;
}

export async function getIrrigationPlansForFarm(farmId) {
  const { data } = await api.get(`/irrigation/farm/${farmId}`);
  return data;
}

// Weather APIs
export async function getWeatherForFarm(farmId) {
  const { data } = await api.get(`/weather/${farmId}`);
  return data;
}

// Resource APIs
export async function getResourceLogs(farmId) {
  const { data } = await api.get(`/resources/farm/${farmId}`);
  return data;
}

export async function getResourceSummary(farmId) {
  const { data } = await api.get(`/resources/farm/${farmId}/summary`);
  return data;
}

export async function createResourceLog(farmId, { type, allocated, used, note }) {
  const { data } = await api.post(`/resources/farm/${farmId}`, null, {
    params: { type, allocated, used, note }
  });
  return data;
}

// Action Plan APIs
export async function getActionPlans(farmId) {
  const { data } = await api.get(`/action-plans/farm/${farmId}`);
  return data;
}

export async function createActionPlan(farmId, { title, description, priority, dueDate }) {
  const { data } = await api.post(`/action-plans/farm/${farmId}`, null, {
    params: { title, description, priority, dueDate }
  });
  return data;
}

export async function updateActionPlanStatus(planId, status) {
  const { data } = await api.put(`/action-plans/${planId}/status`, null, {
    params: { status }
  });
  return data;
}

export async function verifyAndReplan(farmId) {
  const { data } = await api.post(`/action-plans/farm/${farmId}/verify-replan`);
  return data;
}

export async function deleteActionPlan(planId) {
  await api.delete(`/action-plans/${planId}`);
}

export default api;
