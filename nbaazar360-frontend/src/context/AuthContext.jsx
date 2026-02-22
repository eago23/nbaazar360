import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
        // Verify token is still valid
        const response = await authAPI.getProfile()
        setUser(response.data)
        localStorage.setItem('user', JSON.stringify(response.data))
      } catch (error) {
        console.error('Auth check failed:', error)
        // Only logout on 401 Unauthorized, not on network errors or other issues
        if (error.response?.status === 401) {
          logout()
        }
      }
    }
    setLoading(false)
  }

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password })
    const { token, user: userData } = response.data

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)

    return userData
  }

  const register = async (data) => {
    const response = await authAPI.register(data)
    return response.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const isAdmin = () => user?.role === 'admin'
  const isVendor = () => user?.role === 'vendor'
  const isApproved = () => user?.status === 'active'

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAdmin,
    isVendor,
    isApproved,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
