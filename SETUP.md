# CSE 6th Semester Attendance Tracker - Setup Guide

## Quick Start

This guide helps you set up the attendance tracker with real CSE 6th semester data.

## Prerequisites

- Supabase account and project
- Node.js installed
- Environment variables configured in `.env`

## Step 1: Database Setup

### Apply the Schema

1. Open your Supabase project dashboard: https://app.supabase.com
2. Navigate to **SQL Editor** (left sidebar)
3. Create a new query
4. Copy the entire contents of `supabase-schema.sql` from this project
5. Paste into the SQL editor
6. Click **Run** to execute

This will create:

- `user_profiles` table
- `attendance_records` table
- `semester_configurations` table
- All necessary indexes and security policies

### Verify Tables Created

Run this query in SQL Editor to verify:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see the three tables listed above.

## Step 2: Environment Setup

Ensure your `.env` file has the correct Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Run the Application

```bash
npm run dev
```

The app will start at http://localhost:4028

## Step 5: Test the Application

### Register a New User

1. Go to http://localhost:4028/register
2. Fill in the registration form:
   - **Full Name**: Your name
   - **Email**: your.email@example.com
   - **Password**: Minimum 8 characters
   - **College Name**: Your institution
   - **Current Semester**: Select **6th Semester** (important!)
   - **Degree Program**: B.Tech Computer Science
   - **Expected Graduation**: 2026

3. Click **Create Account**

> **Note**: When you select 6th semester, the system will automatically create a default semester configuration with CSE 6th semester subjects and timetable.

### Verify Auto-Configuration

1. After registration, go to **Semester Configuration** page
2. You should see all CSE 6th semester subjects:
   - IT930 - Data Mining & Warehousing
   - IT322 - AIML
   - IT321 - FLAT
   - IT920 - HCI
   - HS321/HS322 - French/Russian
   - Lab sessions for each

### Test Daily Attendance

1. Navigate to **Daily Attendance** page
2. Select today's date (or any weekday)
3. Verify the schedule matches the real CSE 6th semester timetable
4. Try marking attendance:
   - Click **Present** for a class
   - Click **Absent** for another
   - Click **Cancel** for a third
5. Refresh the page - attendance should persist

### Test Different Days

- **Monday**: Should show DM&W, AIML, FLAT, French/Russian
- **Tuesday**: Should show all 5 periods including HCI
- **Wednesday**: Should show DM&W (theory) + FLAT Lab + HCI Lab
- **Thursday**: Should show HCI + AIML Lab + French/Russian
- **Friday**: Should show AIML, FLAT, HCI + DM&W Lab
- **Saturday/Sunday**: Should show "No Classes Today"

## CSE 6th Semester Timetable Reference

The application uses this real timetable:

### Monday

- 9-10 AM: Data Mining & W. (IT930) - Class Room III (IT Dept)
- 11 AM-12 PM: AIML (IT322) - Class Room III (IT Dept)
- 12-1 PM: FLAT (IT321) - Class Room III (IT Dept)
- 2-3 PM: French/Russian (HS321/HS322) - Gallery 1/2 (GUIST)

### Tuesday

- 9-10 AM: Data Mining & W. (IT930) - Class Room III (IT Dept)
- 11 AM-12 PM: AIML (IT322) - Class Room III (IT Dept)
- 12-1 PM: FLAT (IT321) - Class Room III (IT Dept)
- 2-3 PM: HCI (IT920) - Class Room III (IT Dept)
- 4-5 PM: French/Russian (HS321/HS322) - Gallery 1/2 (GUIST)

### Wednesday

- 9-10 AM: Data Mining & W. (IT930) - Class Room III (IT Dept)
- 11 AM-1 PM: FLAT Lab (IT321 Lab) - Lab 1 (IT Dept)
- 2-4 PM: HCI Lab (IT920 Lab) - Lab 2 (IT Dept)

### Thursday

- 10-11 AM: HCI (IT920) - Class Room III (IT Dept)
- 11 AM-1 PM: AIML Lab (IT322 Lab) - Lab 2 (IT Dept)
- 3-4 PM: French/Russian (HS321/HS322) - Gallery 1/2 (GUIST)

### Friday

- 11 AM-12 PM: AIML (IT322) - Class Room III (IT Dept)
- 12-1 PM: FLAT (IT321) - Class Room III (IT Dept)
- 2-3 PM: HCI (IT920) - Class Room III (IT Dept)
- 3-5 PM: Data Mining & W. Lab (IT930 Lab) - Lab 2 (IT Dept)

## Troubleshooting

### Issue: "Please configure your semester first"

**Solution**:

- Go to Semester Configuration page
- Click "Save Configuration" even if data is pre-filled
- This ensures the configuration is saved to database

### Issue: "Failed to fetch semester configuration"

**Solution**:

1. Check that database tables are created (Step 1)
2. Verify `.env` file has correct Supabase credentials
3. Check browser console for detailed errors
4. Ensure you're logged in

### Issue: No classes showing on daily attendance

**Solution**:

1. Check that you selected 6th semester during registration
2. Verify semester configuration exists
3. Ensure you're selecting a weekday (Mon-Fri), not weekend
4. Check that selected date is within semester period (Jan 15 - May 30, 2026)

### Issue: Attendance not persisting

**Solution**:

1. Check `attendance_records` table exists in Supabase
2. Verify Row Level Security (RLS) policies are enabled
3. Check browser console for API errors
4. Ensure user is properly authenticated

## Database Structure

### user_profiles

- Stores user account and academic information
- Linked to Supabase auth.users via `id`

### semester_configurations

- Stores subjects and weekly schedule
- JSONB field `subjects` contains array of subject objects
- JSONB field `schedule` contains day-wise schedule objects

### attendance_records

- Stores daily attendance records
- Linked to subjects via `subject_id`
- Status: 'present', 'absent', or 'late'

## For Other Semesters

To use this system for other semesters:

1. Create seed data in `src/lib/seedData.ts`:

   ```typescript
   export const getDefaultSemester5Config = () => {
     return {
       subjects: [...], // Your subjects
       schedule: {...}, // Your weekly schedule
     };
   };
   ```

2. Update `AuthContext.tsx` to check for your semester:

   ```typescript
   if (profileData.semester === '5') {
     const config = getDefaultSemester5Config();
     // ... save configuration
   }
   ```

3. Follow the same structure as CSE 6th semester data

## Support

For issues or questions:

1. Check the walkthrough document
2. Review implementation plan
3. Check browser console for errors
4. Verify database setup with SQL queries

## Success Criteria

✅ Database tables created  
✅ User registration works  
✅ Semester configuration auto-created  
✅ Daily schedule shows correct classes  
✅ Attendance can be marked and persists  
✅ Different schedules for different days

Enjoy your attendance tracker!
