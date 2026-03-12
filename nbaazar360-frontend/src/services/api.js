import axios from 'axios'

// Use environment variables for API and backend URLs
// In production, set VITE_API_URL and VITE_BACKEND_URL in .env
// Falls back to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

// Export BACKEND_URL for use in other files if needed
export { BACKEND_URL }

/**
 * Convert a relative media URL to an absolute URL
 * @param {string} url - The URL to convert (e.g., "/uploads/stories/video.mp4")
 * @returns {string} - The absolute URL (e.g., "http://localhost:5000/uploads/stories/video.mp4")
 */
export const getMediaUrl = (url) => {
  if (!url) return null
  // If already absolute URL (http/https), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  // If relative URL starting with /, prepend backend URL
  if (url.startsWith('/')) {
    return `${BACKEND_URL}${url}`
  }
  // Otherwise return as is
  return url
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response - extract nested data and handle auth errors
api.interceptors.response.use(
  (response) => {
    // Backend returns { success: true, data: { ... } }
    // Extract the inner data object for easier use
    if (response.data && response.data.success && response.data.data) {
      response.data = response.data.data
    }
    return response
  },
  (error) => {
    // Only redirect on 401 if:
    // 1. Not on the login page already
    // 2. Not a login/register request (those should show error messages)
    const isLoginPage = window.location.pathname === '/hyrje'
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') ||
                           error.config?.url?.includes('/auth/vendor-signup')

    if (error.response?.status === 401 && !isLoginPage && !isAuthEndpoint) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/hyrje'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/vendor-signup', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
}

// Locations API (public)
export const locationsAPI = {
  getAll: (params) => api.get('/locations', { params }),
  getById: (id) => api.get(`/locations/${id}`)
}

// Admin Locations API
export const adminLocationsAPI = {
  getAll: (params) => api.get('/admin/locations', { params }),
  create: (data) => api.post('/admin/locations', data),
  update: (id, data) => api.put(`/admin/locations/${id}`, data),
  delete: (id) => api.delete(`/admin/locations/${id}`)
}

// Stories API (public)
export const storiesAPI = {
  getAll: (params) => api.get('/stories', { params }),
  getById: (slug) => api.get(`/stories/${slug}`)
}

// Vendor Stories API (for vendor self-management)
export const vendorStoriesAPI = {
  getAll: () => api.get('/vendor/stories'),
  create: (data) => api.post('/vendor/stories', data),
  update: (id, data) => api.put(`/vendor/stories/${id}`, data),
  delete: (id) => api.delete(`/vendor/stories/${id}`),
  setPrimary: (id) => api.post(`/vendor/stories/${id}/set-primary`)
}

// Admin Stories API
export const adminStoriesAPI = {
  getAll: (params) => api.get('/admin/stories', { params }),
  create: (data) => api.post('/admin/stories', data),
  update: (id, data) => api.put(`/admin/stories/${id}`, data),
  delete: (id) => api.delete(`/admin/stories/${id}`)
}

// Events API (public)
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  getUpcoming: () => api.get('/events')
}

// Admin Events API
export const adminEventsAPI = {
  getAll: (params) => api.get('/admin/events', { params }),
  create: (data) => api.post('/admin/events', data),
  update: (id, data) => api.put(`/admin/events/${id}`, data),
  delete: (id) => api.delete(`/admin/events/${id}`)
}

// Vendors API (public)
export const vendorsAPI = {
  getAll: (params) => api.get('/vendors', { params }),
  getById: (id) => api.get(`/vendors/${id}`),
  getByUsername: (username) => api.get(`/vendors/${username}`),
  getStories: (username) => api.get(`/vendors/${username}/stories`)
}

// Vendor Profile API (for vendor self-management)
export const vendorProfileAPI = {
  get: () => api.get('/vendor/profile'),
  update: (data) => api.put('/vendor/profile', data),
  uploadLogo: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/vendor/profile/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  uploadCover: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/vendor/profile/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  getAnalytics: () => api.get('/vendor/analytics')
}

// Admin Vendors API (requires admin auth)
export const adminVendorsAPI = {
  getAll: (params) => api.get('/admin/vendors', { params }),
  getById: (id) => api.get(`/admin/vendors/${id}`),
  getPending: () => api.get('/admin/vendors/pending'),
  approve: (id) => api.post(`/admin/vendors/${id}/approve`),
  reject: (id, reason) => api.post(`/admin/vendors/${id}/reject`, { reason }),
  suspend: (id, reason) => api.post(`/admin/vendors/${id}/suspend`, { reason }),
  unsuspend: (id) => api.post(`/admin/vendors/${id}/unsuspend`),
  delete: (id) => api.delete(`/admin/vendors/${id}`)
}

// Upload API (admin only)
export const uploadAPI = {
  uploadImage: (file, folder = 'general') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    return api.post('/admin/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  uploadPanorama: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/admin/upload/panorama', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  uploadVideo: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/admin/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

// Vendor Upload API (for vendors to upload their own content)
export const vendorUploadAPI = {
  uploadImage: (file, folder = 'stories') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    return api.post('/vendor/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  uploadVideo: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/vendor/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

// Stats API (Admin)
export const statsAPI = {
  getDashboard: () => api.get('/admin/analytics/summary'),
  getAnalytics: (params) => api.get('/admin/analytics/views', { params }),
  getVendorAnalytics: () => api.get('/admin/analytics/vendors')
}

export default api
