import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Users, Plus, Search, Filter, Edit3, Trash2, UserPlus, Mail, Phone, Calendar, Shield } from 'lucide-react'
import axios from 'axios'

const AdminUserManagement = () => {
  const navigate = useNavigate()
  const { user, token, logout } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(false)

  // API Base URL
  const PROFILE_API = 'http://localhost:3004/api'

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      console.log('Fetching users with token:', token ? 'Token exists' : 'No token')
      console.log('API URL:', `${PROFILE_API}/users`)
      
      if (!token) {
        console.error('No authentication token available - Please login first')
        setUsers([])
        return
      }

      const response = await axios.get(`${PROFILE_API}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      console.log('API Response:', response.data)

      if (response.data.success) {
        console.log('Setting users from API:', response.data.data)
        // Normalize user data to ensure consistent format
        const normalizedUsers = (response.data.data || []).map(user => ({
          ...user,
          id: user._id || user.id, // Ensure id field exists
          createdAt: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : 'N/A',
          status: user.isActive ? 'Active' : 'Inactive'
        }))
        setUsers(normalizedUsers)
      } else {
        console.error('API returned success: false')
        setUsers([])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      console.error('Error details:', error.response?.data)
      if (error.response?.status === 401) {
        console.error('Authentication failed - Please login again')
        logout() // Force logout if unauthorized
      }
      setUsers([])
    } finally {
      setLoading(false)
    }
  }


  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role?.toLowerCase() === filterRole.toLowerCase()
    
    let matchesType = true
    if (filterType !== 'all') {
      if (user.role?.toLowerCase() === 'patient') {
        matchesType = user.patientType === filterType
      } else if (user.role?.toLowerCase() === 'doctor') {
        matchesType = user.doctorType === filterType || user.doctorSpecialization === filterType
      }
    }
    
    return matchesSearch && matchesRole && matchesType
  })

  const handleCreateUser = async (userData) => {
    try {
      console.log('=== CREATE USER DEBUG ===')
      console.log('Full userData object:', JSON.stringify(userData, null, 2))
      console.log('Required fields check:')
      console.log('- firstName:', userData.firstName || 'MISSING')
      console.log('- lastName:', userData.lastName || 'MISSING')
      console.log('- email:', userData.email || 'MISSING')
      console.log('- username:', userData.username || 'MISSING')
      console.log('- password:', userData.password || 'MISSING')
      console.log('- role:', userData.role || 'MISSING')
      console.log('- patientType:', userData.patientType || 'Not set')
      console.log('- doctorType:', userData.doctorType || 'Not set')
      console.log('Using token:', token ? 'Token exists' : 'No token')
      console.log('API URL:', `${PROFILE_API}/users`)
      
      // Validate required fields before sending
      const requiredFields = ['firstName', 'lastName', 'email', 'username', 'password', 'role']
      const missingFields = requiredFields.filter(field => !userData[field])
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields)
        alert('Missing required fields: ' + missingFields.join(', '))
        return
      }
      
      // Validate role-specific fields
      if (userData.role === 'patient' && !userData.patientType) {
        console.error('Patient type is required for patients')
        alert('Patient type is required for patients')
        return
      }
      
      if (userData.role === 'doctor' && !userData.doctorType) {
        console.error('Doctor type is required for doctors')
        alert('Doctor type is required for doctors')
        return
      }
      
      console.log('All validations passed, preparing data...')
      
      // Clean userData - only send relevant type field based on role
      const cleanUserData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        username: userData.username,
        password: userData.password,
        role: userData.role,
        phone: userData.phone || ''
      }
      
      // Add role-specific fields
      if (userData.role === 'patient') {
        cleanUserData.patientType = userData.patientType
      } else if (userData.role === 'doctor') {
        cleanUserData.doctorType = userData.doctorType
      }
      
      console.log('Clean user data to send:', JSON.stringify(cleanUserData, null, 2))
      
      const response = await axios.post(`${PROFILE_API}/users`, cleanUserData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('Create user response:', response.data)
      
      if (response.data.success) {
        console.log('User created successfully, refreshing list...')
        await fetchUsers() // Refresh the list
        setShowCreateModal(false)
        alert('User created successfully!')
      } else {
        console.error('API returned success: false')
        alert('Failed to create user: ' + (response.data.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating user:', error)
      console.error('Error details:', error.response?.data)
      
      if (error.response?.status === 401) {
        alert('Authentication failed. Please login again.')
        logout()
      } else if (error.response?.status === 400) {
        // Handle validation errors
        const errorMessage = error.response?.data?.message || 'Validation failed'
        alert('Failed to create user: ' + errorMessage)
      } else if (error.response?.status === 409) {
        // Handle duplicate username/email
        alert('Failed to create user: Username or email already exists')
      } else {
        alert('Failed to create user: ' + (error.response?.data?.message || error.message))
      }
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        console.log('Deleting user with ID:', userId)
        
        const response = await axios.delete(`${PROFILE_API}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        console.log('Delete user response:', response.data)
        
        if (response.data.success) {
          console.log('User deleted successfully, refreshing list...')
          await fetchUsers()
          alert('User deleted successfully!')
        } else {
          alert('Failed to delete user: ' + (response.data.message || 'Unknown error'))
        }
      } catch (error) {
        console.error('Error deleting user:', error)
        console.error('Error details:', error.response?.data)
        
        if (error.response?.status === 401) {
          alert('Authentication failed. Please login again.')
          logout()
        } else {
          alert('Failed to delete user: ' + (error.response?.data?.message || error.message))
        }
      }
    }
  }

  const handleUpdateUser = async (userData) => {
    try {
      console.log('Updating user with data:', userData)
      
      const response = await axios.put(`${PROFILE_API}/users/${selectedUser._id || selectedUser.id}`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('Update user response:', response.data)
      
      if (response.data.success) {
        console.log('User updated successfully, refreshing list...')
        await fetchUsers()
        setShowEditModal(false)
        setSelectedUser(null)
        alert('User updated successfully!')
      } else {
        alert('Failed to update user: ' + (response.data.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating user:', error)
      console.error('Error details:', error.response?.data)
      
      if (error.response?.status === 401) {
        alert('Authentication failed. Please login again.')
        logout()
      } else {
        alert('Failed to update user: ' + (error.response?.data?.message || error.message))
      }
    }
  }

  const handleAssignDoctor = async (patientId, doctorId) => {
    try {
      console.log('Assigning doctor:', doctorId, 'to patient:', patientId)
      
      const response = await axios.patch(`${PROFILE_API}/users/${patientId}/assign-doctor`, 
        { doctorId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      console.log('Assign doctor response:', response.data)
      
      if (response.data.success) {
        await fetchUsers()
        setShowAssignModal(false)
        setSelectedUser(null)
        alert('Doctor assigned successfully!')
      } else {
        alert('Failed to assign doctor: ' + (response.data.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error assigning doctor:', error)
      console.error('Error details:', error.response?.data)
      
      if (error.response?.status === 401) {
        alert('Authentication failed. Please login again.')
        logout()
      } else {
        alert('Failed to assign doctor: ' + (error.response?.data?.message || error.message))
      }
      setShowAssignModal(false)
    }
  }

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'doctor': return 'bg-green-100 text-green-800'
      case 'patient': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Inactive': return 'bg-red-100 text-red-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin-dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin: {user?.firstName || user?.name || 'Admin'}</span>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">User Management</h2>
              <p className="text-blue-100">Manage all system users - patients, doctors, and administrators</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{users.length}</div>
                <div className="text-sm text-blue-100">Total Users</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Roles</option>
                <option value="patient">Patients</option>
                <option value="doctor">Doctors</option>
                <option value="admin">Admins</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Types</option>
                <option value="ENT">ENT</option>
                <option value="Gynecology">Gynecology</option>
              </select>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterRole !== 'all' ? 'No matching users' : 'No users found'}
              </h3>
              <p className="text-gray-600">
                {searchTerm || filterRole !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by adding your first user'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-indigo-100 w-10 h-10 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-medium">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          <Shield className="h-3 w-3 mr-1" />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          {user.phone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {user.phone}
                            </div>
                          )}
                          {user.role === 'doctor' && (user.doctorType || user.doctorSpecialization) && (
                            <div className="text-green-600">
                              Type: {user.doctorType || user.doctorSpecialization}
                            </div>
                          )}
                          {user.role === 'patient' && (user.patientType || user.patientCategory) && (
                            <div className="text-blue-600">
                              Type: {user.patientType || user.patientCategory}
                            </div>
                          )}
                          {user.assignedDoctor && (
                            <div className="text-purple-600">
                              Doctor: {user.assignedDoctor}
                            </div>
                          )}
                          <div className="flex items-center text-gray-400">
                            <Calendar className="h-4 w-4 mr-1" />
                            Joined: {user.createdAt}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setShowEditModal(true)
                            }}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          {user.role?.toLowerCase() === 'patient' && (
                            <button
                              onClick={() => {
                                setSelectedUser(user)
                                setShowAssignModal(true)
                              }}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                            >
                              <UserPlus className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user._id || user.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateUser}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false)
            setSelectedUser(null)
          }}
          onSubmit={handleUpdateUser}
        />
      )}

      {/* Assign Doctor Modal */}
      {showAssignModal && selectedUser && (
        <AssignDoctorModal
          patient={selectedUser}
          doctors={users.filter(u => u.role?.toLowerCase() === 'doctor')}
          onClose={() => {
            setShowAssignModal(false)
            setSelectedUser(null)
          }}
          onSubmit={handleAssignDoctor}
        />
      )}
    </div>
  )
}

