import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Calendar, Clock, Plus, Edit3, Trash2, User, Phone } from 'lucide-react'

const DoctorSchedule = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [appointments, setAppointments] = useState([])
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadScheduleData()
  }, [selectedDate])

  const loadScheduleData = () => {
    // Demo data - in real app, fetch from API
    const demoAppointments = [
      {
        id: '1',
        patientName: 'John Smith',
        patientPhone: '+1 (555) 123-4567',
        time: '09:00',
        duration: 30,
        type: 'Consultation',
        status: 'confirmed'
      },
      {
        id: '2',
        patientName: 'Sarah Johnson',
        patientPhone: '+1 (555) 234-5678',
        time: '10:30',
        duration: 45,
        type: 'Follow-up',
        status: 'confirmed'
      },
      {
        id: '3',
        patientName: 'Michael Brown',
        patientPhone: '+1 (555) 345-6789',
        time: '14:00',
        duration: 30,
        type: 'Check-up',
        status: 'pending'
      }
    ]

    const demoAvailability = [
      { time: '09:00', available: false },
      { time: '09:30', available: true },
      { time: '10:00', available: true },
      { time: '10:30', available: false },
      { time: '11:00', available: true },
      { time: '11:30', available: true },
      { time: '14:00', available: false },
      { time: '14:30', available: true },
      { time: '15:00', available: true },
      { time: '15:30', available: true },
      { time: '16:00', available: true }
    ]

    setAppointments(demoAppointments)
    setAvailability(demoAvailability)
  }

  const handleBack = () => {
    navigate('/doctor-dashboard')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const toggleAvailability = (time) => {
    setAvailability(prev => 
      prev.map(slot => 
        slot.time === time 
          ? { ...slot, available: !slot.available }
          : slot
      )
    )
  }

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
                <p className="text-sm text-gray-600">Dr. {user?.firstName || user?.name || 'Doctor'}</p>
                <p className="font-semibold text-gray-900">Schedule Management</p>
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
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Schedule Management</h1>
                <p className="text-green-100">Manage your availability and appointments</p>
              </div>
              <div className="flex space-x-4">
                <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Add Appointment</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Date Selector */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <Calendar className="h-6 w-6 text-indigo-600" />
            <label className="text-lg font-semibold text-gray-900">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span className="text-gray-600">
              {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Appointments */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Today's Appointments</h2>
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                  {appointments.length} appointments
                </span>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {appointments.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments today</h3>
                  <p className="text-gray-600">Your schedule is clear for this date</p>
                </div>
              ) : (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="bg-indigo-100 rounded-full p-2">
                          <User className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{appointment.patientName}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{appointment.time} ({appointment.duration} min)</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{appointment.patientPhone}</span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                              {appointment.type} - {appointment.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Availability Settings</h2>
              <p className="text-gray-600 mt-1">Click time slots to toggle availability</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3">
                {availability.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => toggleAvailability(slot.time)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      slot.available
                        ? 'border-green-200 bg-green-50 text-green-800 hover:bg-green-100'
                        : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{slot.time}</span>
                      <div className={`w-3 h-3 rounded-full ${
                        slot.available ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    </div>
                    <div className="text-xs mt-1">
                      {slot.available ? 'Available' : 'Blocked'}
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                  Save Availability
                </button>
                <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                  Copy from Previous Day
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{appointments.length}</h3>
            <p className="text-gray-600">Today's Appointments</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {availability.filter(slot => slot.available).length}
            </h3>
            <p className="text-gray-600">Available Slots</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="bg-yellow-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
              <User className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {appointments.filter(apt => apt.status === 'pending').length}
            </h3>
            <p className="text-gray-600">Pending Confirmations</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
              <Plus className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {availability.filter(slot => slot.available).length - appointments.length}
            </h3>
            <p className="text-gray-600">Open Slots</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DoctorSchedule
