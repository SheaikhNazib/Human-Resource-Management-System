import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },

  timeout: 10000,
});

if (process.env.NEXT_WITH_CREDENTIALS === 'true') {
  instance.defaults.withCredentials = true;
}

if (typeof window === 'undefined' && process.env.API_SECRET_KEY) {
  instance.defaults.headers.common['Authorization'] = `Bearer ${process.env.API_SECRET_KEY}`;
}

export { instance as axiosInstance };


export async function fetchFromApi(endpoint, options = {}) {
  const method = (options.method || 'GET').toLowerCase();
  const headers = options.headers || {};
  const params = options.params;
  const data = options.body ?? options.data;

  try {
    const response = await instance.request({
      url: endpoint,
      method,
      headers,
      params,
      data,
    });
    let plainHeaders = response.headers;
    if (plainHeaders && typeof plainHeaders.toJSON === 'function') {
      try {
        plainHeaders = plainHeaders.toJSON();
      } catch (e) {
        plainHeaders = Object.fromEntries(Object.entries(response.headers || {}));
      }
    } else if (plainHeaders && typeof plainHeaders === 'object') {
      plainHeaders = Object.fromEntries(Object.entries(plainHeaders));
    }

    return { data: response.data, status: response.status, headers: plainHeaders };
  } catch (err) {
    if (err && err.response) {
      const payload = err.response.data;
      const message = `API call failed: ${err.response.status} ${err.response.statusText} - ${JSON.stringify(payload)}`;
      const error = new Error(message);
      error.response = err.response;
      throw error;
    }
    throw err;
  }
}

export default instance;
