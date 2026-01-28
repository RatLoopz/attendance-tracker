/**
 * Validation Utilities
 * Centralized validation helpers for data integrity
 */

import type { Subject, SchedulePeriod } from './semesterConfig';

/**
 * Validates a date range to ensure start date is before end date
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Validation result with error message if invalid
 */
export const validateDateRange = (
  startDate: string,
  endDate: string
): { valid: boolean; error?: string } => {
  // Check date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(startDate)) {
    return {
      valid: false,
      error: 'Invalid start date format. Expected YYYY-MM-DD',
    };
  }

  if (!dateRegex.test(endDate)) {
    return {
      valid: false,
      error: 'Invalid end date format. Expected YYYY-MM-DD',
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Check if dates are valid
  if (isNaN(start.getTime())) {
    return { valid: false, error: 'Invalid start date' };
  }

  if (isNaN(end.getTime())) {
    return { valid: false, error: 'Invalid end date' };
  }

  // Check if start is before end
  if (start >= end) {
    return {
      valid: false,
      error: 'Start date must be before end date',
    };
  }

  // Check if dates are not too far in the past
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  if (end < oneYearAgo) {
    return {
      valid: false,
      error: 'End date cannot be more than 1 year in the past',
    };
  }

  // Check if dates are not too far in the future
  const twoYearsFromNow = new Date();
  twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);

  if (start > twoYearsFromNow) {
    return {
      valid: false,
      error: 'Start date cannot be more than 2 years in the future',
    };
  }

  return { valid: true };
};

/**
 * Validates a subject object
 * @param subject - Subject to validate
 * @returns Validation result with error message if invalid
 */
export const validateSubject = (subject: Subject): { valid: boolean; error?: string } => {
  if (!subject.id || typeof subject.id !== 'string' || subject.id.trim() === '') {
    return { valid: false, error: 'Subject must have a valid ID' };
  }

  if (
    !subject.courseCode ||
    typeof subject.courseCode !== 'string' ||
    subject.courseCode.trim() === ''
  ) {
    return { valid: false, error: 'Subject must have a valid course code' };
  }

  if (!subject.name || typeof subject.name !== 'string' || subject.name.trim() === '') {
    return { valid: false, error: 'Subject must have a valid name' };
  }

  if (
    typeof subject.weeklyClasses !== 'number' ||
    subject.weeklyClasses < 1 ||
    subject.weeklyClasses > 50
  ) {
    return {
      valid: false,
      error: 'Weekly classes must be a number between 1 and 50',
    };
  }

  return { valid: true };
};

/**
 * Validates a schedule period object
 * @param period - Schedule period to validate
 * @returns Validation result with error message if invalid
 */
export const validateSchedulePeriod = (
  period: SchedulePeriod
): { valid: boolean; error?: string } => {
  if (
    typeof period.periodNumber !== 'number' ||
    period.periodNumber < 1 ||
    period.periodNumber > 20
  ) {
    return {
      valid: false,
      error: 'Period number must be between 1 and 20',
    };
  }

  if (!period.startTime || typeof period.startTime !== 'string') {
    return { valid: false, error: 'Start time is required' };
  }

  if (!period.endTime || typeof period.endTime !== 'string') {
    return { valid: false, error: 'End time is required' };
  }

  // Validate time format (HH:MM)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

  if (!timeRegex.test(period.startTime)) {
    return {
      valid: false,
      error: 'Invalid start time format. Expected HH:MM (24-hour format)',
    };
  }

  if (!timeRegex.test(period.endTime)) {
    return {
      valid: false,
      error: 'Invalid end time format. Expected HH:MM (24-hour format)',
    };
  }

  // Validate that end time is after start time
  const [startHours, startMinutes] = period.startTime.split(':').map(Number);
  const [endHours, endMinutes] = period.endTime.split(':').map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  if (endTotalMinutes <= startTotalMinutes) {
    return {
      valid: false,
      error: 'End time must be after start time',
    };
  }

  if (!period.subjectId || typeof period.subjectId !== 'string') {
    return { valid: false, error: 'Subject ID is required' };
  }

  if (!period.classroom || typeof period.classroom !== 'string') {
    return { valid: false, error: 'Classroom is required' };
  }

  return { valid: true };
};

/**
 * Validates an attendance record before saving
 * @param record - Attendance record to validate
 * @returns Validation result with error message if invalid
 */
export const validateAttendanceRecord = (record: {
  userId: string;
  subjectId: string;
  date: string;
  status: string;
}): { valid: boolean; error?: string } => {
  if (!record.userId || typeof record.userId !== 'string') {
    return { valid: false, error: 'User ID is required' };
  }

  if (!record.subjectId || typeof record.subjectId !== 'string') {
    return { valid: false, error: 'Subject ID is required' };
  }

  if (!record.date || typeof record.date !== 'string') {
    return { valid: false, error: 'Date is required' };
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(record.date)) {
    return {
      valid: false,
      error: 'Invalid date format. Expected YYYY-MM-DD',
    };
  }

  // Check if date is valid
  const date = new Date(record.date);
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date' };
  }

  // Validate status
  const validStatuses = ['present', 'absent', 'late'];
  if (!validStatuses.includes(record.status)) {
    return {
      valid: false,
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    };
  }

  return { valid: true };
};

/**
 * Validates an email address
 * @param email - Email to validate
 * @returns Validation result
 */
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
};

/**
 * Validates academic year format (e.g., "2023-2024")
 * @param academicYear - Academic year to validate
 * @returns Validation result
 */
export const validateAcademicYear = (academicYear: string): { valid: boolean; error?: string } => {
  const yearRegex = /^\d{4}-\d{4}$/;

  if (!academicYear || typeof academicYear !== 'string') {
    return { valid: false, error: 'Academic year is required' };
  }

  if (!yearRegex.test(academicYear)) {
    return {
      valid: false,
      error: 'Invalid academic year format. Expected YYYY-YYYY',
    };
  }

  const [startYear, endYear] = academicYear.split('-').map(Number);

  if (endYear !== startYear + 1) {
    return {
      valid: false,
      error: 'Academic year must span consecutive years',
    };
  }

  return { valid: true };
};
