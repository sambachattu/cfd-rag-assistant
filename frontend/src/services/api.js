import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const chatAPI = {
  sendMessage: (question, sessionId) =>
    api.post('/chat/', { question, session_id: sessionId }),

  clearSession: (sessionId) =>
    api.post('/chat/clear-session', { session_id: sessionId }),

  listFiles: () =>
    api.get('/chat/files'),
};

export const uploadAPI = {
  uploadFile: (file, onProgress) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/upload/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
      }
    });
  },

  deleteFile: (filename) =>
    api.delete(`/upload/${filename}`),
};
