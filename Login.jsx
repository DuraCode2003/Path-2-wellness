import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserMd, FaLock, FaUserShield } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.email || !formData.password || !formData.role) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // In a real app, this would be an API call
      // const response = await axios.post('/api/users/login', {
      //   email: formData.email,
      //   password: formData.password
      // });
      
      // Simulate login
      setTimeout(() => {
        setLoading(false);
        
        // Redirect based on role
        if (formData.role === 'patient') {
          navigate('/');
        } else if (formData.role === 'doctor') {
          navigate('/doctor/dashboard');
        } else if (formData.role === 'admin') {
          navigate('/admin/dashboard');
        }
      }, 1000);
      
    } catch (err) {
      setError('Invalid email or password');
      setLoading(false);
    }
  };
  
  const handleRoleSelection = (role) => {
    setFormData({
      ...formData,
      role
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Doctor Appointment System</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUserMd className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Login As</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelection('patient')}
                className={`py-3 px-4 border rounded-md flex flex-col items-center justify-center ${
                  formData.role === 'patient' 
                    ? 'bg-blue-50 border-blue-500 text-blue-700' 
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                <FaUserMd className="h-6 w-6 mb-1" />
                <span className="text-sm">Patient</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleRoleSelection('doctor')}
                className={`py-3 px-4 border rounded-md flex flex-col items-center justify-center ${
                  formData.role === 'doctor' 
                    ? 'bg-green-50 border-green-500 text-green-700' 
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                <FaUserMd className="h-6 w-6 mb-1" />
                <span className="text-sm">Doctor</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleRoleSelection('admin')}
                className={`py-3 px-4 border rounded-md flex flex-col items-center justify-center ${
                  formData.role === 'admin' 
                    ? 'bg-purple-50 border-purple-500 text-purple-700' 
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                <FaUserShield className="h-6 w-6 mb-1" />
                <span className="text-sm">Admin</span>
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;