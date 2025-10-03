const express = require('express');
const router = express.Router();
const { 
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
} = require('../controllers/doctorController');
const Doctor = require('../models/doctorModel'); // Update to use doctorModel
const mongoose = require('mongoose');

// Simple logger
router.use((req, res, next) => {
  console.log(`Doctor route accessed: ${req.method} ${req.path}`);
  next();
});

// GET all doctors
router.get('/', getDoctors);

// GET available doctors
router.get('/available', async (req, res) => {
  try {
    const doctors = await Doctor.find({ 
      role: 'doctor',
      isAvailable: true 
    }).select('-password');
    
    res.json(doctors);
  } catch (error) {
    console.error('Error in getAvailableDoctors:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET a single doctor by ID
router.get('/:id', getDoctorById);

// POST create a new doctor
router.post('/', createDoctor);

// PUT update a doctor
router.put('/:id', updateDoctor);

// DELETE a doctor
router.delete('/:id', deleteDoctor);

module.exports = router;