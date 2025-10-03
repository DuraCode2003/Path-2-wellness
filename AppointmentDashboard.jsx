import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Calendar, Clock, User, MapPin, Plus, Search, Filter } from 'lucide-react'

const AppointmentDashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock appointment data
  const appointments = {
    upcoming: [
      {
        id: 1,
        doctor: 'Dr. Sarah Johnson',
        specialty: 'Cardiology',
        date: '2024-09-25',
        time: '10:00 AM',
        location: 'Main Hospital - Room 301',
        type: 'Follow-up',
        status: 'confirmed'
      },
      {
        id: 2,
        doctor: 'Dr. Michael Chen',
        specialty: 'ENT',
        date: '2024-09-28',
        time: '2:30 PM',
        location: 'ENT Clinic - Room 205',
        type: 'Consultation',
        status: 'pending'
      }
    ],
    past: [
      {
        id: 3,
        doctor: 'Dr. Emily Davis',
        specialty: 'General Medicine',
        date: '2024-09-20',
        time: '9:00 AM',
        location: 'Main Hospital - Room 101',
        type: 'Check-up',
        status: 'completed'
      },
      {
        id: 4,
        doctor: 'Dr. Robert Wilson',
        specialty: 'Orthopedics',
        date: '2024-09-15',
        time: '11:30 AM',
        location: 'Orthopedic Center - Room 402',
        type: 'Treatment',
        status: 'completed'
      }
    ]
  }

  const handleBack = () => {
    navigate('/home')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredAppointments = appointments[activeTab].filter(appointment =>
    appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back</p>
                <p className="font-semibold text-gray-900">
                  {user?.firstName || user?.name || 'User'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Appointment Dashboard</h1>
                <p className="text-indigo-100">Manage your healthcare appointments</p>
              </div>
              <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Book New Appointment</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-5 w-5 text-gray-400" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'upcoming'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Upcoming Appointments ({appointments.upcoming.length})
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'past'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Past Appointments ({appointments.past.length})
              </button>
            </nav>
          </div>

          {/* Appointments List */}
          <div className="p-6">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No matching appointments' : 'No appointments found'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : activeTab === 'upcoming' 
                      ? 'You have no upcoming appointments' 
                      : 'No past appointments to display'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="bg-indigo-100 rounded-full p-2">
                            <User className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {appointment.doctor}
                            </h3>
                            <p className="text-sm text-gray-600">{appointment.specialty}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900">
                              {new Date(appointment.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900">{appointment.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900">{appointment.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-600">{appointment.type}</span>
                      </div>
                    </div>
                    
                    {activeTab === 'upcoming' && (
                      <div className="mt-4 flex space-x-3">
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                          View Details
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                          Reschedule
                        </button>
                        <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm">
                          Cancel
                        </button>
                      </div>
                    )}
                    
                    {activeTab === 'past' && (
                      <div className="mt-4 flex space-x-3">
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                          View Report
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                          Book Follow-up
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
              <Plus className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Book Appointment</h3>
            <p className="text-gray-600 text-sm mb-4">Schedule a new appointment with your preferred doctor</p>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
              Book Now
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">View Calendar</h3>
            <p className="text-gray-600 text-sm mb-4">See all your appointments in calendar view</p>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Open Calendar
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Doctors</h3>
            <p className="text-gray-600 text-sm mb-4">Search and connect with healthcare providers</p>
            <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Search Doctors
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AppointmentDashboard
