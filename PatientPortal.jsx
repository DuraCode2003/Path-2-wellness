import React, { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LogOut, Home, User, Calendar, FileText, MessageCircle, Bot } from 'lucide-react'

const PatientPortal = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleNavigation = (path) => {
    navigate(path)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Home className="h-8 w-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Patient Portal</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.firstName || user?.name || 'Patient'}</p>
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
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome to Your Health Dashboard</h2>
          <p className="text-indigo-100">Manage your health journey with our comprehensive patient portal</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button 
            onClick={() => handleNavigation('/doctor-appointments/userdashboard')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left w-full"
          >
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Appointments</h3>
            <p className="text-sm text-gray-600">Schedule and manage your appointments</p>
          </button>

          <button 
            onClick={() => handleNavigation('/path-ai/patientportal')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left w-full"
          >
            <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Bot className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Assistant</h3>
            <p className="text-sm text-gray-600">Chat with our AI health assistant</p>
          </button>

          <button 
            onClick={() => alert('Medical Records feature coming soon!')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left w-full"
          >
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Medical Records</h3>
            <p className="text-sm text-gray-600">Access your health records and reports</p>
          </button>

          <button 
            onClick={() => handleNavigation('/profile-management/user-profile')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left w-full"
          >
            <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <User className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Profile</h3>
            <p className="text-sm text-gray-600">Update your personal information</p>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <button 
              onClick={() => handleNavigation('/doctor-appointments/userdashboard')}
              className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
            >
              <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Upcoming Appointment</p>
                <p className="text-sm text-gray-600">Dr. Smith - Tomorrow at 2:00 PM</p>
              </div>
            </button>
            
            <button 
              onClick={() => alert('Medical Records feature coming soon!')}
              className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
            >
              <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Lab Results Available</p>
                <p className="text-sm text-gray-600">Blood work results from last week</p>
              </div>
            </button>

            <button 
              onClick={() => handleNavigation('/path-ai/patientportal')}
              className="flex items-center space-x-4 p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors w-full text-left border border-indigo-200"
            >
              <div className="bg-indigo-100 w-10 h-10 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Try AI Health Assistant</p>
                <p className="text-sm text-gray-600">Get instant health guidance and support</p>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PatientPortal
