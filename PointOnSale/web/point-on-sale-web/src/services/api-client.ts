import axios from 'axios'

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/v1',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add a request interceptor to add the auth token to headers
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

// Add a response interceptor to handle errors globally
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear token and redirect to login if unauthorized
            localStorage.removeItem('auth_token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    },
)

export default apiClient

