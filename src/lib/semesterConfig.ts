import { supabase } from './supabase';

export interface SemesterConfig {
  id?: string;
  userId: string;
  startDate: string;
  endDate: string;
  academicYear: string;
  semesterType: 'odd' | 'even';
  subjects: Subject[];
  schedule: WeeklySchedule; // Changed from SchedulePeriod[] to WeeklySchedule
}

export interface Subject {
  id: string;
  courseCode: string;
  name: string;
  weeklyClasses: number;
  type?: 'theory' | 'lab';
}

export interface SchedulePeriod {
  periodNumber: number;
  startTime: string;
  endTime: string;
  subjectId: string;
  classroom: string;
  dayOfWeek?: string;
  isLab?: boolean;
}

export interface WeeklySchedule {
  [key: string]: SchedulePeriod[]; // Monday, Tuesday, etc.
}

export const saveSemesterConfiguration = async (config: Omit<SemesterConfig, 'id'>) => {
  try {
    console.log('Saving semester configuration for user:', config.userId);

    // Validate required fields
    if (!config.userId || !config.startDate || !config.endDate || !config.academicYear) {
      return { error: { message: 'Missing required configuration fields' } };
    }

    // Validate date range
    const start = new Date(config.startDate);
    const end = new Date(config.endDate);
    if (start >= end) {
      return { error: { message: 'Start date must be before end date' } };
    }

    // Check if a configuration already exists for this user
    const { data: existingConfig, error: fetchError } = await supabase
      .from('semester_configurations')
      .select('id')
      .eq('user_id', config.userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // Error is not "no rows returned"
      console.error('Error checking existing configuration:', fetchError);
      return { error: fetchError };
    }

    if (existingConfig) {
      console.log('Updating existing configuration:', existingConfig.id);
      // Update existing configuration
      const { data, error } = await supabase
        .from('semester_configurations')
        .update({
          start_date: config.startDate,
          end_date: config.endDate,
          academic_year: config.academicYear,
          semester_type: config.semesterType,
          subjects: config.subjects,
          schedule: config.schedule,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingConfig.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating configuration:', error);
      } else {
        console.log('Configuration updated successfully:', data);
      }

      return { data, error };
    } else {
      console.log('Creating new configuration');
      // Create new configuration
      const { data, error } = await supabase
        .from('semester_configurations')
        .insert({
          user_id: config.userId,
          start_date: config.startDate,
          end_date: config.endDate,
          academic_year: config.academicYear,
          semester_type: config.semesterType,
          subjects: config.subjects,
          schedule: config.schedule,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating configuration:', error);
      } else {
        console.log('Configuration created successfully:', data);
      }

      return { data, error };
    }
  } catch (error) {
    console.error('Unexpected error in saveSemesterConfiguration:', error);
    return {
      error: {
        message:
          'Failed to save semester configuration: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      },
    };
  }
};

export const getSemesterConfiguration = async (userId: string) => {
  try {
    if (!userId) {
      return { error: { message: 'User ID is required' } };
    }

    console.log('Fetching semester configuration for user:', userId);

    const { data, error } = await supabase
      .from('semester_configurations')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No configuration found
        console.log('No semester configuration found for user:', userId);
        return { data: null, error: null };
      }

      console.error('Error fetching semester configuration:', error);
      return { error };
    }

    if (data) {
      console.log('Successfully fetched semester configuration for user:', userId);
      // Transform the data to match our interface
      return {
        data: {
          id: data.id,
          userId: data.user_id,
          startDate: data.start_date,
          endDate: data.end_date,
          academicYear: data.academic_year,
          semesterType: data.semester_type,
          subjects: data.subjects,
          schedule: data.schedule,
        },
        error: null,
      };
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('Unexpected error in getSemesterConfiguration:', error);
    return {
      error: {
        message:
          'Failed to fetch semester configuration: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      },
    };
  }
};

/**
 * Deletes semester configuration for a user
 */
export const deleteSemesterConfiguration = async (userId: string) => {
  try {
    if (!userId) {
      return { error: { message: 'User ID is required' } };
    }

    console.log('Deleting semester configuration for user:', userId);

    const { error } = await supabase.from('semester_configurations').delete().eq('user_id', userId);

    if (error) {
      console.error('Error deleting semester configuration:', error);
      return { error };
    }

    console.log('Semester configuration deleted successfully');
    return { error: null };
  } catch (error) {
    console.error('Unexpected error in deleteSemesterConfiguration:', error);
    return {
      error: {
        message:
          'Failed to delete semester configuration: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      },
    };
  }
};

/**
 * Gets the list of subjects for a user
 */
export const getSubjects = async (
  userId: string
): Promise<{ data: Subject[] | null; error: any }> => {
  try {
    if (!userId) {
      return { data: null, error: { message: 'User ID is required' } };
    }

    const { data, error } = await getSemesterConfiguration(userId);

    if (error) {
      return { data: null, error };
    }

    if (!data || !data.subjects) {
      return { data: [], error: null };
    }

    return { data: data.subjects, error: null };
  } catch (error) {
    console.error('Unexpected error in getSubjects:', error);
    return {
      data: null,
      error: {
        message:
          'Failed to fetch subjects: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
    };
  }
};

/**
 * Calculates total classes for a subject based on schedule and semester duration
 */
export const calculateTotalClasses = (
  subjectId: string,
  schedule: WeeklySchedule,
  startDate: string,
  endDate: string
): number => {
  try {
    // Count how many times this subject appears in the weekly schedule across all days
    let classesPerWeek = 0;
    Object.values(schedule).forEach((daySchedule) => {
      classesPerWeek += daySchedule.filter((period) => period.subjectId === subjectId).length;
    });

    // Calculate number of weeks in the semester
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.ceil(diffDays / 7);

    // Total classes = classes per week * number of weeks
    return classesPerWeek * weeks;
  } catch (error) {
    console.error('Error calculating total classes:', error);
    return 0;
  }
};

/**
 * Validates subject data
 */
export const validateSubject = (subject: Subject): { valid: boolean; error?: string } => {
  if (!subject.id || subject.id.trim() === '') {
    return { valid: false, error: 'Subject ID is required' };
  }

  if (!subject.courseCode || subject.courseCode.trim() === '') {
    return { valid: false, error: 'Course code is required' };
  }

  if (!subject.name || subject.name.trim() === '') {
    return { valid: false, error: 'Subject name is required' };
  }

  if (typeof subject.weeklyClasses !== 'number' || subject.weeklyClasses < 1) {
    return { valid: false, error: 'Weekly classes must be at least 1' };
  }

  return { valid: true };
};

/**
 * Validates schedule period data
 */
export const validateSchedulePeriod = (
  period: SchedulePeriod
): { valid: boolean; error?: string } => {
  if (typeof period.periodNumber !== 'number' || period.periodNumber < 1) {
    return { valid: false, error: 'Period number must be at least 1' };
  }

  if (!period.startTime || period.startTime.trim() === '') {
    return { valid: false, error: 'Start time is required' };
  }

  if (!period.endTime || period.endTime.trim() === '') {
    return { valid: false, error: 'End time is required' };
  }

  if (!period.subjectId || period.subjectId.trim() === '') {
    return { valid: false, error: 'Subject ID is required' };
  }

  if (!period.classroom || period.classroom.trim() === '') {
    return { valid: false, error: 'Classroom is required' };
  }

  return { valid: true };
};
