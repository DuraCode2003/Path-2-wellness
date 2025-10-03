import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LogOut, Stethoscope, Users, Calendar, FileText, AlertTriangle, Activity } from 'lucide-react'

const DoctorDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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
              <Stethoscope className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
                <p className="text-sm text-gray-600">Dr. {user?.firstName || user?.name || 'Doctor'}</p>
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
        <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome to Your Medical Dashboard</h2>
          <p className="text-green-100">Manage your patients and medical practice efficiently</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">127</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Cases</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/profile/doctor-patients')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left w-full"
          >
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Patient Management</h3>
            <p className="text-sm text-gray-600">View and manage your patient roster</p>
          </button>

          <button
            onClick={() => navigate('/doctor-appointments/dashboard')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left w-full"
          >
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Schedule</h3>
            <p className="text-sm text-gray-600">Manage appointments and availability</p>
          </button>

          <button
            onClick={() => navigate('/pathai/escalations')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left w-full"
          >
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Escalation Tickets</h3>
            <p className="text-sm text-gray-600">Review AI-escalated critical cases</p>
          </button>
        </div>

        {/* Recent Activity & Escalation Tickets */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Today's Schedule */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Today's Schedule</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">John Smith</p>
                  <p className="text-sm text-gray-600">10:00 AM - Routine Checkup</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Sarah Johnson</p>
                  <p className="text-sm text-gray-600">11:30 AM - Follow-up</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-lg">
                <div className="bg-red-100 w-10 h-10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Emergency Consultation</p>
                  <p className="text-sm text-gray-600">2:00 PM - Urgent case</p>
                </div>
              </div>
            </div>
          </div>

          {/* Critical Escalations */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Critical Escalations</h3>
              <button
                onClick={() => navigate('/pathai/escalations')}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/pathai/escalations')}
                className="flex items-center space-x-4 p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors w-full text-left"
              >
                <div className="bg-red-100 w-10 h-10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Chest Pain Case</p>
                  <p className="text-sm text-gray-600">AI escalated - Requires immediate attention</p>
                  <p className="text-xs text-red-600 mt-1">Priority: Emergency</p>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/pathai/escalations')}
                className="flex items-center space-x-4 p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors w-full text-left"
              >
                <div className="bg-orange-100 w-10 h-10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">High Fever Case</p>
                  <p className="text-sm text-gray-600">Patient reporting 103°F fever</p>
                  <p className="text-xs text-orange-600 mt-1">Priority: High</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DoctorDashboard
