import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated()) {
    // Redirect to login with return url
    return <Navigate to="/profile-management" state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // User doesn't have required role, redirect to appropriate dashboard
    const redirectPath = getRedirectPathByRole(user?.role)
    return <Navigate to={redirectPath} replace />
  }

  return children
}

const getRedirectPathByRole = (role) => {
  switch (role?.toLowerCase()) {
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

export default ProtectedRoute
