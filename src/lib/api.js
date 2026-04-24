const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    credentials: 'include',
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Request failed.');
  }

  return data;
}

export const publicApi = {
  getContent: () => request('/api/public/content'),
  createAppointment: (payload) => request('/api/public/appointments', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
};

export const authApi = {
  getSession: () => request('/api/admin/session'),
  login: (payload) => request('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  logout: () => request('/api/admin/logout', {
    method: 'POST',
  }),
};

export const adminApi = {
  getContent: () => request('/api/admin/content'),
  createDoctorProfile: (payload) => request('/api/admin/doctor-profile', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateDoctorProfile: (id, payload) => request(`/api/admin/doctor-profile/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  createEntity: (entity, payload) => request(`/api/admin/${entity}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateEntity: (entity, id, payload) => request(`/api/admin/${entity}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  deleteEntity: (entity, id) => request(`/api/admin/${entity}/${id}`, {
    method: 'DELETE',
  }),
  updateAppointmentStatus: (id, status) => request(`/api/admin/appointments/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });
  },
};
