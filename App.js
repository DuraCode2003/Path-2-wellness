import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Header from './components/Header';

// Pages
import UserDashboard from './pages/UserDashboard';
import AppointmentForm from './pages/AppointmentForm';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Login from './pages/Login';
import MyAppointments from './pages/MyAppointments';

function App() {
  // Simple auth check - in a real app, use context/state for this
  const isAuthenticated = true;

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {isAuthenticated && <Header />}
        <div className="pt-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route 
              path="/" 
              element={isAuthenticated ? <UserDashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/appointment" 
              element={isAuthenticated ? <AppointmentForm /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin/dashboard" 
              element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/doctor/dashboard" 
              element={isAuthenticated ? <DoctorDashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/my-appointments" 
              element={isAuthenticated ? <MyAppointments /> : <Navigate to="/login" />} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
