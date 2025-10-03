const Appointment = require('../models/appointmentModel');
// Fix the missing User reference by using the Doctor model (which is our User model now)
const Doctor = require('../models/doctorModel');

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Public
const createAppointment = async (req, res) => {
  try {
    const { doctor, patient, patientName, patientAge, appointmentDate, reason } = req.body;
    
    // Check if doctor exists - fixed by using Doctor model instead of User
    const doctorUser = await Doctor.findById(doctor);
    if (!doctorUser) {
      return res.status(400).json({ message: 'Doctor not found' });
    }
    
    // Generate queue number
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const appointmentsToday = await Appointment.countDocuments({
      createdAt: {
        $gte: new Date(todayStr),
        $lt: new Date(new Date(todayStr).getTime() + 24 * 60 * 60 * 1000)
      }
    });
    const queueNumber = `Q${today.getFullYear()}${(today.getMonth()+1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}-${(appointmentsToday + 1).toString().padStart(3, '0')}`;
    
    // Create appointment with patient reference (could be null/undefined)
    const appointment = new Appointment({
      doctor,
      patient: patient || '659631b7bace152d00f8b6a0', // Use a default ID if not provided
      patientName: patientName || 'Patient',
      patientAge: patientAge || 30,
      queueNumber,
      appointmentDate,
      reason,
      status: 'pending'
    });

    const savedAppointment = await appointment.save();
    
    res.status(201).json(savedAppointment);
  } catch (error) {
    console.error('Appointment creation error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Public (was Private/Admin)
const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate('doctor', 'name email')
      .populate('patient', 'name email');
    
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user appointments
// @route   GET /api/appointments/myappointments
// @access  Private
const getMyAppointments = async (req, res) => {
  try {
    let appointments;
    
    if (req.user.role === 'doctor') {
      appointments = await Appointment.find({ doctor: req.user._id })
        .populate('patient', 'name email');
    } else {
      appointments = await Appointment.find({ patient: req.user._id })
        .populate('doctor', 'name email');
    }
    
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Public (was Private)
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'name email')
      .populate('patient', 'name email');
    
    if (appointment) {
      res.json(appointment);
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Public (was Private/Doctor or Admin)
const updateAppointment = async (req, res) => {
  try {
    console.log('Updating appointment ID:', req.params.id);
    console.log('Update data:', req.body);
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Update fields from request body
    if (req.body.status) appointment.status = req.body.status;
    if (req.body.reason) appointment.reason = req.body.reason;
    if (req.body.doctorNotes) appointment.doctorNotes = req.body.doctorNotes;
    if (req.body.appointmentDate) appointment.appointmentDate = req.body.appointmentDate;
    
    // Don't allow changing doctor or patient through this endpoint
    // This prevents potential reference errors
    
    console.log('Saving updated appointment...');
    const updatedAppointment = await appointment.save();
    
    // Populate doctor and patient data for the response
    const populatedAppointment = await Appointment.findById(updatedAppointment._id)
      .populate('doctor', 'name specialization')
      .populate('patient', 'name');
      
    console.log('Appointment updated successfully');
    res.json(populatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ 
      message: 'Server error updating appointment', 
      error: error.message 
    });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Public (temporarily until auth is implemented properly)
const deleteAppointment = async (req, res) => {
  try {
    console.log('Delete request for appointment ID:', req.params.id);
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      console.log('Appointment not found');
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Remove authentication check temporarily
    // In a production app, you would keep the authentication check
    
    console.log('Deleting appointment...');
    await appointment.deleteOne();
    console.log('Appointment successfully deleted');
    
    res.json({ 
      message: 'Appointment removed successfully', 
      appointmentId: req.params.id
    });
  } catch (error) {
    console.error('Error in deleteAppointment:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message
    });
  }
};

// @desc    Get patient appointments
// @route   GET /api/appointments/patient/:id
// @access  Public (was Private)
const getPatientAppointments = async (req, res) => {
  try {
    console.log('Fetching appointments for patient:', req.params.id);
    const patientId = req.params.id;
    
    // Find appointments with this patient ID
    const appointments = await Appointment.find({ patient: patientId })
      .populate('doctor', 'name specialization')
      .sort({ appointmentDate: 1 });
    
    console.log(`Found ${appointments.length} appointments for patient ${patientId}`);
    res.json(appointments);
  } catch (error) {
    console.error('Error in getPatientAppointments:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getMyAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getPatientAppointments
};