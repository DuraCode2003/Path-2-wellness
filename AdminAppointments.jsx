import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Calendar, Clock, User, Search, Filter, Plus, Edit3, Trash2, CheckCircle, XCircle } from 'lucide-react'
import axios from 'axios'

const AdminAppointments = () => {
  const navigate = useNavigate()
  const { user, token, logout } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDoctor, setFilterDoctor] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  // API Base URL
  const APPOINTMENTS_API = 'http://localhost:3005/api'

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${APPOINTMENTS_API}/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setAppointments(response.data.data || [])
      } else {
        // Fallback to demo data
        setAppointments(getDemoAppointments())
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      // Use demo data as fallback
      setAppointments(getDemoAppointments())
    } finally {
      setLoading(false)
    }
  }

  const getDemoAppointments = () => [
    {
      id: '1',
      patientName: 'John Smith',
      patientEmail: 'john.smith@email.com',
      doctorName: 'Dr. Sarah Johnson',
      doctorSpecialization: 'Cardiology',
      date: '2024-09-25',
      time: '10:00 AM',
      duration: 30,
      status: 'Scheduled',
      type: 'Consultation',
      notes: 'Regular checkup for hypertension',
      createdAt: '2024-09-20T10:00:00Z'
    },
    {
      id: '2',
      patientName: 'Emily Davis',
      patientEmail: 'emily.davis@email.com',
      doctorName: 'Dr. Michael Brown',
      doctorSpecialization: 'Neurology',
      date: '2024-09-25',
      time: '2:00 PM',
      duration: 45,
      status: 'Confirmed',
      type: 'Follow-up',
      notes: 'Follow-up for migraine treatment',
      createdAt: '2024-09-21T14:00:00Z'
    },
    {
      id: '3',
      patientName: 'Robert Wilson',
      patientEmail: 'robert.wilson@email.com',
      doctorName: 'Dr. Sarah Johnson',
      doctorSpecialization: 'Cardiology',
      date: '2024-09-26',
      time: '9:30 AM',
      duration: 60,
      status: 'Completed',
      type: 'Procedure',
      notes: 'ECG and stress test completed',
      createdAt: '2024-09-18T09:30:00Z'
    },
    {
      id: '4',
      patientName: 'Lisa Anderson',
      patientEmail: 'lisa.anderson@email.com',
      doctorName: 'Dr. Emily Davis',
      doctorSpecialization: 'Dermatology',
      date: '2024-09-27',
      time: '11:00 AM',
      duration: 30,
      status: 'Cancelled',
      type: 'Consultation',
      notes: 'Patient requested cancellation',
      createdAt: '2024-09-22T11:00:00Z'
    },
    {
      id: '5',
      patientName: 'David Thompson',
      patientEmail: 'david.thompson@email.com',
      doctorName: 'Dr. Michael Brown',
      doctorSpecialization: 'Neurology',
      date: '2024-09-28',
      time: '3:30 PM',
      duration: 30,
      status: 'Scheduled',
      type: 'Consultation',
      notes: 'Initial consultation for headaches',
      createdAt: '2024-09-23T15:30:00Z'
    }
  ]

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = `${appointment.patientName} ${appointment.doctorName} ${appointment.type}`.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus
    const matchesDoctor = filterDoctor === 'all' || appointment.doctorName.includes(filterDoctor)
    return matchesSearch && matchesStatus && matchesDoctor
  })

  const handleCreateAppointment = async (appointmentData) => {
    try {
      const response = await axios.post(`${APPOINTMENTS_API}/appointments`, appointmentData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        fetchAppointments()
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Error creating appointment:', error)
      // For demo purposes, add to local state
      const newAppointment = {
        id: Date.now().toString(),
        ...appointmentData,
        createdAt: new Date().toISOString()
      }
      setAppointments(prev => [...prev, newAppointment])
      setShowCreateModal(false)
    }
  }

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await axios.patch(`${APPOINTMENTS_API}/appointments/${appointmentId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchAppointments()
    } catch (error) {
      console.error('Error updating appointment:', error)
      // For demo purposes, update local state
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId ? { ...apt, status: newStatus } : apt
      ))
    }
  }

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await axios.delete(`${APPOINTMENTS_API}/appointments/${appointmentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        fetchAppointments()
      } catch (error) {
        console.error('Error deleting appointment:', error)
        // For demo purposes, remove from local state
        setAppointments(prev => prev.filter(apt => apt.id !== appointmentId))
      }
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800'
      case 'Confirmed': return 'bg-green-100 text-green-800'
      case 'Completed': return 'bg-gray-100 text-gray-800'
      case 'Cancelled': return 'bg-red-100 text-red-800'
      case 'No-show': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'Consultation': return 'bg-purple-100 text-purple-800'
      case 'Follow-up': return 'bg-indigo-100 text-indigo-800'
      case 'Procedure': return 'bg-orange-100 text-orange-800'
      case 'Emergency': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const uniqueDoctors = [...new Set(appointments.map(apt => apt.doctorName))]

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
              <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
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
        <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Appointment Management</h2>
              <p className="text-green-100">Manage all appointments across the healthcare system</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{appointments.length}</div>
                <div className="text-sm text-green-100">Total</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">
                  {appointments.filter(apt => apt.status === 'Scheduled' || apt.status === 'Confirmed').length}
                </div>
                <div className="text-sm text-green-100">Active</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="No-show">No-show</option>
              </select>
              <select
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Doctors</option>
                {uniqueDoctors.map(doctor => (
                  <option key={doctor} value={doctor}>{doctor}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>New Appointment</span>
            </button>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterStatus !== 'all' || filterDoctor !== 'all' ? 'No matching appointments' : 'No appointments found'}
              </h3>
              <p className="text-gray-600">
                {searchTerm || filterStatus !== 'all' || filterDoctor !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by creating your first appointment'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.patientName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.patientEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.doctorName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.doctorSpecialization}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {appointment.date}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          {appointment.time} ({appointment.duration}min)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(appointment.type)}`}>
                          {appointment.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {appointment.status === 'Scheduled' && (
                            <button
                              onClick={() => handleUpdateStatus(appointment.id, 'Confirmed')}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title="Confirm"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          {(appointment.status === 'Scheduled' || appointment.status === 'Confirmed') && (
                            <button
                              onClick={() => handleUpdateStatus(appointment.id, 'Cancelled')}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Cancel"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedAppointment(appointment)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAppointment(appointment.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Delete"
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

      {/* Create Appointment Modal */}
      {showCreateModal && (
        <CreateAppointmentModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAppointment}
        />
      )}
    </div>
  )
}

// Create Appointment Modal Component
const CreateAppointmentModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    doctorName: '',
    doctorSpecialization: '',
    date: '',
    time: '',
    duration: 30,
    type: 'Consultation',
    notes: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      status: 'Scheduled'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Create New Appointment</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Patient Name"
              value={formData.patientName}
              onChange={(e) => setFormData({...formData, patientName: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="email"
              placeholder="Patient Email"
              value={formData.patientEmail}
              onChange={(e) => setFormData({...formData, patientEmail: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Doctor Name"
              value={formData.doctorName}
              onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="Specialization"
              value={formData.doctorSpecialization}
              onChange={(e) => setFormData({...formData, doctorSpecialization: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
            <select
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>60 min</option>
            </select>
          </div>
          <select
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Consultation">Consultation</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Procedure">Procedure</option>
            <option value="Emergency">Emergency</option>
          </select>
          <textarea
            placeholder="Notes (optional)"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
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
              Create Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminAppointments
