import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSpinner, FaArrowLeft } from 'react-icons/fa';
import apiService from '../utils/api';

const AppointmentForm = () => {
  const navigate = useNavigate();
  
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDoctors, setFetchingDoctors] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    doctor: '',
    appointmentDate: '',
    reason: '',
    patient: '659631b7bace152d00f8b6a0' // Default patient ID - in real app, get from context/auth
  });
  const [queueNumber, setQueueNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setFetchingDoctors(true);
        console.log("Fetching available doctors for appointment form...");
        
        // Use direct fetch for reliability
        const response = await fetch('http://localhost:5000/api/doctors');
        if (!response.ok) throw new Error('Failed to fetch doctors');
        
        const data = await response.json();
        console.log("Doctors fetched successfully:", data);
        
        // Filter to only show available doctors
        const availableDocs = data.filter(doc => doc.isAvailable);
        setDoctors(availableDocs);
        
        setFetchingDoctors(false);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setError('Failed to fetch available doctors. Please try again later.');
        setFetchingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.doctor) {
      setError('Please select a doctor');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      console.log('Submitting appointment with doctor ID:', formData.doctor);
      
      // Use direct fetch approach for more reliable error handling
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Server returned ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Appointment created successfully:', data);
      
      setQueueNumber(data.queueNumber);
      setAppointmentDetails(data);
      setSuccess(true);
      
      // Reset form
      setFormData({
        patientName: '',
        patientAge: '',
        doctor: '',
        appointmentDate: '',
        reason: '',
        patient: '659631b7bace152d00f8b6a0' // Default patient ID
      });
      
      // Redirect back to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/my-appointments');
      }, 3000);
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError(error.message || 'Failed to book appointment. Please try again.');
      setSubmitting(false);
    }
  };

  // Get tomorrow's date as a string in YYYY-MM-DD format for the date input's min attribute
  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Book an Appointment</h1>
          <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800">
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </Link>
        </div>
        
        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-md mb-6">
            <h2 className="text-2xl font-bold mb-4">Appointment Booked Successfully!</h2>
            <p className="mb-4">Your appointment has been scheduled.</p>
            <p className="mb-4">Your queue number is: <span className="font-bold text-xl">{queueNumber}</span></p>
            <p>Redirecting to your appointments...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-6">
                {error}
              </div>
            )}
            
            <div className="mb-6">
              <label htmlFor="patientName" className="block mb-2 text-gray-700 font-medium">Patient Name</label>
              <input
                type="text"
                id="patientName"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="patientAge" className="block mb-2 text-gray-700 font-medium">Patient Age</label>
              <input
                type="number"
                id="patientAge"
                name="patientAge"
                value={formData.patientAge}
                onChange={handleChange}
                min="1"
                max="120"
                className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="doctor" className="block mb-2 text-gray-700 font-medium">Select Doctor</label>
              {fetchingDoctors ? (
                <div className="flex items-center text-gray-500 p-2">
                  <FaSpinner className="animate-spin mr-2" /> Loading available doctors...
                </div>
              ) : (
                <select
                  id="doctor"
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                  required
                >
                  <option value="">Select a doctor</option>
                  {doctors.length > 0 ? (
                    doctors.map(doctor => (
                      <option key={doctor._id} value={doctor._id}>
                        {doctor.name} - {doctor.specialization} {doctor.qualifications ? `(${doctor.qualifications})` : ''}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No doctors available</option>
                  )}
                </select>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="appointmentDate" className="block mb-2 text-gray-700 font-medium">Appointment Date</label>
              <input
                type="date"
                id="appointmentDate"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                min={getTomorrowDateString()}
                className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="reason" className="block mb-2 text-gray-700 font-medium">Reason for Visit</label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                required
              ></textarea>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring focus:ring-gray-300"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || fetchingDoctors || doctors.length === 0}
                className={`px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 flex items-center ${
                  (submitting || fetchingDoctors || doctors.length === 0) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {submitting && <FaSpinner className="animate-spin mr-2" />}
                {submitting ? 'Booking...' : 'Book Appointment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AppointmentForm;