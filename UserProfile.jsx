import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Edit3, Save, X } from 'lucide-react'
import axios from 'axios'

const UserProfile = () => {
  const navigate = useNavigate()
  const { user, token, logout } = useAuth()
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})

  // API Base URLs
  const PROFILE_API = 'http://localhost:3004/api'
  const PATHAI_API = 'http://localhost:5002/api'

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError('')

      let response
      let success = false

      // Try PathAI API first
      try {
        response = await axios.get(`${PATHAI_API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.data) {
          success = true
        }
      } catch (pathAIError) {
        // Fallback to Profile Management API
        try {
          response = await axios.get(`${PROFILE_API}/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (response.data) {
            success = true
          }
        } catch (profileError) {
          console.log('Both APIs failed, using stored user data')
        }
      }

      if (success && response.data) {
        const userData = response.data.data || response.data
        setProfileData(userData)
        setEditForm(userData)
      } else {
        // Use stored user data as fallback
        setProfileData(user)
        setEditForm(user)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Failed to load profile data')
      // Use stored user data as fallback
      setProfileData(user)
      setEditForm(user)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      
      // Try to update via API
      let response
      let success = false

      try {
        response = await axios.put(`${PROFILE_API}/users/profile`, editForm, {
          headers: { Authorization: `Bearer ${token}` }
        })
        success = true
      } catch (error) {
        console.log('Profile update failed, using local update')
      }

      if (success) {
        setProfileData(response.data.data || editForm)
      } else {
        setProfileData(editForm)
      }
      
      setIsEditing(false)
      setError('')
    } catch (error) {
      setError('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditForm(profileData)
    setIsEditing(false)
    setError('')
  }

  const handleBack = () => {
    navigate('/home')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-12 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="bg-white/20 rounded-full p-4">
                  <User className="h-16 w-16 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    {profileData?.firstName || profileData?.name || 'User'} {profileData?.lastName || ''}
                  </h1>
                  <p className="text-indigo-100 text-lg">
                    {profileData?.role || 'Patient'} Profile
                  </p>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Edit3 className="h-5 w-5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="firstName"
                        value={editForm.firstName || editForm.name?.split(' ')[0] || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    ) : (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <User className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900">
                          {profileData?.firstName || profileData?.name?.split(' ')[0] || 'Not provided'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="lastName"
                        value={editForm.lastName || editForm.name?.split(' ')[1] || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    ) : (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <User className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900">
                          {profileData?.lastName || profileData?.name?.split(' ')[1] || 'Not provided'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={editForm.email || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    ) : (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900">{profileData?.email || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={editForm.phone || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    ) : (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900">{profileData?.phone || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Account Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <User className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900">{profileData?.role || 'Patient'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <User className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900">{profileData?.username || 'Not provided'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Member Since
                    </label>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900">
                        {profileData?.createdAt 
                          ? new Date(profileData.createdAt).toLocaleDateString()
                          : 'Not available'
                        }
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Login
                    </label>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900">
                        {profileData?.lastLogin 
                          ? new Date(profileData.lastLogin).toLocaleString()
                          : 'Not available'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <X className="h-5 w-5" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="h-5 w-5" />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default UserProfile
