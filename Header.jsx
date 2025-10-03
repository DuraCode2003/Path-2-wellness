import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUser, FaUserMd, FaUserShield, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Mock authenticated user - in a real app, this would come from context/state
  const user = {
    name: 'John Doe',
    role: 'admin' // 'patient', 'doctor', or 'admin'
  };
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  const handleLogout = () => {
    // In a real app, implement proper logout functionality
    console.log('Logging out...');
    // navigate to login page or handle logout
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl font-bold">Doctor Appointment</Link>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded hover:bg-blue-700"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {user.role === 'admin' && (
              <>
                <Link to="/admin/dashboard" className={`px-3 py-2 rounded hover:bg-blue-700 ${isActive('/admin/dashboard')}`}>
                  Admin Dashboard
                </Link>
                <Link to="/" className={`px-3 py-2 rounded hover:bg-blue-700 ${isActive('/')}`}>
                  Patient View
                </Link>
              </>
            )}
            
            {user.role === 'doctor' && (
              <Link to="/doctor/dashboard" className={`px-3 py-2 rounded hover:bg-blue-700 ${isActive('/doctor/dashboard')}`}>
                Doctor Dashboard
              </Link>
            )}
            
            {user.role === 'patient' && (
              <>
                <Link to="/" className={`px-3 py-2 rounded hover:bg-blue-700 ${isActive('/')}`}>
                  Home
                </Link>
                <Link to="/my-appointments" className={`px-3 py-2 rounded hover:bg-blue-700 ${isActive('/my-appointments')}`}>
                  My Appointments
                </Link>
                <Link to="/appointment" className={`px-3 py-2 rounded hover:bg-blue-700 ${isActive('/appointment')}`}>
                  Book Appointment
                </Link>
              </>
            )}
            
            {/* Profile dropdown - simplified */}
            <div className="relative group">
              <button className="flex items-center px-3 py-2 rounded hover:bg-blue-700">
                {user.name}
                {user.role === 'admin' && <FaUserShield className="ml-2" />}
                {user.role === 'doctor' && <FaUserMd className="ml-2" />}
                {user.role === 'patient' && <FaUser className="ml-2" />}
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Profile Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FaSignOutAlt className="mr-2" /> Logout
                </button>
              </div>
            </div>
          </nav>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4">
            {user.role === 'admin' && (
              <>
                <Link 
                  to="/admin/dashboard" 
                  className={`block px-3 py-2 rounded hover:bg-blue-700 ${isActive('/admin/dashboard')}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
                <Link 
                  to="/" 
                  className={`block px-3 py-2 rounded hover:bg-blue-700 ${isActive('/')}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Patient View
                </Link>
              </>
            )}
            
            {user.role === 'doctor' && (
              <Link 
                to="/doctor/dashboard" 
                className={`block px-3 py-2 rounded hover:bg-blue-700 ${isActive('/doctor/dashboard')}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Doctor Dashboard
              </Link>
            )}
            
            {user.role === 'patient' && (
              <>
                <Link 
                  to="/" 
                  className={`block px-3 py-2 rounded hover:bg-blue-700 ${isActive('/')}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/my-appointments" 
                  className={`block px-3 py-2 rounded hover:bg-blue-700 ${isActive('/my-appointments')}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Appointments
                </Link>
                <Link 
                  to="/appointment" 
                  className={`block px-3 py-2 rounded hover:bg-blue-700 ${isActive('/appointment')}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Book Appointment
                </Link>
              </>
            )}
            
            <Link 
              to="/profile" 
              className="block px-3 py-2 rounded hover:bg-blue-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile Settings
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center w-full text-left px-3 py-2 rounded hover:bg-blue-700"
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
