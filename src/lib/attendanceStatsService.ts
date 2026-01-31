import { supabase } from './supabase';
import { getSemesterConfiguration } from './semesterConfig';

export interface SubjectStats {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  totalClasses: number;
  attendedClasses: number;
  missedClasses: number;
  cancelledClasses: number;
  attendancePercentage: number;
  status: 'safe' | 'warning' | 'danger';
}

export interface SubjectAlert extends SubjectStats {
  requiredClasses: number; // Number of classes needed to reach 75%
}

/**
 * Calculates how many more classes need to be attended to reach 75% attendance
 */
export const calculateRequiredClassesToReach75Percent = (
  totalClasses: number,
  attendedClasses: number
): number => {
  if (totalClasses === 0) return 0;

  const currentPercentage = (attendedClasses / totalClasses) * 100;

  if (currentPercentage >= 75) {
    return 0; // Already at or above 75%
  }

  // Formula: (attended + x) / (total + x) = 0.75
  // Solving for x: attended + x = 0.75 * total + 0.75 * x
  // x - 0.75 * x = 0.75 * total - attended
  // 0.25 * x = 0.75 * total - attended
  // x = (0.75 * total - attended) / 0.25
  // x = 3 * (0.75 * total - attended)

  const requiredClasses = Math.ceil((0.75 * totalClasses - attendedClasses) / 0.25);

  return Math.max(0, requiredClasses);
};

/**
 * Calculates overall attendance percentage for a user
 */
export const getOverallAttendancePercentage = async (
  userId: string
): Promise<{
  percentage: number;
  attended: number;
  total: number;
  requiredFor75: number;
  error: any;
}> => {
  try {
    if (!userId) {
      return {
        percentage: 0,
        attended: 0,
        total: 0,
        requiredFor75: 0,
        error: { message: 'User ID is required' },
      };
    }

    // Fetch all attendance records for the user
    const { data: attendanceRecords, error } = await supabase
      .from('attendance_records')
      .select('status')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching attendance records:', error);
      return { percentage: 0, attended: 0, total: 0, requiredFor75: 0, error };
    }

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return { percentage: 0, attended: 0, total: 0, requiredFor75: 0, error: null };
    }

    // Count attended classes (status = 'present')
    const attendedCount = attendanceRecords.filter((record) => record.status === 'present').length;
    // Exclude cancelled (late) classes from the total count for percentage calculation
    const validRecords = attendanceRecords.filter((record) => record.status !== 'late');
    const totalCount = validRecords.length;

    const percentage = totalCount > 0 ? Math.round((attendedCount / totalCount) * 100) : 0;

    // Calculate required classes for overall
    const requiredFor75 = calculateRequiredClassesToReach75Percent(totalCount, attendedCount);

    return { percentage, attended: attendedCount, total: totalCount, requiredFor75, error: null };
  } catch (error) {
    console.error('Unexpected error in getOverallAttendancePercentage:', error);
    return {
      percentage: 0,
      attended: 0,
      total: 0,
      requiredFor75: 0,
      error: {
        message:
          'Failed to calculate attendance: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      },
    };
  }
};

/**
 * Calculates attendance statistics for each subject
 */
