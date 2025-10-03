import React, { useState, useEffect } from 'react';
import { FaUserMd, FaEdit, FaTrash, FaPlus, FaSpinner } from 'react-icons/fa';
import apiService from '../utils/api';

const AdminDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // For adding/editing doctors
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    phoneNumber: '',
    address: '',
    isAvailable: true,  // Explicitly set default availability to true
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentDoctorId, setCurrentDoctorId] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  // Mock data for specializations
  const specializations = [
    'Cardiology', 
    'Dermatology', 
    'Neurology', 
    'Pediatrics', 
    'Orthopedics',
    'Ophthalmology',
    'Psychiatry',
    'General Medicine'
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      // Use direct fetch instead of axios for maximum compatibility
      const response = await fetch('http://localhost:5000/api/doctors');
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      const data = await response.json();
      setDoctors(data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to fetch doctors. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = () => {
    resetForm();
    setIsEditing(false);
    setIsModalOpen(true);
    setFormError('');
  };

  const handleEditDoctor = (doctor) => {
    setFormData({
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization,
      phoneNumber: doctor.phoneNumber || '',
      address: doctor.address || '',
      isAvailable: doctor.isAvailable, // Include availability in edit
    });
    setCurrentDoctorId(doctor._id);
    setIsEditing(true);
    setIsModalOpen(true);
    setFormError('');
  };

  const handleDeleteDoctor = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        setLoading(true);
        await apiService.deleteDoctor(id);
        setDoctors(doctors.filter(doctor => doctor._id !== id));
        setSuccessMessage(`Doctor ${name} has been successfully removed`);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
        setLoading(false);
      } catch (err) {
        console.error('Error deleting doctor:', err);
        setError(`Failed to delete doctor: ${err.response?.data?.message || 'Unknown error'}`);
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Add a method to test API connectivity
  const testApiConnection = async () => {
    try {
      const response = await apiService.testApi();
      console.log('API connection test successful:', response.data);
      return true;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.specialization) {
      setFormError('Please fill in all required fields');
      return;
    }
    
    setFormSubmitting(true);
    setFormError('');
    
    try {
      console.log('Submitting doctor data:', formData);
      
      if (isEditing) {
        // Update existing doctor using fetch for maximum compatibility
        const response = await fetch(`http://localhost:5000/api/doctors/${currentDoctorId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }
        
        const data = await response.json();
        setDoctors(doctors.map(doctor => doctor._id === currentDoctorId ? data : doctor));
        setSuccessMessage(`Doctor ${data.name} has been successfully updated`);
      } else {
        // Add isAvailable flag explicitly for new doctors
        const doctorData = {
          ...formData,
          isAvailable: true,
          password: 'defaultpassword123' // Set default password server will handle this
        };
        
        // Create new doctor directly
        const response = await fetch('http://localhost:5000/api/doctors/create-direct', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(doctorData)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server responded with status ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        setDoctors([...doctors, data]);
        setSuccessMessage(`Doctor ${data.name} has been successfully added`);
      }
      
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} doctor:`, err);
      setFormError(err.message || `Failed to ${isEditing ? 'update' : 'add'} doctor. Please check server logs.`);
    } finally {
      setFormSubmitting(false);
      // Refresh the doctor list
      fetchDoctors();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      specialization: '',
      phoneNumber: '',
      address: '',
      isAvailable: true,  // Explicitly set default availability to true
    });
    setCurrentDoctorId(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <button 
            onClick={handleAddDoctor}
            className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-600 transition"
          >
            <FaPlus className="mr-2" /> Add Doctor
          </button>
        </div>
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Manage Doctors</h2>
          
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-md mb-6 flex justify-between items-center">
              {successMessage}
              <button 
                onClick={() => setSuccessMessage('')}
                className="text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-6 flex justify-between items-center">
              {error}
              <button 
                onClick={() => setError('')}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-8">
              <FaSpinner className="animate-spin text-blue-500 text-3xl mx-auto mb-4" />
              <p className="text-gray-600">Loading doctors...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {doctors.length > 0 ? (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Specialization</th>
                      <th className="p-3 text-left">Phone</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map(doctor => (
                      <tr key={doctor._id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                              <FaUserMd className="text-blue-500" />
                            </div>
                            {doctor.name}
                          </div>
                        </td>
                        <td className="p-3">{doctor.email}</td>
                        <td className="p-3">{doctor.specialization}</td>
                        <td className="p-3">{doctor.phoneNumber || 'N/A'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            doctor.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {doctor.isAvailable ? 'Available' : 'Not Available'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => handleEditDoctor(doctor)}
                            className="text-blue-500 hover:text-blue-700 mr-3"
                            aria-label="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => handleDeleteDoctor(doctor._id, doctor.name)}
                            className="text-red-500 hover:text-red-700"
                            aria-label="Delete"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-md">
                  <FaUserMd className="text-gray-300 text-5xl mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No doctors found</p>
                  <button 
                    onClick={handleAddDoctor}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                  >
                    Add Your First Doctor
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Adding/Editing Doctor */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {isEditing ? 'Edit Doctor' : 'Add New Doctor'}
            </h2>
            
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-6">
                {formError}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              {/* Remove password field completely */}
              
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Specialization <span className="text-red-500">*</span>
                </label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Specialization</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 font-medium">Phone Number</label>
                <input 
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div className="mb-6">
                <label className="block mb-1 font-medium">Address</label>
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  rows="2"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center ${
                    formSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={formSubmitting}
                >
                  {formSubmitting && <FaSpinner className="animate-spin mr-2" />}
                  {isEditing ? 'Update' : 'Add'} Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;