import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarPlus, FaUserMd, FaCalendarCheck, FaSpinner, FaSearch } from 'react-icons/fa';

const UserDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/doctors');
        
        if (!response.ok) {
          throw new Error('Failed to fetch doctors');
        }
        
        const data = await response.json();
        
        // Filter to only show available doctors
        const availableDoctors = data.filter(doctor => doctor.isAvailable);
        setDoctors(availableDoctors);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Failed to fetch available doctors');
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);
  
  // Filter doctors based on search term
  useEffect(() => {
    if (!doctors.length) {
      setFilteredDoctors([]);
      return;
    }
    
    if (!searchTerm.trim()) {
      // If no search term, show all available doctors
      setFilteredDoctors(doctors);
      return;
    }
    
    // Filter doctors by name or specialization
    const lowercasedSearch = searchTerm.toLowerCase().trim();
    const filtered = doctors.filter(doctor => 
      (doctor.name && doctor.name.toLowerCase().includes(lowercasedSearch)) || 
      (doctor.specialization && doctor.specialization.toLowerCase().includes(lowercasedSearch))
    );
    
    setFilteredDoctors(filtered);
  }, [searchTerm, doctors]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="bg-white shadow-md rounded-lg mb-8 p-6">
        <h1 className="text-3xl font-bold text-gray-800">Patient Dashboard</h1>
        <p className="text-gray-600">Welcome to your healthcare portal</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content area */}
        <div className="md:col-span-2">
         

          <div className="mt-6 bg-white shadow-md rounded-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 md:mb-0">Available Doctors</h2>
              
              {/* Search box */}
              <div className="w-full md:w-64 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="pl-10 w-full p-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                  placeholder="Search doctors..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            
            <div className="border-b pb-4 mb-4">
              <p className="text-gray-700">Here are some of our specialists available for appointments.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <FaSpinner className="animate-spin text-blue-500 mr-2" />
                <span className="text-gray-600">Loading doctors...</span>
              </div>
            ) : filteredDoctors.length > 0 ? (
              <div className="space-y-4">
                {filteredDoctors.map(doctor => (
                  <div key={doctor._id} className="flex items-center p-4 border rounded-md">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <FaUserMd className="text-blue-500 text-xl" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium">{doctor.name}</h3>
                      <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    </div>
                    <div>
                      <Link 
                        to={`/appointment?doctorId=${doctor._id}`}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        Book Appointment
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="text-center py-6">
                <p className="text-gray-600">No doctors found matching "{searchTerm}"</p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-blue-500 hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600">No doctors are currently available.</p>
                <Link to="/appointment" className="mt-2 inline-block text-blue-600 hover:underline">
                  Check back later or request an appointment
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Quick Actions</h2>
            <div className="space-y-4">
              <Link 
                to="/appointment" 
                className="flex items-center p-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              >
                <FaCalendarPlus className="mr-3 text-xl" />
                <span className="font-medium">Book Appointment</span>
              </Link>
              
              <Link 
                to="/my-appointments" 
                className="flex items-center p-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
              >
                <FaCalendarCheck className="mr-3 text-xl" />
                <span className="font-medium">My Appointments</span>
              </Link>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Health Tips</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Stay hydrated by drinking at least 8 glasses of water daily</li>
              <li>Aim for 30 minutes of physical activity each day</li>
              <li>Eat a balanced diet rich in fruits and vegetables</li>
              <li>Get 7-9 hours of quality sleep each night</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;