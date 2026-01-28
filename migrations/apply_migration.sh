#!/bin/bash

# Migration to fix attendance_records unique constraint
# This script applies the constraint needed for ON CONFLICT upsert operations

echo "Applying migration: add_attendance_unique_constraint"
echo "========================================="
echo ""
echo "This migration adds a unique constraint to the attendance_records table"
echo "to enable upsert operations for attendance marking."
echo ""
echo "SQL to be executed:"
echo "ALTER TABLE public.attendance_records ADD CONSTRAINT unique_attendance UNIQUE (user_id, subject_id, date);"
echo ""
echo "Please run this SQL in your Supabase SQL Editor:"
echo "1. Go to Supabase Dashboard > SQL Editor"
echo "2. Run the migration SQL from: migrations/add_attendance_unique_constraint.sql"
echo "3. Or run it manually using psql"
echo ""
