const mongoose = require('mongoose');
const User = require('../models/User');
const EscalationTicket = require('../models/EscalationTicket');
require('dotenv').config();

const initDatabase = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/path2wellness', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('👤 Admin user already exists:', existingAdmin.email);
      return existingAdmin;
    }

    // Create admin user
    console.log('👑 Creating admin user...');
    const adminUser = await User.create({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@path2wellness.com',
      password: 'Admin123!@#',
      role: 'admin',
      phone: '+1-555-0100',
      isEmailVerified: true,
      isActive: true,
      permissions: [
        'view_dashboard',
        'manage_patients', 
        'manage_doctors',
        'manage_tickets',
        'view_reports',
        'manage_content'
      ]
    });

    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@path2wellness.com');
    console.log('🔑 Password: Admin123!@#');

    // Create sample doctor user
    console.log('👨‍⚕️ Creating sample doctor user...');
    const doctorUser = await User.create({
      firstName: 'Dr. Sarah',
      lastName: 'Johnson',
      email: 'doctor@path2wellness.com',
      password: 'Doctor123!@#',
      role: 'doctor',
      phone: '+1-555-0200',
      specialization: 'General Medicine',
      qualifications: [
        {
          degree: 'MD',
          institution: 'Harvard Medical School',
          year: 2015
        }
      ],
      biography: 'Experienced general practitioner with focus on preventive care and patient education.',
      isEmailVerified: true,
      isActive: true,
      permissions: ['view_dashboard', 'manage_patients', 'manage_tickets'],
      createdBy: adminUser._id
    });

    console.log('✅ Doctor user created successfully');
    console.log('📧 Email: doctor@path2wellness.com');
    console.log('🔑 Password: Doctor123!@#');

    // Create sample patient user
    console.log('👤 Creating sample patient user...');
    const patientUser = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'patient@path2wellness.com',
      password: 'Patient123!@#',
      role: 'patient',
      phone: '+1-555-0300',
      dateOfBirth: new Date('1985-06-15'),
      bloodGroup: 'O+',
      allergies: ['Penicillin'],
      medicalConditions: ['Hypertension'],
      isEmailVerified: true,
      isActive: true,
      createdBy: adminUser._id
    });

    console.log('✅ Patient user created successfully');
    console.log('📧 Email: patient@path2wellness.com');
    console.log('🔑 Password: Patient123!@#');

    // Create database indexes
    console.log('📊 Creating database indexes...');
    await User.createIndexes();
    await EscalationTicket.createIndexes();
    console.log('✅ Database indexes created');

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`👑 Admin: admin@path2wellness.com / Admin123!@#`);
    console.log(`👨‍⚕️ Doctor: doctor@path2wellness.com / Doctor123!@#`);
    console.log(`👤 Patient: patient@path2wellness.com / Patient123!@#`);

    return { adminUser, doctorUser, patientUser };

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('✅ Database initialization script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database initialization script failed:', error);
      process.exit(1);
    });
}

module.exports = initDatabase;
