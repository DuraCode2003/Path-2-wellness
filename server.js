const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Define PORT early, before it's used
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow frontend requests
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Special public doctor creation endpoint directly in server.js (no middleware)
app.post('/api/doctors/create-direct', async (req, res) => {
  console.log('Direct doctor creation endpoint accessed');
  console.log('Request body:', req.body);
  
  try {
    // Use the Doctor model directly
    const Doctor = require('./models/doctorModel');
    const { name, email, password, specialization, phoneNumber, address } = req.body;
    
    // Check if user exists
    const userExists = await Doctor.findOne({ email: req.body.email });
    if (userExists) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }
    
    // Create doctor with explicit isAvailable flag
    const doctorData = {
      name,
      email,
      password: password || `doctor${Date.now().toString().slice(-6)}`,
      role: 'doctor',
      specialization,
      phoneNumber: phoneNumber || '',
      address: address || '',
      isAvailable: true // Explicitly set to true
    };
    
    console.log('Creating doctor with data:', doctorData);
    const doctor = await Doctor.create(doctorData);
    
    console.log('Doctor created successfully with availability:', doctor.isAvailable);
    
    res.status(201).json({
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      role: doctor.role,
      specialization: doctor.specialization,
      phoneNumber: doctor.phoneNumber,
      address: doctor.address,
      isAvailable: doctor.isAvailable // Confirm availability in response
    });
  } catch (error) {
    console.error('Error in direct doctor creation:', error);
    res.status(500).json({ 
      message: 'Server error creating doctor: ' + error.message
    });
  }
});

// Routes
app.get('/', (req, res) => {
  res.send('Doctor Appointment API is running...');
});

// Import routes
const userRoutes = require('./routes/userRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

// Special debugging route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// DIRECT appointment deletion endpoint to bypass any middleware issues
app.delete('/api/direct-delete-appointment/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log('Direct appointment deletion endpoint called for ID:', id);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid appointment ID format' });
    }
    
    // Use the MongoDB driver directly
    const db = mongoose.connection.db;
    console.log('Connected to database, attempting direct deletion');
    
    // Check if appointment exists first
    const appointment = await db.collection('appointments').findOne({ 
      _id: new mongoose.Types.ObjectId(id) 
    });
    
    if (!appointment) {
      console.log('Appointment not found in direct-delete endpoint');
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    console.log('Appointment found, proceeding with deletion:', appointment._id);
    
    // Delete directly from the collection
    const result = await db.collection('appointments').deleteOne({ 
      _id: new mongoose.Types.ObjectId(id) 
    });
    
    console.log('Direct deletion result:', result);
    
    if (result.deletedCount === 1) {
      return res.status(200).json({ 
        success: true, 
        message: 'Appointment successfully deleted', 
        id 
      });
    } else {
      return res.status(500).json({
        message: 'Failed to delete appointment',
        result
      });
    }
  } catch (error) {
    console.error('Error in direct appointment deletion:', error);
    res.status(500).json({
      message: 'Server error during direct deletion',
      error: error.toString()
    });
  }
});

// Register routes
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

// Direct doctor routes to ensure they work
app.get('/api/doctors-fallback', async (req, res) => {
  try {
    const Doctor = require('./models/doctorModel');
    const doctors = await Doctor.find({ role: 'doctor' }).select('-password');
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add additional error logging
app.use((req, res, next) => {
  const oldSend = res.send;
  res.send = function(data) {
    if (res.statusCode >= 400) {
      console.log(`Response error ${res.statusCode} for ${req.method} ${req.path}:`, data);
    }
    return oldSend.apply(res, arguments);
  };
  next();
});

// Add special patient appointments route for debugging
app.get('/api/direct-patient-appointments/:id', async (req, res) => {
  try {
    const patientId = req.params.id;
    console.log('Direct patient appointments route called for:', patientId);
    
    const Appointment = require('./models/appointmentModel');
    
    // Find appointments with simple query
    const appointments = await Appointment.find({ patient: patientId });
    
    console.log(`Found ${appointments.length} appointments for patient ${patientId}`);
    res.json(appointments);
  } catch (error) {
    console.error('Error in direct patient appointments route:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.toString(),
      stack: error.stack
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Connect to database FIRST before starting server
connectDB()
  .then(() => {
    // Start the server after successful DB connection
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });