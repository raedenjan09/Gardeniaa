import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4001') + '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { status, data } = error.response || {};
    
    if (status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (status === 403) {
      // Handle inactive/deleted accounts
      const message = data?.message || 'Access denied';
      
      if (message.includes('inactive') || message.includes('deleted')) {
        // Clear user data and show notification
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Create a custom event to show account status notification
        const accountStatusEvent = new CustomEvent('showAccountStatus', {
          detail: { message, type: 'error' }
        });
        window.dispatchEvent(accountStatusEvent);
        
        // Redirect to login after a short delay to allow notification to show
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        
        return Promise.reject(new Error(message));
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;