export const getSubjectAttendanceStats = async (
  userId: string
): Promise<{ data: SubjectStats[] | null; error: any }> => {
  try {
    if (!userId) {
      return { data: null, error: { message: 'User ID is required' } };
    }

    // Fetch semester configuration to get subjects list
    const { data: semesterConfig, error: configError } = await getSemesterConfiguration(userId);

    if (configError) {
      return { data: null, error: configError };
    }

    if (!semesterConfig || !semesterConfig.subjects || semesterConfig.subjects.length === 0) {
      return { data: [], error: null };
    }

    // Fetch all attendance records for the user
    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from('attendance_records')
      .select('subject_id, status')
      .eq('user_id', userId);

    if (attendanceError) {
      console.error('Error fetching attendance records:', attendanceError);
      return { data: null, error: attendanceError };
    }

    // Calculate stats for each subject
    const stats: SubjectStats[] = semesterConfig.subjects.map((subject: any) => {
      // Filter records for this subject
      const subjectRecords = attendanceRecords?.filter((r) => r.subject_id === subject.id) || [];

      const attendedCount = subjectRecords.filter((r) => r.status === 'present').length;
      const missedCount = subjectRecords.filter((r) => r.status === 'absent').length;
      const cancelledCount = subjectRecords.filter((r) => r.status === 'late').length; // 'late' is mapped to cancelled

      const totalCount = subjectRecords.length;
      // For percentage calculation, exclude cancelled classes
      const validClassCount = attendedCount + missedCount;
      const percentage =
        validClassCount > 0 ? Math.round((attendedCount / validClassCount) * 100) : 0;

      // Determine status based on percentage
      let status: 'safe' | 'warning' | 'danger';
      if (percentage >= 75) {
        status = 'safe';
      } else if (percentage >= 70) {
        status = 'warning';
      } else {
        status = 'danger';
      }

      return {
        subjectId: subject.id,
        subjectName: subject.name,
        subjectCode: subject.courseCode,
        totalClasses: totalCount,
        attendedClasses: attendedCount,
        missedClasses: missedCount,
        cancelledClasses: cancelledCount,
        attendancePercentage: percentage,
        status,
      };
    });

    return { data: stats, error: null };
  } catch (error) {
    console.error('Unexpected error in getSubjectAttendanceStats:', error);
    return {
      data: null,
      error: {
        message:
          'Failed to calculate subject stats: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      },
    };
  }
};

/**
 * Gets subjects that need attention (below 75% attendance)
 */
export const getAttendanceAlertsForSubjects = async (
  userId: string
): Promise<{ data: SubjectAlert[] | null; error: any }> => {
  try {
    const { data: stats, error } = await getSubjectAttendanceStats(userId);

    if (error) {
      return { data: null, error };
    }

    if (!stats || stats.length === 0) {
      return { data: [], error: null };
    }

    // Filter subjects with attendance below 75% and calculate required classes
    const alerts: SubjectAlert[] = stats
      .filter((subject) => subject.status !== 'safe')
      .map((subject) => {
        const requiredClasses = calculateRequiredClassesToReach75Percent(
          subject.totalClasses,
          subject.attendedClasses
        );

        return {
          ...subject,
          requiredClasses,
        };
      });

    return { data: alerts, error: null };
  } catch (error) {
    console.error('Unexpected error in getAttendanceAlertsForSubjects:', error);
    return {
      data: null,
      error: {
        message:
          'Failed to get attendance alerts: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      },
    };
  }
};

/**
 * Calculates attendance trend data by week
 */
export interface TrendData {
  week: string;
  attended: number;
  total: number;
  percentage: number;
}

/**
 * Calculates attendance trend data by week
 */
export const getAttendanceTrend = async (
  userId: string
): Promise<{ data: TrendData[] | null; error: any }> => {
  try {
    if (!userId) {
      return { data: null, error: { message: 'User ID is required' } };
    }

    // Fetch all attendance records with date
    const { data: attendanceRecords, error } = await supabase
      .from('attendance_records')
      .select('date, status')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching attendance trend:', error);
      return { data: null, error };
    }

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return { data: [], error: null };
    }

    // Group records by week
    const weeklyData: Record<string, { attended: number; total: number }> = {};

    attendanceRecords.forEach((record) => {
      const date = new Date(record.date);
      // Get start of the week (Monday)
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      const wDate = new Date(date.setDate(diff));
      const weekKey = wDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { attended: 0, total: 0 };
      }

      weeklyData[weekKey].total += 1;
      if (record.status === 'present') {
        weeklyData[weekKey].attended += 1;
      }
    });

    // Convert to array and format
    const trendData: TrendData[] = Object.entries(weeklyData).map(([week, stats]) => ({
      week,
      attended: stats.attended,
      total: stats.total,
      percentage: Math.round((stats.attended / stats.total) * 100),
    }));

    return { data: trendData, error: null };
  } catch (error) {
    console.error('Unexpected error in getAttendanceTrend:', error);
    return {
      data: null,
      error: {
        message:
          'Failed to calculate attendance trend: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      },
    };
  }
};

/**
 * Calculates required classes for a specific subject to reach 75%
 */
export const calculateRequiredClassesToReach75 = async (
  subjectId: string,
  userId: string
): Promise<{ requiredClasses: number; error: any }> => {
  try {
    if (!userId || !subjectId) {
      return { requiredClasses: 0, error: { message: 'User ID and Subject ID are required' } };
    }

    // Fetch attendance records for this subject
    const { data: attendanceRecords, error } = await supabase
      .from('attendance_records')
      .select('status')
      .eq('user_id', userId)
      .eq('subject_id', subjectId);

    if (error) {
      return { requiredClasses: 0, error };
    }

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return { requiredClasses: 0, error: null };
    }

    const attendedCount = attendanceRecords.filter((r) => r.status === 'present').length;
    const totalCount = attendanceRecords.length;

    const requiredClasses = calculateRequiredClassesToReach75Percent(totalCount, attendedCount);

    return { requiredClasses, error: null };
  } catch (error) {
    console.error('Unexpected error in calculateRequiredClassesToReach75:', error);
    return {
      requiredClasses: 0,
      error: {
        message:
          'Failed to calculate required classes: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      },
    };
  }
};
