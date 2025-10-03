import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowRight, Heart, Shield, Users, Stethoscope } from 'lucide-react'

const Homepage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user, getRedirectPath } = useAuth()

  const handleGetStarted = () => {
    if (isAuthenticated()) {
      // If user is already logged in, redirect to their appropriate dashboard
      const redirectPath = getRedirectPath(user?.role)
      navigate(redirectPath)
    } else {
      // Navigate to profile management login using folder-based routing
      navigate('/profile-management')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-indigo-600" />
              <span className="text-2xl font-bold text-gray-900">Path2Wellness</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#about" className="text-gray-600 hover:text-indigo-600 transition-colors">About</a>
              <a href="#contact" className="text-gray-600 hover:text-indigo-600 transition-colors">Contact</a>
            </nav>
            <button
              onClick={handleGetStarted}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <span>{isAuthenticated() ? 'Dashboard' : 'Get Started'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Health,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Our Priority
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Comprehensive healthcare management system connecting patients, doctors, and administrators 
            in a seamless digital experience powered by AI.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-3 mx-auto"
          >
            <span>{isAuthenticated() ? `Go to ${user?.role} Dashboard` : 'Get Started Today'}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Complete Healthcare Ecosystem
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need for modern healthcare management
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Patient Portal</h3>
              <p className="text-gray-600">
                Secure patient portal for managing appointments, medical records, and communication with healthcare providers.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Stethoscope className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Doctor Dashboard</h3>
              <p className="text-gray-600">
                Comprehensive dashboard for healthcare providers to manage patients, appointments, and medical workflows.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Admin Control</h3>
              <p className="text-gray-600">
                Advanced administrative tools for managing the entire healthcare system and user permissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Healthcare?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of healthcare professionals already using Path2Wellness
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-3 mx-auto"
          >
            <span>Start Your Journey</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Heart className="h-6 w-6 text-indigo-400" />
              <span className="text-xl font-bold">Path2Wellness</span>
            </div>
            <p className="text-gray-400">
              © 2024 Path2Wellness. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Homepage
