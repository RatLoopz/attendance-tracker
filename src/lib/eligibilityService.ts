/**
 * Eligibility Service
 * Handles real-time attendance eligibility calculations
 * for exam eligibility (typically 75% requirement)
 */

export interface EligibilityStatus {
  status: 'safe' | 'warning' | 'danger';
  percentage: number;
  attended: number;
  total: number;
  classesNeededFor75: number;
  maxMissableClasses: number;
  message: string;
}

/**
 * Calculate eligibility status based on attendance percentage
 * @param attended - Number of classes attended
 * @param missed - Number of classes missed
 * @returns 'safe' (>=75%), 'warning' (70-74%), or 'danger' (<70%)
 */
export const calculateEligibilityStatus = (
  attended: number,
  missed: number
): 'safe' | 'warning' | 'danger' => {
  const total = attended + missed;

  if (total === 0) return 'safe'; // No classes yet

  const percentage = (attended / total) * 100;

  if (percentage >= 75) return 'safe';
  if (percentage >= 70) return 'warning';
  return 'danger';
};

/**
 * Calculate number of classes needed to reach 75% attendance
 * @param attended - Number of classes attended
 * @param total - Total classes (attended + missed)
 * @returns Number of consecutive classes to attend to reach 75%
 */
export const getClassesNeededFor75 = (attended: number, total: number): number => {
  const missed = total - attended;

  if (total === 0) return 0;

  const currentPercentage = (attended / total) * 100;

  // Already at or above 75%
  if (currentPercentage >= 75) return 0;

  // Formula: Need to attend N classes such that (attended + N) / (total + N) >= 0.75
  // Solving: attended + N >= 0.75 * (total + N)
  // attended + N >= 0.75 * total + 0.75 * N
  // N - 0.75 * N >= 0.75 * total - attended
  // 0.25 * N >= 0.75 * total - attended
  // N >= (0.75 * total - attended) / 0.25
  // N >= 3 * (0.75 * total - attended)

  const classesNeeded = Math.ceil((0.75 * total - attended) / 0.25);

  return Math.max(0, classesNeeded);
};

/**
 * Calculate maximum number of classes that can be missed while staying at or above 75%
 * @param attended - Number of classes attended
 * @param total - Total classes (attended + missed)
 * @returns Maximum classes that can be missed
 */
export const getMaxMissableClasses = (attended: number, total: number): number => {
  if (total === 0) return 0;

  const currentPercentage = (attended / total) * 100;

  // Below 75%, cannot afford to miss any more
  if (currentPercentage < 75) return 0;

  // Formula: Can miss N classes such that attended / (total + N) >= 0.75
  // Solving: attended >= 0.75 * (total + N)
  // attended >= 0.75 * total + 0.75 * N
  // attended - 0.75 * total >= 0.75 * N
  // N <= (attended - 0.75 * total) / 0.75

  const maxMissable = Math.floor((attended - 0.75 * total) / 0.75);

  return Math.max(0, maxMissable);
};

/**
 * Get comprehensive eligibility information
 * @param attended - Number of classes attended
 * @param missed - Number of classes missed
 * @returns Complete eligibility status with metrics and message
 */
export const getEligibilityInfo = (attended: number, missed: number): EligibilityStatus => {
  const total = attended + missed;
  const percentage = total > 0 ? (attended / total) * 100 : 0;
  const status = calculateEligibilityStatus(attended, missed);
  const classesNeededFor75 = getClassesNeededFor75(attended, total);
  const maxMissableClasses = getMaxMissableClasses(attended, total);

  let message = '';

  if (total === 0) {
    message = 'No attendance records yet. Start attending classes!';
  } else if (status === 'safe') {
    if (maxMissableClasses === 0) {
      message = `You're at exactly 75%. Attend all remaining classes to stay eligible.`;
    } else {
      message = `You're safe! You can miss up to ${maxMissableClasses} more ${maxMissableClasses === 1 ? 'class' : 'classes'} and stay above 75%.`;
    }
  } else if (status === 'warning') {
    message = `Warning! You're below 75%. Attend the next ${classesNeededFor75} ${classesNeededFor75 === 1 ? 'class' : 'classes'} to regain eligibility.`;
  } else {
    message = `Danger! You need to attend ${classesNeededFor75} consecutive ${classesNeededFor75 === 1 ? 'class' : 'classes'} to reach 75% eligibility.`;
  }

  return {
    status,
    percentage: parseFloat(percentage.toFixed(2)),
    attended,
    total,
    classesNeededFor75,
    maxMissableClasses,
    message,
  };
};

/**
 * Calculate projected attendance percentage if upcoming classes are attended
 * @param attended - Current attended classes
 * @param total - Current total classes
 * @param upcomingAttended - Number of upcoming classes planned to attend
 * @param upcomingTotal - Total upcoming classes
 * @returns Projected percentage
 */
export const getProjectedPercentage = (
  attended: number,
  total: number,
  upcomingAttended: number,
  upcomingTotal: number
): number => {
  const newAttended = attended + upcomingAttended;
  const newTotal = total + upcomingTotal;

  if (newTotal === 0) return 0;

  return (newAttended / newTotal) * 100;
};

/**
 * Get a color scheme for attendance percentage
 * @param percentage - Attendance percentage
 * @returns Color scheme object with Tailwind classes
 */
export const getAttendanceColorScheme = (percentage: number) => {
  if (percentage >= 75) {
    return {
      bg: 'bg-success/10',
      text: 'text-success',
      border: 'border-success',
      badge: 'bg-success',
    };
  } else if (percentage >= 70) {
    return {
      bg: 'bg-warning/10',
      text: 'text-warning',
      border: 'border-warning',
      badge: 'bg-warning',
    };
  } else {
    return {
      bg: 'bg-error/10',
      text: 'text-error',
      border: 'border-error',
      badge: 'bg-error',
    };
  }
};
