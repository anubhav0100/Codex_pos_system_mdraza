import axios from 'axios'
import { useAuthStore } from '@/store/use-auth-store'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Detect and unwrap the common ApiResponse structure
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      return {
        ...response,
        data: response.data.data
      }
    }
    return response
  },
  (error) => {
    // Check for Subscription Expired Error
    if (error.response?.data?.error?.code === 'SUBSCRIPTION_EXPIRED') {
      window.dispatchEvent(new Event('subscription-expired'))
    }

    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      if (!window.location.pathname.includes('login')) {
        window.location.href = 'login'
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient

