import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // API Base URLs
  const PROFILE_API = 'http://localhost:3004/api'
  const PATHAI_API = 'http://localhost:5002/api'

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
    }
    
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    try {
      setLoading(true)
      
      // Try Profile Management API (primary authentication)
      let response;
      let apiSuccess = false;
      
      try {
        console.log('Attempting login with Profile Management API...')
        response = await axios.post(`${PROFILE_API}/auth/login`, credentials)
        console.log('Profile API response:', response.data)
        
        if (response.data.token) {
          apiSuccess = true
          console.log('Profile API login successful')
        }
      } catch (profileError) {
        console.error('Profile API login failed:', profileError.response?.data || profileError.message)
        
        // Try PathAI API as fallback
        try {
          console.log('Trying PathAI API as fallback...')
          response = await axios.post(`${PATHAI_API}/auth/login`, credentials)
          if (response.data.success || response.data.token) {
            apiSuccess = true
            console.log('PathAI API login successful')
          }
        } catch (pathAIError) {
          console.error('PathAI API also failed:', pathAIError.response?.data || pathAIError.message)
          throw new Error('Authentication failed - Please check your credentials')
        }
      }
      
      if (!apiSuccess || !response.data) {
        throw new Error('Authentication failed - No valid response from server')
      }
      
      // Use API response
      const data = response.data
      const authToken = data.token
      const userData = data.user || {
        id: data.id,
        email: data.email || credentials.email,
        username: data.username || credentials.username,
        role: data.role,
        firstName: data.firstName || data.name?.split(' ')[0] || 'User',
        lastName: data.lastName || data.name?.split(' ')[1] || ''
      }
      
      // Store in localStorage
      localStorage.setItem('token', authToken)
      localStorage.setItem('user', JSON.stringify(userData))
      
      // Update state
      setToken(authToken)
      setUser(userData)
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
      
      console.log('Login successful, user data:', userData)
      return { success: true, user: userData }
      
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Login failed'
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Clear state
    setToken(null)
    setUser(null)
    
    // Clear axios default header
    delete axios.defaults.headers.common['Authorization']
  }

  const isAuthenticated = () => {
    return !!(token && user)
  }

  const hasRole = (role) => {
    return user?.role === role
  }

  const getRedirectPath = (userRole) => {
    switch (userRole?.toLowerCase()) {
      case 'patient':
        return '/home'
      case 'doctor':
        return '/doctor-dashboard'
      case 'admin':
        return '/admin-dashboard'
      default:
        return '/profile-management'
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
    getRedirectPath
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
