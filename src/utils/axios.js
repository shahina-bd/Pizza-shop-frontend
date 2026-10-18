import axios from 'axios'

// Create Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor to automatically add the Authorization token
api.interceptors.request.use(
  (config) => {
    // Retrieve token from localStorage
    const adminToken = localStorage.getItem('admin_token')
    const customerToken = localStorage.getItem('customer_token')
    const token = adminToken || customerToken

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const requestUrl = error.config?.url || ''
      const isAuthAttempt =
        requestUrl.includes('verify-otp') ||
        requestUrl.includes('send-otp') ||
        requestUrl.includes('customer/login')

      if (!isAuthAttempt && window.location.pathname.startsWith('/admin')) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        if (window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login'
        }
      }
    }
    return Promise.reject(error)
  },
)

export default api