// Create User Modal Component
const CreateUserModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    phone: '',
    role: 'patient',
    password: '',
    patientType: '',
    doctorType: ''
  })

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({...formData, password})
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Create New User</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value, patientType: '', doctorType: ''})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>
          
          {formData.role === 'patient' && (
            <select
              value={formData.patientType}
              onChange={(e) => setFormData({...formData, patientType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select Patient Type</option>
              <option value="ENT">ENT</option>
              <option value="Gynecology">Gynecology</option>
            </select>
          )}
          
          {formData.role === 'doctor' && (
            <select
              value={formData.doctorType}
              onChange={(e) => setFormData({...formData, doctorType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select Doctor Type</option>
              <option value="ENT">ENT</option>
              <option value="Gynecology">Gynecology</option>
            </select>
          )}
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Initial Password</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
              <button
                type="button"
                onClick={generatePassword}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Generate
              </button>
            </div>
            <p className="text-xs text-gray-500">User will be required to change this password on first login</p>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit User Modal Component
const EditUserModal = ({ user, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'Patient',
    specialization: user.specialization || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Edit User</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Patient">Patient</option>
            <option value="Doctor">Doctor</option>
            <option value="Admin">Admin</option>
          </select>
          {formData.role === 'Doctor' && (
            <input
              type="text"
              placeholder="Specialization"
              value={formData.specialization}
              onChange={(e) => setFormData({...formData, specialization: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          )}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Update User
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Assign Doctor Modal Component
const AssignDoctorModal = ({ patient, doctors, onClose, onSubmit }) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedDoctorId) {
      onSubmit(patient.id, selectedDoctorId)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Assign Doctor</h3>
        <p className="text-gray-600 mb-4">
          Assign a doctor to patient: <strong>{patient.firstName} {patient.lastName}</strong>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="">Select a doctor...</option>
            {doctors.map(doctor => (
              <option key={doctor.id} value={doctor.id}>
                Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization || 'General'}
              </option>
            ))}
          </select>
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Assign Doctor
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminUserManagement
