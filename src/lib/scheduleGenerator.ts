import { Subject, SchedulePeriod } from './seedData';

/**
 * Gets the day of week name from a Date object
 */
export const getDayOfWeek = (date: Date): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

/**
 * Generates the daily schedule for a specific date based on weekly schedule
 */
export const generateDailySchedule = (
  date: Date,
  weeklySchedule: { [key: string]: SchedulePeriod[] },
  subjects: Subject[]
): SchedulePeriod[] => {
  const dayOfWeek = getDayOfWeek(date);

  // Get the schedule for this day of the week
  const daySchedule = weeklySchedule[dayOfWeek] || [];

  // Return the schedule with full subject information
  return daySchedule.map((period) => ({
    ...period,
    // Ensure day of week is set
    dayOfWeek: dayOfWeek,
  }));
};

/**
 * Gets subject information by ID
 */
export const getSubjectById = (subjectId: string, subjects: Subject[]): Subject | undefined => {
  return subjects.find((s) => s.id === subjectId);
};

/**
 * Converts schedule period to display format with subject details
 */
export interface DisplaySchedulePeriod extends SchedulePeriod {
  subjectName: string;
  subjectCode: string;
  subjectType: 'theory' | 'lab';
}

export const enrichScheduleWithSubjectDetails = (
  schedule: SchedulePeriod[],
  subjects: Subject[]
): DisplaySchedulePeriod[] => {
  return schedule.map((period) => {
    const subject = getSubjectById(period.subjectId, subjects);
    return {
      ...period,
      subjectName: subject?.name || 'Unknown Subject',
      subjectCode: subject?.courseCode || period.subjectId,
      subjectType: subject?.type || 'theory',
    };
  });
};

/**
 * Checks if a date falls within the semester period
 */
export const isDateInSemester = (date: Date, startDate: string, endDate: string): boolean => {
  const checkDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);

  return checkDate >= start && checkDate <= end;
};

/**
 * Checks if a date is a weekend
 */
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};
