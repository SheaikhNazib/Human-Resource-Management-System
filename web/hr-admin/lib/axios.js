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

// Request interceptor to add auth token from cookies (server-side)
instance.interceptors.request.use(
  async (config) => {
    // For server-side requests, try to get token from cookies
    if (typeof window === 'undefined') {
      try {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;
        
        if (token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        // Cookies might not be available in all contexts
        console.log('Could not access cookies:', error.message);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear token on server side
      if (typeof window === 'undefined') {
        try {
          const { cookies } = await import('next/headers');
          const cookieStore = await cookies();
          cookieStore.delete('access_token');
          cookieStore.delete('user_data');
        } catch (e) {
          console.log('Could not clear cookies:', e.message);
        }
      }
      
      // Clear token and redirect to login on client side
      if (typeof window !== 'undefined') {
        console.log('401 Unauthorized - Token expired, redirecting to login');
        // Trigger a custom event for token expiration
        window.dispatchEvent(new Event('token-expired'));
        // Immediate redirect without waiting
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

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