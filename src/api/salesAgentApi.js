import api from './axios.js';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/';
export const API_ORIGIN = apiBase.replace(/\/api\/?$/, '');

/** Relative media paths ("/sales-media/x.png") are served by the backend. */
export const mediaSrc = (url) => (!url ? '' : /^https?:\/\//i.test(url) ? url : `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`);

export const salesAgentApi = {
  get: () => api.get('/sales-agent').then((r) => r.data),
  save: (payload) => api.put('/sales-agent', payload).then((r) => r.data),
  reset: (fields) => api.post('/sales-agent/reset', { fields }).then((r) => r.data),
  testChat: (payload) => api.post('/sales-agent/test-chat', payload).then((r) => r.data),
  upload: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/sales-agent/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
  },
};
