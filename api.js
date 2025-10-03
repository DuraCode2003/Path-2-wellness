import axios from 'axios';

// Create API base URL
const API_URL = 'http://localhost:5000/api';

// Create instance of axios with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('Making request:', config.method.toUpperCase(), config.url);
    console.log('Request data:', config.data);
    return config;
  },
  (error) => {
    console.error('Request configuration error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('Received response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.message);
    
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
    
    return Promise.reject(error);
  }
);

// API helper functions
const apiService = {
  // Doctors
  getDoctors: () => api.get('/doctors'),
  // Create doctor with the most reliable endpoint
  createDoctor: (doctorData) => api.post('/doctors/create-direct', doctorData),
  updateDoctor: (id, doctorData) => api.put(`/doctors/${id}`, doctorData),
  deleteDoctor: (id) => api.delete(`/doctors/${id}`),
  
  // Appointments
  getPatientAppointments: (patientId) => api.get(`/appointments/patient/${patientId}`),
  createAppointment: (appointmentData) => api.post('/appointments', appointmentData),
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),
  
  // Test connectivity
  testConnection: () => api.get('/test')
};

export default apiService;
