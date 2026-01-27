
import { supabase } from './supabase';
import { useAuth } from '@/contexts/AuthContext';
import { checkDatabaseTables, showDatabaseSetupInstructions } from './databaseSetup';

// Types for attendance data
export interface AttendanceStatus {
  attended: number;
  missed: number;
  cancelled: number;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  subject_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DayData {
  date: number;
  fullDate: string;
  isCurrentMonth: boolean;
  isSemesterDay: boolean;
  isToday: boolean;
  attendanceStatus?: AttendanceStatus;
}

export interface TrendDataPoint {
  week: string;
  percentage: number;
  attended: number;
  total: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  totalClasses: number;
  attendedClasses: number;
  missedClasses: number;
  cancelledClasses: number;
  percentage: number;
  requiredClasses?: number;
}

// Service functions
export const fetchAttendanceRecords = async (userId: string, startDate?: string, endDate?: string) => {
  let query = supabase
    .from('attendance_records')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (startDate) {
    query = query.gte('date', startDate);
  }

  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching attendance records:', error);
    throw error;
  }

  return data as AttendanceRecord[];
};

export const fetchAttendanceForMonth = async (userId: string, year: number, month: number) => {
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;

  return fetchAttendanceRecords(userId, startDate, endDate);
};

export const getAttendanceStatusByDate = async (userId: string, dates: string[]) => {
  try {
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      console.error('Invalid userId provided:', userId);
      return {};
    }

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      console.error('Invalid dates array provided:', dates);
      return {};
    }

    // Filter out any invalid date strings
    const validDates = dates.filter(date => {
      return typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/);
    });

    if (validDates.length === 0) {
      console.warn('No valid dates provided in the array');
      return {};
    }

    // Check if Supabase client is properly initialized
    if (!supabase) {
      console.error('Supabase client is not initialized. Check environment variables:', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'
      });
      return {};
    }

    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('user_id', userId)
      .in('date', validDates);

    if (error) {
      const errorObj = JSON.parse(JSON.stringify(error));
      
      // Handle specific case where table doesn't exist
      if (errorObj.code === "PGRST205") {
        console.error(`Database table "${errorObj.message?.match(/'([^']+)'/)?.[1] || 'unknown'}" does not exist.`);
        showDatabaseSetupInstructions();
        
        // Set a flag in localStorage to show a user-friendly notification
        if (typeof window !== "undefined") {
          localStorage.setItem('db_setup_required', 'true');
        }
        
        // Instead of throwing, return empty object to prevent app crash
        return {};
      }
      
      // Handle other errors
      console.error('Error fetching attendance by dates:', JSON.stringify(error));
      // Instead of throwing, return empty object to prevent app crash
      return {};
    }

    // If no data, return empty object
    if (!data || data.length === 0) {
      console.warn('No attendance data found for the specified dates');
      return {};
    }

    // Group by date and calculate status
    const attendanceByDate: Record<string, AttendanceStatus> = {};

    data.forEach(record => {
      // Ensure record has valid date
      if (!record.date) return;

      if (!attendanceByDate[record.date]) {
        attendanceByDate[record.date] = {
          attended: 0,
          missed: 0,
          cancelled: 0
        };
      }

      if (record.status === 'present' || record.status === 'late') {
        attendanceByDate[record.date].attended++;
      } else if (record.status === 'absent') {
        attendanceByDate[record.date].missed++;
      } else if (record.status === 'cancelled') {
        attendanceByDate[record.date].cancelled++;
      }
    });

    return attendanceByDate;
  } catch (err) {
    console.error('Unexpected error in getAttendanceStatusByDate:', err instanceof Error ? err.message : JSON.stringify(err));
    // Return empty object instead of throwing to prevent app crash
    return {};
  }
};

export const getWeeklyAttendanceTrend = async (userId: string, semesterStart: string, semesterEnd: string) => {
  const records = await fetchAttendanceRecords(userId, semesterStart, semesterEnd);

  // Group by week
  const weeklyData: Record<string, { attended: number; total: number }> = {};

  records.forEach(record => {
    const date = new Date(record.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { attended: 0, total: 0 };
    }

    weeklyData[weekKey].total++;
    if (record.status === 'present' || record.status === 'late') {
      weeklyData[weekKey].attended++;
    }
  });

  // Convert to trend data points
  const trendData: TrendDataPoint[] = [];
  Object.entries(weeklyData).forEach(([weekStart, data]) => {
    const weekStartObj = new Date(weekStart);
    const weekEnd = new Date(weekStartObj);
    weekEnd.setDate(weekStartObj.getDate() + 6);

    const weekLabel = `Week ${Math.ceil((weekStartObj.getTime() - new Date(semesterStart).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1}`;

    trendData.push({
      week: weekLabel,
      percentage: data.total > 0 ? (data.attended / data.total) * 100 : 0,
      attended: data.attended,
      total: data.total
    });
  });

  // Sort by week
  trendData.sort((a, b) => a.week.localeCompare(b.week, undefined, { numeric: true }));

  return trendData;
};

export const getSubjectAttendance = async (userId: string, semesterStart: string, semesterEnd: string) => {
  const records = await fetchAttendanceRecords(userId, semesterStart, semesterEnd);

  // Group by subject
  const subjectData: Record<string, {
    total: number;
    attended: number;
    missed: number;
    cancelled: number;
  }> = {};

  records.forEach(record => {
    if (!subjectData[record.subject_id]) {
      subjectData[record.subject_id] = {
        total: 0,
        attended: 0,
        missed: 0,
        cancelled: 0
      };
    }

    subjectData[record.subject_id].total++;

    if (record.status === 'present' || record.status === 'late') {
      subjectData[record.subject_id].attended++;
    } else if (record.status === 'absent') {
      subjectData[record.subject_id].missed++;
    }
  });

  // Convert to Subject objects
  const subjects: Subject[] = [];
  Object.entries(subjectData).forEach(([subjectId, data]) => {
    const percentage = data.total > 0 ? (data.attended / (data.attended + data.missed)) * 100 : 0;

    subjects.push({
      id: subjectId,
      name: subjectId, // In a real app, you'd fetch subject names from another table
      code: subjectId,
      totalClasses: data.total,
      attendedClasses: data.attended,
      missedClasses: data.missed,
      cancelledClasses: data.cancelled,
      percentage: percentage,
      requiredClasses: percentage < 75 ? Math.ceil((0.75 * (data.attended + data.missed)) - data.attended) : undefined
    });
  });

  return subjects;
};

export const getOverallAttendanceStatus = async (userId: string, semesterStart: string, semesterEnd: string) => {
  const records = await fetchAttendanceRecords(userId, semesterStart, semesterEnd);

  let attended = 0;
  let missed = 0;
  let cancelled = 0;

  records.forEach(record => {
    if (record.status === 'present' || record.status === 'late') {
      attended++;
    } else if (record.status === 'absent') {
      missed++;
    } else {
      cancelled++;
    }
  });

  const total = attended + missed;
  const percentage = total > 0 ? (attended / total) * 100 : 0;

  let status: 'safe' | 'warning' | 'danger';
  if (percentage >= 75) {
    status = 'safe';
  } else if (percentage >= 70) {
    status = 'warning';
  } else {
    status = 'danger';
  }

  return {
    percentage: percentage.toFixed(1),
    status,
    attended,
    total,
    requiredFor75: total > 0 ? Math.ceil(0.75 * total) : 0
  };
};
