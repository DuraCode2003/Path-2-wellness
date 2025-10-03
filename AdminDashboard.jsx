import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, UserCheck, Activity, Database, BarChart3, Settings, Shield, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const AdminDashboard = () => {
  console.log('AdminDashboard: Component rendering...')
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  console.log('AdminDashboard: Auth data:', { user, token: token ? 'exists' : 'none' })
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    totalAdmins: 0,
    patientsByType: [],
    doctorsByType: []
  })
  const [loading, setLoading] = useState(true)

  // API Base URL
  const PROFILE_API = 'http://localhost:3004/api'

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      console.log('AdminDashboard: Fetching statistics...')
      console.log('AdminDashboard: User:', user)
      console.log('AdminDashboard: Token:', token ? 'Token exists' : 'No token')
      
      if (!token) {
        console.error('No token available for statistics')
        return
      }

      const response = await axios.get(`${PROFILE_API}/users/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        console.log('Statistics data:', response.data.data)
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">System Administrator - {user?.firstName || user?.name || 'Admin'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">System Administration Center</h2>
          <p className="text-purple-100">Manage users, monitor system health, and oversee operations</p>
        </div>

        {/* System Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.totals?.users || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Real-time data</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Doctors</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.totals?.doctors || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Real-time data</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">System Uptime</p>
                <p className="text-2xl font-bold text-gray-900">99.9%</p>
                <p className="text-xs text-green-600 mt-1">Excellent performance</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Database Health</p>
                <p className="text-2xl font-bold text-gray-900">Optimal</p>
                <p className="text-xs text-green-600 mt-1">All systems operational</p>
              </div>
              <Database className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Patient & Doctor Type Statistics */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Patient Statistics by Type */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Patient Statistics by Type</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">ENT Patients</p>
                    <p className="text-sm text-gray-600">Ear, Nose & Throat Care</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-600">
                    {loading ? '...' : stats.patientsByType?.find(p => p._id === 'ENT')?.count || 0}
                  </span>
                  <p className="text-sm text-gray-500">
                    {loading ? '...' : stats.totals?.patients > 0 ? 
                      `${Math.round(((stats.patientsByType?.find(p => p._id === 'ENT')?.count || 0) / stats.totals.patients) * 100)}% of patients` : 
                      '0% of patients'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg border border-pink-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-pink-100 w-10 h-10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Gynecology Patients</p>
                    <p className="text-sm text-gray-600">Women's Health Care</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-pink-600">
                    {loading ? '...' : stats.patientsByType?.find(p => p._id === 'Gynecology')?.count || 0}
                  </span>
                  <p className="text-sm text-gray-500">
                    {loading ? '...' : stats.totals?.patients > 0 ? 
                      `${Math.round(((stats.patientsByType?.find(p => p._id === 'Gynecology')?.count || 0) / stats.totals.patients) * 100)}% of patients` : 
                      '0% of patients'
                    }
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Total Patients:</span>
                  <span className="font-medium">{loading ? '...' : stats.totals?.patients || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Doctor Statistics by Type */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Doctor Statistics by Type</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">ENT Doctors</p>
                    <p className="text-sm text-gray-600">Ear, Nose & Throat Specialists</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-green-600">34</span>
                  <p className="text-sm text-gray-500">38.2% of doctors</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Gynecology Doctors</p>
                    <p className="text-sm text-gray-600">Women's Health Specialists</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-purple-600">55</span>
                  <p className="text-sm text-gray-500">61.8% of doctors</p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Total Doctors:</span>
                  <span className="font-medium">89</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>Patient-to-Doctor Ratio:</span>
                  <span className="font-medium">13:1</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/admin/users')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left w-full"
          >
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">User Management</h3>
            <p className="text-sm text-gray-600">Create, edit, and manage user accounts</p>
          </button>

          <button
            onClick={() => navigate('/admin/appointments')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left w-full"
          >
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Appointments</h3>
            <p className="text-sm text-gray-600">Manage all doctor appointments and schedules</p>
          </button>

          <button
            onClick={() => navigate('/admin/analytics')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left w-full"
          >
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-sm text-gray-600">View system usage and performance metrics</p>
          </button>

          <button
            onClick={() => navigate('/admin/system-health')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left w-full"
          >
            <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Database className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">System Monitoring</h3>
            <p className="text-sm text-gray-600">Real-time system health and performance</p>
          </button>

          <button
            onClick={() => navigate('/admin/security')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left w-full"
          >
            <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Security Center</h3>
            <p className="text-sm text-gray-600">Manage security policies and access controls</p>
          </button>

          <button
            onClick={() => navigate('/admin/settings')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left w-full"
          >
            <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Activity className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">System Settings</h3>
            <p className="text-sm text-gray-600">Configure system parameters and preferences</p>
          </button>
        </div>

        {/* Recent Activity & System Status */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Admin Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Admin Actions</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">New Doctor Added</p>
                  <p className="text-sm text-gray-600">Dr. Emily Johnson - Cardiology</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center">
                  <Settings className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">System Update Deployed</p>
                  <p className="text-sm text-gray-600">Version 2.1.4 - Bug fixes and improvements</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Security Policy Updated</p>
                  <p className="text-sm text-gray-600">Enhanced password requirements</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center">
                    <Database className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Database</p>
                    <p className="text-sm text-gray-600">profileManagementDB</p>
                  </div>
                </div>
                <span className="text-green-600 font-medium">Healthy</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center">
                    <Database className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Database</p>
                    <p className="text-sm text-gray-600">pathAIDB</p>
                  </div>
                </div>
                <span className="text-green-600 font-medium">Healthy</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center">
                    <Activity className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">API Services</p>
                    <p className="text-sm text-gray-600">All endpoints operational</p>
                  </div>
                </div>
                <span className="text-green-600 font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
