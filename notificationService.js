const nodemailer = require('nodemailer');
const User = require('../models/User');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

/**
 * Send a notification to a user
 * @param {Object} options - Notification options
 * @param {String} options.userId - ID of the user to notify
 * @param {String} options.title - Notification title
 * @param {String} options.message - Notification message
 * @param {String} options.type - Notification type (e.g., 'ticket_assigned', 'ticket_message')
 * @param {String} options.referenceId - ID of the related document (e.g., ticket ID)
 * @param {String} options.channel - Preferred channel ('email', 'in_app', 'sms', 'all')
 * @returns {Promise<Object>} Result of the notification sending
 */
async function sendNotification({
  userId,
  title,
  message,
  type = 'general',
  referenceId = null,
  channel = 'in_app',
  priority = 'normal'
}) {
  try {
    const user = await User.findById(userId).select('email firstName notificationPreferences');
    
    if (!user) {
      logger.warn(`User ${userId} not found for notification`);
      return { success: false, message: 'User not found' };
    }

    // Create notification record
    const notification = new Notification({
      user: userId,
      title,
      message,
      type,
      referenceId,
      channel,
      priority,
      status: 'pending'
    });

    // Send notification based on user preferences and channel
    const sendPromises = [];
    const userChannels = channel === 'all' 
      ? (user.notificationPreferences?.channels || ['in_app']) 
      : [channel];

    for (const ch of userChannels) {
      switch (ch) {
        case 'email':
          sendPromises.push(sendEmailNotification(user, notification));
          break;
        case 'sms':
          sendPromises.push(sendSmsNotification(user, notification));
          break;
        case 'push':
          sendPromises.push(sendPushNotification(user, notification));
          break;
        case 'in_app':
        default:
          // For in-app notifications, we just need to save them
          notification.status = 'delivered';
          break;
      }
    }

    // Wait for all notifications to be sent
    const results = await Promise.allSettled(sendPromises);
    
    // Update notification status based on results
    const hasFailures = results.some(result => result.status === 'rejected');
    notification.status = hasFailures ? 'failed' : 'delivered';
    
    await notification.save();
    
    return {
      success: !hasFailures,
      notificationId: notification._id,
      results: results.map(r => r.status === 'fulfilled' ? r.value : r.reason)
    };
  } catch (error) {
    logger.error(`Error sending notification: ${error.message}`, { error });
    return { success: false, message: error.message };
  }
}

/**
 * Send email notification
 * @private
 */
async function sendEmailNotification(user, notification) {
  try {
    const mailOptions = {
      from: `"PathAI" <${process.env.FROM_EMAIL}>`,
      to: user.email,
      subject: notification.title,
      text: notification.message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${notification.title}</h2>
          <p>${notification.message}</p>
          <p style="color: #666; font-size: 0.9em;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { channel: 'email', status: 'sent' };
  } catch (error) {
    logger.error(`Failed to send email to ${user.email}: ${error.message}`);
    throw error;
  }
}

/**
 * Send SMS notification (stub - integrate with SMS provider)
 * @private
 */
async function sendSmsNotification(user) {
  // Implementation would depend on the SMS provider (Twilio, etc.)
  // This is a placeholder implementation
  logger.info(`SMS notification would be sent to ${user.phone}`);
  return { channel: 'sms', status: 'sent' };
}

/**
 * Send push notification (stub - integrate with FCM/APNs)
 * @private
 */
async function sendPushNotification(user) {
  // Implementation would depend on the push notification service
  // This is a placeholder implementation
  logger.info(`Push notification would be sent to user ${user._id}`);
  return { channel: 'push', status: 'sent' };
}

/**
 * Get user notifications
 * @param {String} userId - ID of the user
 * @param {Object} options - Query options
 * @param {Number} options.limit - Max number of notifications to return
 * @param {Number} options.page - Page number for pagination
 * @param {Boolean} options.unreadOnly - Whether to return only unread notifications
 * @returns {Promise<Object>} Paginated notifications
 */
async function getUserNotifications(userId, { limit = 20, page = 1, unreadOnly = false } = {}) {
  try {
    const query = { user: userId };
    if (unreadOnly) {
      query.read = false;
    }

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Notification.countDocuments(query)
    ]);

    return {
      success: true,
      data: notifications,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    };
  } catch (error) {
    logger.error(`Error getting notifications for user ${userId}: ${error.message}`);
    throw error;
  }
}

/**
 * Mark notifications as read
 * @param {String} userId - ID of the user
 * @param {String|Array} notificationIds - Single notification ID or array of IDs
 * @returns {Promise<Object>} Result of the operation
 */
async function markAsRead(userId, notificationIds) {
  try {
    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
    
    const result = await Notification.updateMany(
      { _id: { $in: ids }, user: userId },
      { $set: { read: true, readAt: Date.now() } }
    );
    
    return {
      success: true,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    };
  } catch (error) {
    logger.error(`Error marking notifications as read: ${error.message}`);
    throw error;
  }
}

module.exports = {
  sendNotification,
  getUserNotifications,
  markAsRead
};
