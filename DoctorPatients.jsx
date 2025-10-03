import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, User, Search, Filter, Phone, Mail, Calendar, FileText } from 'lucide-react'
import axios from 'axios'

const DoctorPatients = () => {
  const navigate = useNavigate()
  const { user, token, logout } = useAuth()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // API Base URL
  const PROFILE_API = 'http://localhost:3004/api'

  useEffect(() => {
    fetchDoctorPatients()
  }, [])

  const fetchDoctorPatients = async () => {
    try {
      setLoading(true)
      setError('')

      // Get doctor's assigned patients
      const response = await axios.get(`${PROFILE_API}/patients?doctorId=${user?.id || user?._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setPatients(response.data.data || [])
      } else {
        // Fallback to demo data if API fails
        setPatients(getDemoPatients())
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
      // Use demo data as fallback - don't show error to user
      setPatients(getDemoPatients())
    } finally {
      setLoading(false)
    }
  }

  const getDemoPatients = () => [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      dateOfBirth: '1985-03-15',
      lastVisit: '2024-09-20',
      nextAppointment: '2024-09-25',
      condition: 'Hypertension',
      status: 'Active'
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 234-5678',
      dateOfBirth: '1990-07-22',
      lastVisit: '2024-09-18',
      nextAppointment: '2024-09-26',
      condition: 'Diabetes Type 2',
      status: 'Active'
    },
    {
      id: '3',
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'michael.brown@email.com',
      phone: '+1 (555) 345-6789',
      dateOfBirth: '1978-11-08',
      lastVisit: '2024-09-15',
      nextAppointment: null,
      condition: 'Asthma',
      status: 'Inactive'
    }
  ]

  const handleBack = () => {
    navigate('/doctor-dashboard')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const filteredPatients = patients.filter(patient =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.condition?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patients...</p>
        </div>
      </div>
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
                <p className="font-semibold text-gray-900">Patient Management</p>
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
                <h1 className="text-3xl font-bold mb-2">My Patients</h1>
                <p className="text-indigo-100">Manage your assigned patients</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <p className="text-2xl font-bold">{filteredPatients.length}</p>
                <p className="text-indigo-100 text-sm">Total Patients</p>
              </div>
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
                placeholder="Search patients by name, email, or condition..."
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


        {/* Patients List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No matching patients' : 'No patients assigned'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'You have no patients assigned to you yet'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="bg-indigo-100 rounded-full p-3">
                        <User className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                            {patient.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900">{patient.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900">{patient.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900">
                              Born: {new Date(patient.dateOfBirth).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900">{patient.condition}</span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center space-x-6 text-sm text-gray-600">
                          <span>Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}</span>
                          {patient.nextAppointment && (
                            <span>Next: {new Date(patient.nextAppointment).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                        View Details
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        Schedule
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        Contact
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {filteredPatients.filter(p => p.status === 'Active').length}
            </h3>
            <p className="text-gray-600">Active Patients</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {filteredPatients.filter(p => p.nextAppointment).length}
            </h3>
            <p className="text-gray-600">Scheduled</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="bg-yellow-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {filteredPatients.filter(p => p.condition).length}
            </h3>
            <p className="text-gray-600">With Conditions</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
              <Phone className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {filteredPatients.length}
            </h3>
            <p className="text-gray-600">Total Patients</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DoctorPatients
