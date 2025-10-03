const express = require('express');
const { 
  createAppointment, 
  getAppointments, 
  getMyAppointments, 
  getAppointmentById, 
  updateAppointment,
  deleteAppointment,
  getPatientAppointments
} = require('../controllers/appointmentController');
const Appointment = require('../models/appointmentModel');
const User = require('../models/userModel'); // Assuming you have a User model to check doctor existence
const mongoose = require('mongoose');

const router = express.Router();

// Public route (since patients can create appointments without authentication in this case)
router.post('/', createAppointment);

// Patient appointments route - IMPORTANT: this must come before /:id to prevent route conflicts
router.get('/patient/:id', async (req, res) => {
  try {
    console.log('Route: Fetching appointments for patient ID:', req.params.id);
    const patientId = req.params.id;
    
    // Validate object ID format
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: 'Invalid patient ID format' });
    }
    
    // Find appointments for this patient
    const appointments = await Appointment.find({ patient: patientId })
      .populate({
        path: 'doctor',
        model: 'Doctor',
        select: 'name specialization'
      })
      .sort({ appointmentDate: 1 });
    
    console.log(`Found ${appointments.length} appointments for patient ${patientId}`);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.toString(),
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
});

// Doctor appointments route - IMPORTANT: this must come before /:id to prevent route conflicts
router.get('/doctor/:id', async (req, res) => {
  try {
    const doctorId = req.params.id;
    console.log(`Fetching appointments for doctor: ${doctorId}`);
    
    // Validate objectId
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }
    
    // Check if doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: `Doctor with ID ${doctorId} not found` });
    }
    
    // Find appointments for this doctor
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate('patient', 'name')
      .sort({ appointmentDate: 1 });
    
    console.log(`Found ${appointments.length} appointments for doctor ${doctorId}`);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ message: 'Server Error', error: error.toString() });
  }
});

// Specific appointment routes
router.get('/:id', getAppointmentById);
router.put('/:id', async (req, res) => {
  try {
    console.log('Update appointment request received for ID:', req.params.id);
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Update only allowed fields
    if (req.body.reason) appointment.reason = req.body.reason;
    if (req.body.status) appointment.status = req.body.status;
    if (req.body.doctorNotes) appointment.doctorNotes = req.body.doctorNotes;
    
    const updatedAppointment = await appointment.save();
    
    // Populate related data
    const populatedAppointment = await Appointment.findById(updatedAppointment._id)
      .populate('doctor', 'name specialization')
      .populate('patient', 'name');
    
    res.json(populatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// DELETE an appointment - completely rewritten for better reliability
router.delete('/:id', async (req, res) => {
  try {
    console.log('DELETE request for appointment ID:', req.params.id);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid ObjectId format:', req.params.id);
      return res.status(400).json({ message: 'Invalid appointment ID format' });
    }

    // Try to find the appointment first
    const appointment = await Appointment.findById(req.params.id);
    
    // If appointment doesn't exist, return 404
    if (!appointment) {
      console.log('Appointment not found:', req.params.id);
      return res.status(404).json({ message: 'Appointment not found' });
    }

    console.log('Found appointment to delete:', appointment._id);
    
    // Use the raw MongoDB driver for direct deletion
    // This bypasses Mongoose's middleware which might be causing issues
    const db = mongoose.connection.db;
    const result = await db.collection('appointments').deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) });

    console.log('Raw deletion result:', result);
    
    if (result.deletedCount === 1) {
      console.log('Appointment successfully deleted');
      return res.status(200).json({ 
        success: true,
        message: 'Appointment successfully deleted', 
        appointmentId: req.params.id 
      });
    } else {
      console.log('Appointment not deleted, result:', result);
      return res.status(500).json({ 
        message: 'Failed to delete appointment - no documents affected',
        result: result
      });
    }
  } catch (error) {
    console.error('Error in appointment delete route:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.toString(),
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
});

module.exports = router;