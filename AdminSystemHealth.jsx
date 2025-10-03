import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Database, Server, Wifi, AlertTriangle, CheckCircle, RefreshCw, Activity, Zap } from 'lucide-react'
import axios from 'axios'

const AdminSystemHealth = () => {
  const navigate = useNavigate()
  const { user, token, logout } = useAuth()
  const [healthData, setHealthData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // API Base URL
  const SYSTEM_API = 'http://localhost:3007/api'

  useEffect(() => {
    fetchSystemHealth()
    // Set up real-time polling every 5 seconds
    const interval = setInterval(fetchSystemHealth, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchSystemHealth = async () => {
    try {
      setRefreshing(true)
      const response = await axios.get(`${SYSTEM_API}/system-health`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setHealthData(response.data.data)
      } else {
        // Fallback to demo data
        setHealthData(getDemoHealthData())
      }
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching system health:', error)
      // Use demo data as fallback
      setHealthData(getDemoHealthData())
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getDemoHealthData = () => ({
    overview: {
      overallStatus: 'Healthy',
      uptime: 99.9,
      totalServices: 8,
      healthyServices: 8,
      warningServices: 0,
      criticalServices: 0
    },
    databases: [
      {
        name: 'profileManagementDB',
        status: 'Healthy',
        responseTime: 45,
        connections: 23,
        maxConnections: 100,
        diskUsage: 68,
        lastBackup: '2024-09-24T02:00:00Z'
      },
      {
        name: 'pathAIDB',
        status: 'Healthy',
        responseTime: 52,
        connections: 18,
        maxConnections: 100,
        diskUsage: 45,
        lastBackup: '2024-09-24T02:00:00Z'
      },
      {
        name: 'appointmentsDB',
        status: 'Healthy',
        responseTime: 38,
        connections: 15,
        maxConnections: 100,
        diskUsage: 32,
        lastBackup: '2024-09-24T02:00:00Z'
      }
    ],
    services: [
      {
        name: 'Unified App',
        status: 'Healthy',
        port: 3003,
        responseTime: 120,
        uptime: 99.9,
        memoryUsage: 245,
        cpuUsage: 15,
        lastRestart: '2024-09-23T10:00:00Z'
      },
      {
        name: 'Profile Management API',
        status: 'Healthy',
        port: 3004,
        responseTime: 95,
        uptime: 99.8,
        memoryUsage: 180,
        cpuUsage: 12,
        lastRestart: '2024-09-23T10:00:00Z'
      },
      {
        name: 'PathAI API',
        status: 'Healthy',
        port: 5002,
        responseTime: 150,
        uptime: 99.7,
        memoryUsage: 320,
        cpuUsage: 25,
        lastRestart: '2024-09-23T10:00:00Z'
      },
      {
        name: 'Doctor Appointments API',
        status: 'Healthy',
        port: 3005,
        responseTime: 110,
        uptime: 99.9,
        memoryUsage: 165,
        cpuUsage: 8,
        lastRestart: '2024-09-23T10:00:00Z'
      }
    ],
    network: {
      status: 'Healthy',
      latency: 12,
      bandwidth: 85,
      activeConnections: 156,
      totalRequests: 25420,
      errorRate: 0.02
    },
    security: {
      status: 'Secure',
      sslCertificates: 'Valid',
      lastSecurityScan: '2024-09-23T18:00:00Z',
      vulnerabilities: 0,
      failedLogins: 3,
      activeTokens: 89
    },
    performance: {
      avgResponseTime: 120,
      peakResponseTime: 450,
      throughput: 1250,
      errorRate: 0.02,
      cacheHitRate: 94.5
    },
    alerts: [
      {
        id: 1,
        type: 'info',
        message: 'Scheduled maintenance window: Sunday 2:00 AM - 4:00 AM',
        timestamp: '2024-09-24T08:00:00Z'
      },
      {
        id: 2,
        type: 'warning',
        message: 'PathAI API memory usage above 80%',
        timestamp: '2024-09-24T07:30:00Z'
      }
    ]
  })

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'secure':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'critical':
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'secure':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'critical':
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Activity className="h-5 w-5 text-gray-600" />
    }
  }

  const formatUptime = (uptime) => {
    return `${uptime}%`
  }

  const formatMemory = (memory) => {
    return `${memory} MB`
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading system health...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">System Health Monitor</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <button
                onClick={fetchSystemHealth}
                disabled={refreshing}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
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
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">System Health Monitor</h2>
              <p className="text-green-100">Real-time monitoring of all system components</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{healthData?.overview?.uptime}%</div>
                <div className="text-sm text-green-100">Uptime</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{healthData?.overview?.healthyServices}/{healthData?.overview?.totalServices}</div>
                <div className="text-sm text-green-100">Services</div>
              </div>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overall Status</p>
                <p className="text-2xl font-bold text-gray-900">{healthData?.overview?.overallStatus}</p>
              </div>
              {getStatusIcon(healthData?.overview?.overallStatus)}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">System Uptime</p>
                <p className="text-2xl font-bold text-gray-900">{formatUptime(healthData?.overview?.uptime)}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{healthData?.performance?.avgResponseTime}ms</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Connections</p>
                <p className="text-2xl font-bold text-gray-900">{healthData?.network?.activeConnections}</p>
              </div>
              <Wifi className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Database Health */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Database Health</h3>
          <div className="grid lg:grid-cols-3 gap-6">
            {healthData?.databases?.map((db, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Database className="h-6 w-6 text-blue-600" />
                    <h4 className="font-medium text-gray-900">{db.name}</h4>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(db.status)}`}>
                    {db.status}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Response Time:</span>
                    <span className="font-medium">{db.responseTime}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Connections:</span>
                    <span className="font-medium">{db.connections}/{db.maxConnections}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Disk Usage:</span>
                    <span className="font-medium">{db.diskUsage}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Backup:</span>
                    <span className="font-medium">{formatTimestamp(db.lastBackup)}</span>
                  </div>
                  {/* Connection Usage Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Connection Usage</span>
                      <span>{Math.round((db.connections / db.maxConnections) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(db.connections / db.maxConnections) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Health */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Service Health</h3>
          <div className="grid lg:grid-cols-2 gap-6">
            {healthData?.services?.map((service, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Server className="h-6 w-6 text-green-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{service.name}</h4>
                      <p className="text-sm text-gray-500">Port: {service.port}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Response Time:</span>
                      <span className="font-medium">{service.responseTime}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Uptime:</span>
                      <span className="font-medium">{formatUptime(service.uptime)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Memory:</span>
                      <span className="font-medium">{formatMemory(service.memoryUsage)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">CPU:</span>
                      <span className="font-medium">{service.cpuUsage}%</span>
                    </div>
                  </div>
                </div>
                {/* CPU Usage Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>CPU Usage</span>
                    <span>{service.cpuUsage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${service.cpuUsage > 80 ? 'bg-red-600' : service.cpuUsage > 60 ? 'bg-yellow-600' : 'bg-green-600'}`}
                      style={{ width: `${service.cpuUsage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Network & Security */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Network Health */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Network Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <Wifi className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Network Status</p>
                    <p className="text-sm text-gray-600">Latency: {healthData?.network?.latency}ms</p>
                  </div>
                </div>
                <span className="text-green-600 font-medium">{healthData?.network?.status}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{healthData?.network?.activeConnections}</div>
                  <div className="text-sm text-gray-600">Active Connections</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{healthData?.network?.totalRequests}</div>
                  <div className="text-sm text-gray-600">Total Requests</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bandwidth Usage:</span>
                  <span className="font-medium">{healthData?.network?.bandwidth}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${healthData?.network?.bandwidth}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Error Rate:</span>
                  <span className="font-medium">{healthData?.network?.errorRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${100 - (healthData?.network?.errorRate * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Security Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Security Status</p>
                    <p className="text-sm text-gray-600">SSL: {healthData?.security?.sslCertificates}</p>
                  </div>
                </div>
                <span className="text-green-600 font-medium">{healthData?.security?.status}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{healthData?.security?.vulnerabilities}</div>
                  <div className="text-sm text-gray-600">Vulnerabilities</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{healthData?.security?.activeTokens}</div>
                  <div className="text-sm text-gray-600">Active Tokens</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Failed Logins (24h):</span>
                  <span className="font-medium">{healthData?.security?.failedLogins}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Security Scan:</span>
                  <span className="font-medium">{formatTimestamp(healthData?.security?.lastSecurityScan)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Performance Metrics</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{healthData?.performance?.avgResponseTime}ms</div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{healthData?.performance?.peakResponseTime}ms</div>
              <div className="text-sm text-gray-600">Peak Response Time</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{healthData?.performance?.throughput}</div>
              <div className="text-sm text-gray-600">Throughput (req/min)</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{healthData?.performance?.errorRate}%</div>
              <div className="text-sm text-gray-600">Error Rate</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{healthData?.performance?.cacheHitRate}%</div>
              <div className="text-sm text-gray-600">Cache Hit Rate</div>
            </div>
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">System Alerts</h3>
          {healthData?.alerts?.length > 0 ? (
            <div className="space-y-3">
              {healthData.alerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border ${
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : 
                  alert.type === 'error' ? 'bg-red-50 border-red-200' : 
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {alert.type === 'warning' ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      ) : alert.type === 'error' ? (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Activity className="h-5 w-5 text-blue-600" />
                      )}
                      <p className="font-medium text-gray-900">{alert.message}</p>
                    </div>
                    <span className="text-sm text-gray-500">{formatTimestamp(alert.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Alerts</h3>
              <p className="text-gray-600">All systems are operating normally</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminSystemHealth
