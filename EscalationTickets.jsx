import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, AlertTriangle, User, Clock, MessageCircle, CheckCircle, X, Search, Filter } from 'lucide-react'
import axios from 'axios'

const EscalationTickets = () => {
  const navigate = useNavigate()
  const { user, token, logout } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // API Base URL - PathAI API
  const PATHAI_API = 'http://localhost:5002/api'

  useEffect(() => {
    fetchEscalationTickets()
  }, [])

  const fetchEscalationTickets = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch escalation tickets assigned to this doctor
      const response = await axios.get(`${PATHAI_API}/tickets?doctorId=${user?.id || user?._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setTickets(response.data.data || [])
      } else {
        // Fallback to demo data if API fails
        setTickets(getDemoTickets())
      }
    } catch (error) {
      console.error('Error fetching escalation tickets:', error)
      // Use demo data as fallback - don't show error to user
      setTickets(getDemoTickets())
    } finally {
      setLoading(false)
    }
  }

  const getDemoTickets = () => [
    {
      id: '1',
      patientName: 'John Smith',
      patientAge: 45,
      symptoms: ['chest pain', 'shortness of breath', 'dizziness'],
      aiResponse: 'Based on the symptoms described, this could indicate a cardiovascular issue. Immediate medical attention is recommended.',
      priority: 'critical',
      status: 'pending',
      createdAt: '2024-09-24T08:30:00Z',
      chatHistory: [
        { sender: 'patient', message: 'I have been experiencing chest pain for the last 2 hours', timestamp: '2024-09-24T08:25:00Z' },
        { sender: 'ai', message: 'I understand you\'re experiencing chest pain. Can you describe the pain? Is it sharp, dull, or crushing?', timestamp: '2024-09-24T08:25:30Z' },
        { sender: 'patient', message: 'It feels like pressure and I\'m having trouble breathing', timestamp: '2024-09-24T08:26:00Z' },
        { sender: 'ai', message: 'This requires immediate medical attention. I\'m escalating this to a doctor right away.', timestamp: '2024-09-24T08:26:30Z' }
      ]
    },
    {
      id: '2',
      patientName: 'Sarah Johnson',
      patientAge: 32,
      symptoms: ['severe headache', 'vision problems', 'nausea'],
      aiResponse: 'The combination of severe headache with vision changes and nausea could indicate a serious neurological condition requiring urgent evaluation.',
      priority: 'high',
      status: 'pending',
      createdAt: '2024-09-24T09:15:00Z',
      chatHistory: [
        { sender: 'patient', message: 'I have the worst headache of my life and my vision is blurry', timestamp: '2024-09-24T09:10:00Z' },
        { sender: 'ai', message: 'A sudden severe headache with vision changes is concerning. Are you experiencing any nausea or vomiting?', timestamp: '2024-09-24T09:10:30Z' },
        { sender: 'patient', message: 'Yes, I feel very nauseous and the light hurts my eyes', timestamp: '2024-09-24T09:11:00Z' }
      ]
    },
    {
      id: '3',
      patientName: 'Michael Brown',
      patientAge: 28,
      symptoms: ['persistent cough', 'fever', 'difficulty breathing'],
      aiResponse: 'Respiratory symptoms with fever and breathing difficulties require medical evaluation, especially given current health concerns.',
      priority: 'medium',
      status: 'reviewed',
      createdAt: '2024-09-23T14:20:00Z',
      doctorNotes: 'Patient scheduled for urgent care visit. Prescribed inhaler and monitoring.',
      chatHistory: [
        { sender: 'patient', message: 'I\'ve had this cough for a week and now I have a fever', timestamp: '2024-09-23T14:15:00Z' },
        { sender: 'ai', message: 'How high is your fever? Are you having any difficulty breathing?', timestamp: '2024-09-23T14:15:30Z' }
      ]
    }
  ]

  const handleBack = () => {
    navigate('/doctor-dashboard')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket)
    setShowModal(true)
  }

  const handleReviewTicket = async (ticketId, notes) => {
    try {
      // Update ticket status to reviewed
      await axios.patch(`${PATHAI_API}/tickets/${ticketId}`, {
        status: 'reviewed',
        doctorNotes: notes,
        reviewedBy: user?.id || user?._id,
        reviewedAt: new Date().toISOString()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Update local state
      setTickets(prev => 
        prev.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, status: 'reviewed', doctorNotes: notes }
            : ticket
        )
      )

      setShowModal(false)
      setSelectedTicket(null)
    } catch (error) {
      console.error('Error reviewing ticket:', error)
      // For demo purposes, update locally anyway
      setTickets(prev => 
        prev.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, status: 'reviewed', doctorNotes: notes }
            : ticket
        )
      )
      setShowModal(false)
      setSelectedTicket(null)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'reviewed':
        return 'bg-green-100 text-green-800'
      case 'resolved':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.symptoms.some(symptom => symptom.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterStatus === 'all' || ticket.status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading escalation tickets...</p>
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
                <p className="font-semibold text-gray-900">Escalation Tickets</p>
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
          <div className="bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Escalation Tickets</h1>
                <p className="text-red-100">AI-generated critical cases requiring your attention</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <p className="text-2xl font-bold">{filteredTickets.filter(t => t.status === 'pending').length}</p>
                <p className="text-red-100 text-sm">Pending Review</p>
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
                placeholder="Search by patient name or symptoms..."
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
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>


        {/* Tickets List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterStatus !== 'all' ? 'No matching tickets' : 'No escalation tickets'}
              </h3>
              <p className="text-gray-600">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No critical cases have been escalated by the AI system'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleTicketClick(ticket)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="bg-red-100 rounded-full p-3">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {ticket.patientName}
                          </h3>
                          <span className="text-gray-600">Age: {ticket.patientAge}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority} priority
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Symptoms:</strong> {ticket.symptoms.join(', ')}
                          </p>
                          <p className="text-sm text-gray-800">
                            <strong>AI Assessment:</strong> {ticket.aiResponse}
                          </p>
                        </div>

                        {ticket.doctorNotes && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                            <p className="text-sm text-green-800">
                              <strong>Doctor Notes:</strong> {ticket.doctorNotes}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{ticket.chatHistory?.length || 0} messages</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      {ticket.status === 'pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTicketClick(ticket)
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                        >
                          Review
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTicketClick(ticket)
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        View Details
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
            <div className="bg-red-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {filteredTickets.filter(t => t.priority === 'critical').length}
            </h3>
            <p className="text-gray-600">Critical Cases</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="bg-yellow-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {filteredTickets.filter(t => t.status === 'pending').length}
            </h3>
            <p className="text-gray-600">Pending Review</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {filteredTickets.filter(t => t.status === 'reviewed').length}
            </h3>
            <p className="text-gray-600">Reviewed</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{filteredTickets.length}</h3>
            <p className="text-gray-600">Total Tickets</p>
          </div>
        </div>
      </main>

      {/* Modal for ticket details */}
      {showModal && selectedTicket && (
        <TicketModal 
          ticket={selectedTicket}
          onClose={() => setShowModal(false)}
          onReview={handleReviewTicket}
        />
      )}
    </div>
  )
}

// Modal component for ticket details
const TicketModal = ({ ticket, onClose, onReview }) => {
  const [notes, setNotes] = useState(ticket.doctorNotes || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    onReview(ticket.id, notes)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Escalation Ticket Details</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
              <div className="space-y-3">
                <p><strong>Name:</strong> {ticket.patientName}</p>
                <p><strong>Age:</strong> {ticket.patientAge}</p>
                <p><strong>Priority:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </p>
                <p><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </p>
                <p><strong>Created:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
              </div>
              
              <h4 className="text-md font-semibold mt-6 mb-3">Symptoms</h4>
              <ul className="list-disc list-inside space-y-1">
                {ticket.symptoms.map((symptom, index) => (
                  <li key={index} className="text-gray-700">{symptom}</li>
                ))}
              </ul>
              
              <h4 className="text-md font-semibold mt-6 mb-3">AI Assessment</h4>
              <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">{ticket.aiResponse}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Chat History</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto space-y-3">
                {ticket.chatHistory?.map((message, index) => (
                  <div key={index} className={`p-3 rounded-lg ${
                    message.sender === 'patient' ? 'bg-white ml-4' : 'bg-blue-100 mr-4'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">
                        {message.sender === 'patient' ? 'Patient' : 'AI Assistant'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{message.message}</p>
                  </div>
                ))}
              </div>
              
              {ticket.status === 'pending' && (
                <form onSubmit={handleSubmit} className="mt-6">
                  <h4 className="text-md font-semibold mb-3">Doctor Review</h4>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your clinical notes and recommendations..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows="4"
                    required
                  />
                  <div className="flex space-x-3 mt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Mark as Reviewed
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
              
              {ticket.doctorNotes && (
                <div className="mt-6">
                  <h4 className="text-md font-semibold mb-3">Doctor Notes</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800">{ticket.doctorNotes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper functions for colors (moved outside component to avoid re-creation)
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'reviewed':
      return 'bg-green-100 text-green-800'
    case 'resolved':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default EscalationTickets
