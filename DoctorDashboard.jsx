import React, { useState, useEffect } from 'react';
import { FaUserAlt, FaCalendarAlt, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import apiService from '../utils/api';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');
  
  // Get doctorId from query param or use default
  // In a real app, you would get this from auth context
  const [doctorId, setDoctorId] = useState('');
  
  // Add state for all doctors
  const [allDoctors, setAllDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  
  // Dashboard stats
  const [stats, setStats] = useState({
    name: 'Loading...',
    specialization: 'Loading...',
    appointmentsToday: 0,
    pendingAppointments: 0,
    totalAppointments: 0
  });

  useEffect(() => {
    // Fetch all doctors first
    const fetchAllDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const response = await fetch('http://localhost:5000/api/doctors');
        if (!response.ok) throw new Error('Failed to fetch doctors list');
        
        const doctors = await response.json();
        setAllDoctors(doctors);
        
        if (doctors && doctors.length > 0) {
          console.log('Using first doctor from list:', doctors[0]._id);
          setDoctorId(doctors[0]._id);
          return doctors[0]._id;
        }
        return null;
      } catch (err) {
        console.error('Error getting doctors:', err);
        setError('Failed to find any doctors. Please add doctors first.');
        return null;
      } finally {
        setLoadingDoctors(false);
      }
    };
    
    fetchAllDoctors();
  }, []);

  // Use another effect to fetch the doctor profile and appointments when doctorId changes
  useEffect(() => {
    if (doctorId) {
      fetchDoctorProfile(doctorId);
      fetchAppointments(doctorId);
    }
  }, [doctorId]);

  const fetchDoctorProfile = async (id) => {
    if (!id) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/doctors/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Doctor not found. The ID may be incorrect.');
        } else {
          throw new Error(`Server returned ${response.status}`);
        }
      }
      
      const doctorData = await response.json();
      console.log('Doctor profile fetched:', doctorData);
      
      setStats(prev => ({
        ...prev,
        name: `Dr. ${doctorData.name}`,
        specialization: doctorData.specialization || 'Specialist'
      }));
    } catch (err) {
      console.error('Error fetching doctor profile:', err);
      setError(`Failed to load doctor profile: ${err.message}`);
    }
  };

  const fetchAppointments = async (id) => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Use the direct appointments endpoint with the correct doctorId
      const response = await fetch(`http://localhost:5000/api/appointments/doctor/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // No appointments found - not an error
          setAppointments([]);
          setLoading(false);
          return;
        }
        
        // Try to get error details
        const errorText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
      
      const appointmentsData = await response.json();
      console.log('Appointments fetched:', appointmentsData);
      
      setAppointments(appointmentsData);
      
      // Calculate dashboard stats
      const today = new Date().toDateString();
      const appointmentsToday = appointmentsData.filter(app => 
        new Date(app.appointmentDate).toDateString() === today
      ).length;
      
      const pendingAppointments = appointmentsData.filter(app => 
        app.status === 'pending'
      ).length;
      
      setStats(prev => ({
        ...prev,
        appointmentsToday,
        pendingAppointments,
        totalAppointments: appointmentsData.length
      }));
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(`Failed to fetch appointments: ${err.message}`);
      setLoading(false);
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setNotes(appointment.doctorNotes || '');
    setStatusUpdate(appointment.status);
    setIsModalOpen(true);
  };

  const handleUpdateAppointment = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${selectedAppointment._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: statusUpdate,
          doctorNotes: notes
        })
      });
      
      if (!response.ok) throw new Error('Failed to update appointment');
      
      const updatedAppointment = await response.json();
      
      // Update the appointments list with the updated appointment
      setAppointments(
        appointments.map(appt => 
          appt._id === selectedAppointment._id 
            ? { ...appt, status: statusUpdate, doctorNotes: notes } 
            : appt
        )
      );
      
      setIsModalOpen(false);
      setSelectedAppointment(null);
      
      // Refresh appointments to update stats
      fetchAppointments(doctorId);
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError('Failed to update appointment');
    }
  };

  const handleDoctorChange = (e) => {
    const newDoctorId = e.target.value;
    setDoctorId(newDoctorId);
  };

  const formatDate = (dateString) => {
    const options = { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Pending</span>;
      case 'confirmed':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">Confirmed</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Completed</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Cancelled</span>;
      case 'no-show':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">No-show</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Doctor Dashboard</h1>
          
          {/* Doctor selection dropdown */}
          <div className="w-full md:w-64">
            <label htmlFor="doctorSelect" className="block text-sm font-medium text-gray-700 mb-1">
              Select Doctor
            </label>
            {loadingDoctors ? (
              <div className="flex items-center text-gray-500 p-2 border rounded">
                <FaSpinner className="animate-spin mr-2" /> Loading doctors...
              </div>
            ) : (
              <select
                id="doctorSelect"
                value={doctorId}
                onChange={handleDoctorChange}
                className="w-full p-2 border rounded focus:ring focus:ring-blue-300 focus:outline-none"
                disabled={loadingDoctors}
              >
                {allDoctors.length > 0 ? (
                  allDoctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))
                ) : (
                  <option value="">No doctors available</option>
                )}
              </select>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-blue-800">{stats.name}</h3>
                <p className="text-sm text-gray-600">{stats.specialization}</p>
              </div>
              <FaUserAlt className="text-blue-500 text-2xl" />
            </div>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-green-800">{stats.appointmentsToday}</h3>
                <p className="text-sm text-gray-600">Today's Appointments</p>
              </div>
              <FaCalendarAlt className="text-green-500 text-2xl" />
            </div>
          </div>
          
          <div className="bg-yellow-50 p-6 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-yellow-800">{stats.pendingAppointments}</h3>
                <p className="text-sm text-gray-600">Pending Requests</p>
              </div>
              <FaSpinner className="text-yellow-500 text-2xl" />
            </div>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-purple-800">{stats.totalAppointments}</h3>
                <p className="text-sm text-gray-600">Total Appointments</p>
              </div>
              <FaCalendarAlt className="text-purple-500 text-2xl" />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Appointments</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-8">
              <FaSpinner className="animate-spin text-blue-500 text-3xl mx-auto mb-4" />
              <p className="text-gray-600">Loading appointments...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left">Queue #</th>
                    <th className="p-3 text-left">Patient</th>
                    <th className="p-3 text-left">Date & Time</th>
                    <th className="p-3 text-left">Reason</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length > 0 ? (
                    appointments.map(appointment => (
                      <tr key={appointment._id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{appointment.queueNumber}</td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{appointment.patientName}</div>
                            <div className="text-sm text-gray-500">Age: {appointment.patientAge}</div>
                          </div>
                        </td>
                        <td className="p-3">{formatDate(appointment.appointmentDate)}</td>
                        <td className="p-3">{appointment.reason}</td>
                        <td className="p-3">{getStatusBadge(appointment.status)}</td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => handleViewDetails(appointment)}
                            className="px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-3 text-center text-gray-500">No appointments found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Appointment Details */}
      {isModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              Appointment Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Patient Information</h3>
                <p className="mb-2"><span className="font-medium">Name:</span> {selectedAppointment.patientName}</p>
                <p className="mb-2"><span className="font-medium">Age:</span> {selectedAppointment.patientAge}</p>
                <p className="mb-2"><span className="font-medium">Queue Number:</span> {selectedAppointment.queueNumber}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Appointment Information</h3>
                <p className="mb-2"><span className="font-medium">Date & Time:</span> {formatDate(selectedAppointment.appointmentDate)}</p>
                <p className="mb-2"><span className="font-medium">Booked On:</span> {formatDate(selectedAppointment.createdAt)}</p>
                <p className="mb-2"><span className="font-medium">Current Status:</span> {getStatusBadge(selectedAppointment.status)}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Reason for Visit</h3>
              <p className="p-4 bg-gray-50 rounded-md">{selectedAppointment.reason}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Update Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button 
                  onClick={() => setStatusUpdate('confirmed')}
                  className={`p-2 rounded-md flex items-center justify-center ${statusUpdate === 'confirmed' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800'}`}
                >
                  <FaCheck className="mr-1" /> Confirm
                </button>
                <button 
                  onClick={() => setStatusUpdate('completed')}
                  className={`p-2 rounded-md flex items-center justify-center ${statusUpdate === 'completed' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800'}`}
                >
                  <FaCheck className="mr-1" /> Complete
                </button>
                <button 
                  onClick={() => setStatusUpdate('cancelled')}
                  className={`p-2 rounded-md flex items-center justify-center ${statusUpdate === 'cancelled' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800'}`}
                >
                  <FaTimes className="mr-1" /> Cancel
                </button>
                <button 
                  onClick={() => setStatusUpdate('no-show')}
                  className={`p-2 rounded-md flex items-center justify-center ${statusUpdate === 'no-show' ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                >
                  <FaTimes className="mr-1" /> No-show
                </button>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Doctor's Notes</h3>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 border rounded-md"
                rows="4"
                placeholder="Enter your medical notes here..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateAppointment}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Update Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;