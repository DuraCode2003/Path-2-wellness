const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.json(doctors);
  } catch (error) {
    console.error('Error in getDoctors:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get a single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' }).select('-password');
    
    if (doctor) {
      res.json(doctor);
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    console.error('Error in getDoctorById:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new doctor
// @route   POST /api/doctors
// @access  Admin
const createDoctor = async (req, res) => {
  try {
    const { name, email, password, specialization, phoneNumber, address } = req.body;
    
    const doctorExists = await User.findOne({ email });
    if (doctorExists) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }
    
    const doctor = await User.create({
      name,
      email,
      password: password || `doctor${Date.now()}`, // Generate default password if not provided
      role: 'doctor',
      specialization,
      phoneNumber: phoneNumber || '',
      address: address || '',
      isAvailable: true // Always set to true by default
    });
    
    if (doctor) {
      res.status(201).json({
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        role: doctor.role,
        specialization: doctor.specialization,
        phoneNumber: doctor.phoneNumber,
        address: doctor.address,
        isAvailable: doctor.isAvailable
      });
    } else {
      res.status(400).json({ message: 'Invalid doctor data' });
    }
  } catch (error) {
    console.error('Error in createDoctor:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a doctor
// @route   PUT /api/doctors/:id
// @access  Admin/Doctor
const updateDoctor = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);
    
    if (doctor && doctor.role === 'doctor') {
      doctor.name = req.body.name || doctor.name;
      doctor.email = req.body.email || doctor.email;
      doctor.specialization = req.body.specialization || doctor.specialization;
      doctor.phoneNumber = req.body.phoneNumber || doctor.phoneNumber;
      doctor.address = req.body.address || doctor.address;
      doctor.isAvailable = req.body.isAvailable !== undefined ? req.body.isAvailable : doctor.isAvailable;
      
      if (req.body.password) {
        doctor.password = req.body.password;
      }
      
      const updatedDoctor = await doctor.save();
      
      res.json({
        _id: updatedDoctor._id,
        name: updatedDoctor.name,
        email: updatedDoctor.email,
        role: updatedDoctor.role,
        specialization: updatedDoctor.specialization,
        phoneNumber: updatedDoctor.phoneNumber,
        address: updatedDoctor.address,
        isAvailable: updatedDoctor.isAvailable
      });
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    console.error('Error in updateDoctor:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a doctor
// @route   DELETE /api/doctors/:id
// @access  Admin
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);
    
    if (doctor && doctor.role === 'doctor') {
      await doctor.deleteOne();
      res.json({ message: 'Doctor removed' });
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    console.error('Error in deleteDoctor:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
};
