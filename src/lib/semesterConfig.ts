import { supabase } from './supabase';

export interface SemesterConfig {
  id?: string;
  userId: string;
  startDate: string;
  endDate: string;
  academicYear: string;
  semesterType: 'odd' | 'even';
  subjects: Subject[];
  schedule: SchedulePeriod[];
}

export interface Subject {
  id: string;
  courseCode: string;
  name: string;
  weeklyClasses: number;
}

export interface SchedulePeriod {
  periodNumber: number;
  startTime: string;
  endTime: string;
  subjectId: string;
  classroom: string;
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
          updated_at: new Date().toISOString()
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
          schedule: config.schedule
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
    return { error: { message: 'Failed to save semester configuration: ' + (error instanceof Error ? error.message : 'Unknown error') } };
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
          schedule: data.schedule
        },
        error: null
      };
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('Unexpected error in getSemesterConfiguration:', error);
    return { error: { message: 'Failed to fetch semester configuration: ' + (error instanceof Error ? error.message : 'Unknown error') } };
  }
};
