# Database Setup Instructions

This document provides instructions for setting up the Supabase database for the Attendance Tracker application.

## Prerequisites

- A Supabase account and project
- Your Supabase project URL and anon key (already configured in .env)

## Database Schema Setup

1. Navigate to your Supabase project dashboard
2. Go to the SQL Editor tab
3. Copy and execute the contents of `supabase-schema.sql` file in the SQL Editor
4. This will create all necessary tables, indexes, and security policies

## Tables Created

1. **user_profiles**: Stores user profile information including name, college, semester, etc.
2. **attendance_records**: Stores daily attendance records for each user and subject
3. **semester_configurations**: Stores semester settings, subjects, and schedule configurations

## Security Policies

Row Level Security (RLS) is enabled on all tables with policies that ensure:
- Users can only access their own data
- Users can only modify their own records
- All operations require proper authentication

## Next Steps

After setting up the database:

1. Test the registration flow
2. Verify that user profiles are created correctly
3. Test the attendance tracking functionality
4. Verify that semester configurations are saved properly

## Troubleshooting

If you encounter issues:

1. Check that all tables were created successfully
2. Verify that RLS policies are enabled
3. Ensure your .env file has the correct Supabase credentials
4. Check browser console for any authentication errors
