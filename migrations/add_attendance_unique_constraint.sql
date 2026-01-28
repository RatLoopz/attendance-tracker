-- Fix attendance_records table constraint
-- This migration adds the missing unique constraint required for ON CONFLICT upsert

ALTER TABLE public.attendance_records 
ADD CONSTRAINT unique_attendance UNIQUE (user_id, subject_id, date);
