export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const buildHeaders = (options = {}) => {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = localStorage.getItem('accessToken');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
};

export const request = async (path, options = {}) => {
  if (!API_BASE_URL) {
    throw new Error('Configura VITE_API_BASE_URL en tu archivo .env.');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || 'No fue posible completar la solicitud.');
  }

  return data;
};

export const get = (path) => request(path, { method: 'GET' });

export const post = (path, body) =>
  request(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
