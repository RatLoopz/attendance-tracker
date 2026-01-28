import { supabase } from './supabase';

export interface AttendanceRecordInput {
  userId: string;
  subjectId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
}

export interface AttendanceRecordWithId extends AttendanceRecordInput {
  id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Records or updates attendance for a specific subject on a specific date
 * Uses upsert to handle both insert and update cases
 */
export const recordAttendance = async (
  record: AttendanceRecordInput
): Promise<{ data: any; error: any }> => {
  try {
    // Validate required fields
    if (!record.userId || !record.subjectId || !record.date || !record.status) {
      return {
        data: null,
        error: { message: 'Missing required fields for attendance record' },
      };
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(record.date)) {
      return {
        data: null,
        error: { message: 'Invalid date format. Expected YYYY-MM-DD' },
      };
    }

    // Validate status
    if (!['present', 'absent', 'late'].includes(record.status)) {
      return {
        data: null,
        error: {
          message: 'Invalid status. Must be one of: present, absent, late',
        },
      };
    }

    console.log('Recording attendance:', record);

    // Use upsert to handle both insert and update
    // The unique constraint is on (user_id, subject_id, date)
    const { data, error } = await supabase
      .from('attendance_records')
      .upsert(
        {
          user_id: record.userId,
          subject_id: record.subjectId,
          date: record.date,
          status: record.status,
          notes: record.notes || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,subject_id,date',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error recording attendance:', error);
      return { data: null, error };
    }

    console.log('Attendance recorded successfully:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error in recordAttendance:', error);
    return {
      data: null,
      error: {
        message:
          'Failed to record attendance: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      },
    };
  }
};

/**
 * Fetches all attendance records for a user on a specific date
 */
export const getAttendanceForDate = async (
  userId: string,
  date: string
): Promise<{ data: any[] | null; error: any }> => {
  try {
    if (!userId || !date) {
      return {
        data: null,
        error: { message: 'User ID and date are required' },
      };
    }

    console.log(`Fetching attendance for user ${userId} on ${date}`);

    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching attendance for date:', error);
      return { data: null, error };
    }

    console.log(`Found ${data?.length || 0} attendance records for ${date}`);
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error in getAttendanceForDate:', error);
    return {
      data: null,
      error: {
        message:
          'Failed to fetch attendance: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      },
    };
  }
};

/**
 * Deletes an attendance record by ID
 */
export const deleteAttendanceRecord = async (recordId: string): Promise<{ error: any }> => {
  try {
    if (!recordId) {
      return { error: { message: 'Record ID is required' } };
    }

    console.log(`Deleting attendance record ${recordId}`);

    const { error } = await supabase.from('attendance_records').delete().eq('id', recordId);

    if (error) {
      console.error('Error deleting attendance record:', error);
      return { error };
    }

    console.log('Attendance record deleted successfully');
    return { error: null };
  } catch (error) {
    console.error('Unexpected error in deleteAttendanceRecord:', error);
    return {
      error: {
        message:
          'Failed to delete attendance record: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      },
    };
  }
};

/**
 * Bulk records multiple attendance records at once
 * Useful for marking attendance for multiple periods in a day
 */
export const bulkRecordAttendance = async (
  records: AttendanceRecordInput[]
): Promise<{ data: any[] | null; error: any }> => {
  try {
    if (!records || records.length === 0) {
      return {
        data: null,
        error: { message: 'No records provided' },
      };
    }

    // Validate all records
    for (const record of records) {
      if (!record.userId || !record.subjectId || !record.date || !record.status) {
        return {
          data: null,
          error: {
            message: 'One or more records are missing required fields',
          },
        };
      }
    }

    console.log(`Bulk recording ${records.length} attendance records`);

    // Convert to database format
    const dbRecords = records.map((record) => ({
      user_id: record.userId,
      subject_id: record.subjectId,
      date: record.date,
      status: record.status,
      notes: record.notes || null,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('attendance_records')
      .upsert(dbRecords, {
        onConflict: 'user_id,subject_id,date',
      })
      .select();

    if (error) {
      console.error('Error bulk recording attendance:', error);
      return { data: null, error };
    }

    console.log(`Successfully recorded ${data?.length || 0} attendance records`);
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error in bulkRecordAttendance:', error);
    return {
      data: null,
      error: {
        message:
          'Failed to bulk record attendance: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      },
    };
  }
};

/**
 * Gets attendance records for a date range
 */
export const getAttendanceForDateRange = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<{ data: any[] | null; error: any }> => {
  try {
    if (!userId || !startDate || !endDate) {
      return {
        data: null,
        error: { message: 'User ID, start date, and end date are required' },
      };
    }

    console.log(`Fetching attendance for user ${userId} from ${startDate} to ${endDate}`);

    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching attendance for date range:', error);
      return { data: null, error };
    }

    console.log(`Found ${data?.length || 0} attendance records in date range`);
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error in getAttendanceForDateRange:', error);
    return {
      data: null,
      error: {
        message:
          'Failed to fetch attendance: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      },
    };
  }
};
