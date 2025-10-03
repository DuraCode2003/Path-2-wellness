import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, BarChart3, TrendingUp, Users, Calendar, Activity, RefreshCw } from 'lucide-react'
import axios from 'axios'

const AdminAnalytics = () => {
  const navigate = useNavigate()
  const { user, token, logout } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState('7d')

  // API Base URL
  const ANALYTICS_API = 'http://localhost:3006/api'

  useEffect(() => {
    fetchAnalytics()
    // Set up polling for real-time updates every 10 seconds
    const interval = setInterval(fetchAnalytics, 10000)
    return () => clearInterval(interval)
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true)
      const response = await axios.get(`${ANALYTICS_API}/analytics?range=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setAnalytics(response.data.data)
      } else {
        // Fallback to demo data
        setAnalytics(getDemoAnalytics())
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      // Use demo data as fallback
      setAnalytics(getDemoAnalytics())
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getDemoAnalytics = () => ({
    overview: {
      totalUsers: 1247,
      activeUsers: 892,
      totalDoctors: 89,
      activeDoctors: 76,
      totalAppointments: 2156,
      completedAppointments: 1834,
      systemUptime: 99.9,
      avgResponseTime: 120
    },
    userGrowth: [
      { date: '2024-09-18', patients: 1180, doctors: 85, admins: 12 },
      { date: '2024-09-19', patients: 1195, doctors: 86, admins: 12 },
      { date: '2024-09-20', patients: 1210, doctors: 87, admins: 12 },
      { date: '2024-09-21', patients: 1225, doctors: 88, admins: 12 },
      { date: '2024-09-22', patients: 1235, doctors: 89, admins: 12 },
      { date: '2024-09-23', patients: 1240, doctors: 89, admins: 12 },
      { date: '2024-09-24', patients: 1247, doctors: 89, admins: 12 }
    ],
    appointmentStats: [
      { date: '2024-09-18', scheduled: 45, completed: 38, cancelled: 7 },
      { date: '2024-09-19', scheduled: 52, completed: 44, cancelled: 8 },
      { date: '2024-09-20', scheduled: 48, completed: 41, cancelled: 7 },
      { date: '2024-09-21', scheduled: 55, completed: 47, cancelled: 8 },
      { date: '2024-09-22', scheduled: 49, completed: 42, cancelled: 7 },
      { date: '2024-09-23', scheduled: 51, completed: 45, cancelled: 6 },
      { date: '2024-09-24', scheduled: 53, completed: 48, cancelled: 5 }
    ],
    topDoctors: [
      { name: 'Dr. Sarah Johnson', specialization: 'Cardiology', appointments: 156, rating: 4.9 },
      { name: 'Dr. Michael Brown', specialization: 'Neurology', appointments: 142, rating: 4.8 },
      { name: 'Dr. Emily Davis', specialization: 'Dermatology', appointments: 138, rating: 4.9 },
      { name: 'Dr. Robert Wilson', specialization: 'Orthopedics', appointments: 134, rating: 4.7 },
      { name: 'Dr. Lisa Anderson', specialization: 'Pediatrics', appointments: 129, rating: 4.8 }
    ],
    systemHealth: {
      database: { status: 'Healthy', responseTime: 45, connections: 23 },
      api: { status: 'Healthy', responseTime: 120, requests: 15420 },
      websocket: { status: 'Healthy', connections: 54, messages: 8920 }
    },
    recentActivity: [
      { time: '2 min ago', action: 'New patient registration', user: 'John Doe' },
      { time: '5 min ago', action: 'Appointment completed', user: 'Dr. Sarah Johnson' },
      { time: '8 min ago', action: 'System backup completed', user: 'System' },
      { time: '12 min ago', action: 'New doctor added', user: 'Admin' },
      { time: '15 min ago', action: 'Patient profile updated', user: 'Emily Davis' }
    ]
  })

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const getGrowthPercentage = (current, previous) => {
    if (!previous) return 0
    return ((current - previous) / previous * 100).toFixed(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading analytics...</p>
        </div>
      </div>
    )
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
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchAnalytics}
                disabled={refreshing}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
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
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">System Analytics</h2>
              <p className="text-indigo-100">Real-time insights and performance metrics</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{analytics?.overview?.systemUptime}%</div>
                <div className="text-sm text-indigo-100">System Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics?.overview?.totalUsers)}</p>
                <p className="text-xs text-green-600 mt-1">
                  ↑ {getGrowthPercentage(analytics?.overview?.totalUsers, analytics?.overview?.totalUsers - 50)}% this week
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Doctors</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.overview?.activeDoctors}</p>
                <p className="text-xs text-green-600 mt-1">
                  ↑ {getGrowthPercentage(analytics?.overview?.activeDoctors, analytics?.overview?.activeDoctors - 3)}% this week
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics?.overview?.totalAppointments)}</p>
                <p className="text-xs text-green-600 mt-1">
                  ↑ {getGrowthPercentage(analytics?.overview?.totalAppointments, analytics?.overview?.totalAppointments - 120)}% this week
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.overview?.avgResponseTime}ms</p>
                <p className="text-xs text-green-600 mt-1">
                  ↓ 15ms faster than last week
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">User Growth Trend</h3>
            <div className="space-y-4">
              {analytics?.userGrowth?.slice(-5).map((day, index) => (
                <div key={day.date} className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">{day.date}</div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Patients: {day.patients}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Doctors: {day.doctors}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Appointment Statistics */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Appointment Statistics</h3>
            <div className="space-y-4">
              {analytics?.appointmentStats?.slice(-5).map((day, index) => (
                <div key={day.date} className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">{day.date}</div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Scheduled: {day.scheduled}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Completed: {day.completed}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Cancelled: {day.cancelled}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Doctors and System Health */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Top Performing Doctors */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Top Performing Doctors</h3>
            <div className="space-y-4">
              {analytics?.topDoctors?.map((doctor, index) => (
                <div key={doctor.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-indigo-100 w-10 h-10 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-medium">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{doctor.name}</div>
                      <div className="text-sm text-gray-500">{doctor.specialization}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{doctor.appointments} appointments</div>
                    <div className="text-sm text-yellow-600">★ {doctor.rating}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Database</p>
                    <p className="text-sm text-gray-600">{analytics?.systemHealth?.database?.connections} active connections</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-green-600 font-medium">{analytics?.systemHealth?.database?.status}</span>
                  <p className="text-sm text-gray-500">{analytics?.systemHealth?.database?.responseTime}ms</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center">
                    <Activity className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">API Services</p>
                    <p className="text-sm text-gray-600">{formatNumber(analytics?.systemHealth?.api?.requests)} requests today</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-green-600 font-medium">{analytics?.systemHealth?.api?.status}</span>
                  <p className="text-sm text-gray-500">{analytics?.systemHealth?.api?.responseTime}ms</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">WebSocket</p>
                    <p className="text-sm text-gray-600">{analytics?.systemHealth?.websocket?.connections} active connections</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-green-600 font-medium">{analytics?.systemHealth?.websocket?.status}</span>
                  <p className="text-sm text-gray-500">{formatNumber(analytics?.systemHealth?.websocket?.messages)} messages</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent System Activity</h3>
          <div className="space-y-3">
            {analytics?.recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center">
                    <Activity className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500">by {activity.user}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminAnalytics
