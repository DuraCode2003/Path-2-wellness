const moment = require('moment-timezone');

// Set the default timezone
moment.tz.setDefault(process.env.TIMEZONE || 'UTC');

/**
 * Format a date to a specific format
 * @param {Date|string} date - Date to format
 * @param {string} format - Format string (default: 'YYYY-MM-DD HH:mm:ss')
 * @param {string} timezone - Timezone (default: process.env.TIMEZONE || 'UTC')
 * @returns {string} Formatted date string
 */
const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss', timezone) => {
  if (!date) return null;
  
  const m = moment(date);
  if (timezone) {
    m.tz(timezone);
  }
  
  return m.format(format);
};

/**
 * Get the current date and time
 * @param {string} format - Format string (default: 'YYYY-MM-DD HH:mm:ss')
 * @param {string} timezone - Timezone (default: process.env.TIMEZONE || 'UTC')
 * @returns {string} Formatted current date and time
 */
const now = (format = 'YYYY-MM-DD HH:mm:ss', timezone) => {
  const m = moment();
  if (timezone) {
    m.tz(timezone);
  }
  return m.format(format);
};

/**
 * Add time to a date
 * @param {Date|string} date - Base date
 * @param {number} amount - Amount to add
 * @param {string} unit - Unit of time (years, months, weeks, days, hours, minutes, seconds)
 * @param {string} format - Output format (default: 'YYYY-MM-DD HH:mm:ss')
 * @returns {string} Formatted date string
 */
const addTime = (date, amount, unit, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return null;
  return moment(date).add(amount, unit).format(format);
};

/**
 * Subtract time from a date
 * @param {Date|string} date - Base date
 * @param {number} amount - Amount to subtract
 * @param {string} unit - Unit of time (years, months, weeks, days, hours, minutes, seconds)
 * @param {string} format - Output format (default: 'YYYY-MM-DD HH:mm:ss')
 * @returns {string} Formatted date string
 */
const subtractTime = (date, amount, unit, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return null;
  return moment(date).subtract(amount, unit).format(format);
};

/**
 * Get the difference between two dates
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date (default: current date)
 * @param {string} unit - Unit of time (years, months, weeks, days, hours, minutes, seconds)
 * @param {boolean} asFloat - Return as float (default: false)
 * @returns {number} Difference between dates
 */
const diff = (date1, date2 = new Date(), unit = 'milliseconds', asFloat = false) => {
  if (!date1) return null;
  return moment(date1).diff(moment(date2), unit, asFloat);
};

/**
 * Check if a date is between two other dates
 * @param {Date|string} date - Date to check
 * @param {Date|string} start - Start date
 * @param {Date|string} end - End date
 * @param {string} unit - Unit of time (year, month, week, day, hour, minute, second)
 * @param {string} inclusivity - '()' (default), '[]', '[)', or '(]'
 * @returns {boolean} True if date is between start and end
 */
const isBetween = (date, start, end, unit = 'milliseconds', inclusivity = '()') => {
  if (!date || !start || !end) return false;
  return moment(date).isBetween(moment(start), moment(end), unit, inclusivity);
};

/**
 * Check if a date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the past
 */
const isPast = (date) => {
  if (!date) return false;
  return moment(date).isBefore();
};

/**
 * Check if a date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the future
 */
const isFuture = (date) => {
  if (!date) return false;
  return moment(date).isAfter();
};

/**
 * Get the start of a time period
 * @param {Date|string} date - Base date
 * @param {string} unit - Unit of time (year, month, week, day, hour, minute, second)
 * @param {string} format - Output format (default: 'YYYY-MM-DD HH:mm:ss')
 * @returns {string} Formatted date string
 */
const startOf = (date, unit, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return null;
  return moment(date).startOf(unit).format(format);
};

/**
 * Get the end of a time period
 * @param {Date|string} date - Base date
 * @param {string} unit - Unit of time (year, month, week, day, hour, minute, second)
 * @param {string} format - Output format (default: 'YYYY-MM-DD HH:mm:ss')
 * @returns {string} Formatted date string
 */
const endOf = (date, unit, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return null;
  return moment(date).endOf(unit).format(format);
};

/**
 * Parse a date string with a specific format
 * @param {string} dateString - Date string to parse
 * @param {string} format - Format of the input date string
 * @param {string} outputFormat - Output format (default: 'YYYY-MM-DD HH:mm:ss')
 * @returns {string} Formatted date string
 */
const parseDate = (dateString, format, outputFormat = 'YYYY-MM-DD HH:mm:ss') => {
  if (!dateString) return null;
  return moment(dateString, format).format(outputFormat);
};

/**
 * Get the current timestamp in milliseconds
 * @returns {number} Current timestamp in milliseconds
 */
const timestamp = () => {
  return moment().valueOf();
};

/**
 * Convert a date to a specific timezone
 * @param {Date|string} date - Date to convert
 * @param {string} timezone - Target timezone (e.g., 'America/New_York')
 * @param {string} format - Output format (default: 'YYYY-MM-DD HH:mm:ss')
 * @returns {string} Formatted date string in the target timezone
 */
const toTimezone = (date, timezone, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return null;
  return moment(date).tz(timezone).format(format);
};

module.exports = {
  formatDate,
  now,
  addTime,
  subtractTime,
  diff,
  isBetween,
  isPast,
  isFuture,
  startOf,
  endOf,
  parseDate,
  timestamp,
  toTimezone,
  moment // Export moment for advanced usage
};
