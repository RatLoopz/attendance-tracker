import { supabase } from './supabase';

/**
 * Check if required tables exist in the database
 * @returns Promise<boolean> - true if all tables exist, false otherwise
 */
export const checkDatabaseTables = async (): Promise<boolean> => {
  try {
    // Check if attendance_records table exists
    const { error: attendanceError } = await supabase
      .from('attendance_records')
      .select('id')
      .limit(1);

    if (attendanceError && attendanceError.code === 'PGRST205') {
      console.error('Database table "attendance_records" does not exist.');
      return false;
    }

    // Check if user_profiles table exists
    const { error: profilesError } = await supabase.from('user_profiles').select('id').limit(1);

    if (profilesError && profilesError.code === 'PGRST205') {
      console.error('Database table "user_profiles" does not exist.');
      return false;
    }

    // Check if semester_configurations table exists
    const { error: semesterError } = await supabase
      .from('semester_configurations')
      .select('id')
      .limit(1);

    if (semesterError && semesterError.code === 'PGRST205') {
      console.error('Database table "semester_configurations" does not exist.');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking database tables:', error);
    return false;
  }
};

/**
 * Display instructions for setting up the database
 */
export const showDatabaseSetupInstructions = (): void => {
  console.error(`
    DATABASE SETUP REQUIRED:

    The required tables do not exist in your Supabase database.
    To fix this issue:

    1. Navigate to your Supabase project dashboard
    2. Go to the SQL Editor tab
    3. Copy and execute the contents of 'supabase-schema.sql' file in the SQL Editor
    4. This will create all necessary tables, indexes, and security policies

    For more details, see DATABASE_SETUP.md in your project root.
  `);
};
