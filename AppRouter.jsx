import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Import app components
import Homepage from './components/Homepage'
import ProfileManagement from './components/ProfileManagement'
import PatientPortal from './components/PatientPortal'
import DoctorDashboard from './components/DoctorDashboard'
import AdminDashboard from './components/AdminDashboard'
import NotFound from './components/NotFound'

// Import new components for the requested functionality
import UserProfile from './components/UserProfile.jsx'
import AIAssistant from './components/AIAssistant.jsx'
import AppointmentDashboard from './components/AppointmentDashboard.jsx'
import DoctorPatients from './components/DoctorPatients.jsx'
import DoctorSchedule from './components/DoctorSchedule.jsx'
import EscalationTickets from './components/EscalationTickets.jsx'

// Import admin dashboard components
import AdminUserManagement from './components/AdminUserManagement.jsx'
import AdminAppointments from './components/AdminAppointments.jsx'
import AdminAnalytics from './components/AdminAnalytics.jsx'
import AdminSystemHealth from './components/AdminSystemHealth.jsx'

function AppRouter() {
  return (
    <AuthProvider>
      <div className="app-container">
        <Routes>
          {/* Homepage Route */}
          <Route path="/" element={<Homepage />} />
          
          {/* Profile Management Routes */}
          <Route path="/profile-management/*" element={<ProfileManagement />} />
          <Route 
            path="/profile-management/user-profile" 
            element={
              <ProtectedRoute allowedRoles={['patient', 'Patient', 'doctor', 'Doctor', 'admin', 'Admin']}>
                <UserProfile />
              </ProtectedRoute>
            } 
          />
          
          {/* Doctor Patient Management Route */}
          <Route 
            path="/profile/doctor-patients" 
            element={
              <ProtectedRoute allowedRoles={['doctor', 'Doctor']}>
                <DoctorPatients />
              </ProtectedRoute>
            } 
          />
          
          {/* AI Assistant Route */}
          <Route 
            path="/path-ai/patientportal" 
            element={
              <ProtectedRoute allowedRoles={['patient', 'Patient', 'doctor', 'Doctor', 'admin', 'Admin']}>
                <AIAssistant />
              </ProtectedRoute>
            } 
          />
          
          {/* Doctor Appointments Routes */}
          <Route 
            path="/doctor-appointments/userdashboard" 
            element={
              <ProtectedRoute allowedRoles={['patient', 'Patient', 'doctor', 'Doctor', 'admin', 'Admin']}>
                <AppointmentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor-appointments/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['doctor', 'Doctor']}>
                <DoctorSchedule />
              </ProtectedRoute>
            } 
          />
          
          {/* PathAI Escalation Routes */}
          <Route 
            path="/pathai/escalations" 
            element={
              <ProtectedRoute allowedRoles={['doctor', 'Doctor']}>
                <EscalationTickets />
              </ProtectedRoute>
            } 
          />
          
          {/* Existing Protected Routes */}
          <Route 
            path="/home/*" 
            element={
              <ProtectedRoute allowedRoles={['patient', 'Patient']}>
                <PatientPortal />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/doctor-dashboard/*" 
            element={
              <ProtectedRoute allowedRoles={['doctor', 'Doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin-dashboard/*" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Admin Management Routes */}
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'Admin']}>
                <AdminUserManagement />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/appointments" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'Admin']}>
                <AdminAppointments />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/analytics" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'Admin']}>
                <AdminAnalytics />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/system-health" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'Admin']}>
                <AdminSystemHealth />
              </ProtectedRoute>
            } 
          />

          {/* Placeholder routes for future implementation */}
          <Route 
            path="/admin/security" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'Admin']}>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Security Center</h1>
                    <p className="text-gray-600">Coming Soon - Security management features</p>
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/settings" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'Admin']}>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">System Settings</h1>
                    <p className="text-gray-600">Coming Soon - System configuration options</p>
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback Routes */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default AppRouter
