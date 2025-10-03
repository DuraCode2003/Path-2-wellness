const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs').promises;
const logger = require('./logger');

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  }
});

// Verify connection configuration
transporter.verify(function(error, success) {
  if (error) {
    logger.error('SMTP connection error:', error);
  } else {
    logger.info('SMTP server is ready to take our messages');
  }
});

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text email body
 * @param {string} options.html - HTML email body
 * @param {Array} [options.attachments] - Array of attachment objects
 * @returns {Promise} Promise that resolves when email is sent
 */
const sendEmail = async ({
  email,
  subject,
  text = '',
  html = '',
  attachments = []
}) => {
  try {
    if (!email) {
      throw new Error('Recipient email is required');
    }

    if (!subject) {
      throw new Error('Email subject is required');
    }

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Path2Wellness'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER}>`,
      to: email,
      subject,
      text,
      html,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    
    logger.info(`Email sent to ${email}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send an email using an EJS template
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.template - Name of the EJS template file (without extension)
 * @param {Object} options.templateData - Data to pass to the EJS template
 * @param {Array} [options.attachments] - Array of attachment objects
 * @returns {Promise} Promise that resolves when email is sent
 */
const sendTemplatedEmail = async ({
  email,
  subject,
  template,
  templateData = {},
  attachments = []
}) => {
  try {
    if (!template) {
      throw new Error('Email template is required');
    }

    // Set default template data
    const defaults = {
      appName: process.env.APP_NAME || 'Path2Wellness',
      appUrl: process.env.CLIENT_URL || 'http://localhost:3000',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@path2wellness.com',
      currentYear: new Date().getFullYear()
    };

    // Merge defaults with provided template data
    const data = { ...defaults, ...templateData };

    // Get the template file
    const templatePath = path.join(
      __dirname,
      '..',
      'views',
      'emails',
      `${template}.ejs`
    );

    // Read the template file
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    
    // Render the template with the provided data
    const html = ejs.render(templateContent, data);

    // Generate plain text version by stripping HTML tags
    const text = html
      .replace(/<[^>]*>?/gm, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Send the email
    return sendEmail({
      email,
      subject,
      text,
      html,
      attachments
    });
  } catch (error) {
    logger.error('Error sending templated email:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendTemplatedEmail,
  transporter
};
