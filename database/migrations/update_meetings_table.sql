-- Migration to update meetings table to match backend controller expectations
-- This script updates the existing meetings table structure

-- Add new columns if they don't exist
DO $$
BEGIN
    -- Check and add meeting_date column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetings' AND column_name = 'meeting_date'
    ) THEN
        ALTER TABLE meetings ADD COLUMN meeting_date DATE;
    END IF;

    -- Check and add start_time column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetings' AND column_name = 'start_time'
    ) THEN
        ALTER TABLE meetings ADD COLUMN start_time TIME;
    END IF;

    -- Check and add end_time column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetings' AND column_name = 'end_time'
    ) THEN
        ALTER TABLE meetings ADD COLUMN end_time TIME;
    END IF;

    -- Check and add google_meet_link column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetings' AND column_name = 'google_meet_link'
    ) THEN
        ALTER TABLE meetings ADD COLUMN google_meet_link TEXT;
    END IF;

    -- Check and add status column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetings' AND column_name = 'status'
    ) THEN
        ALTER TABLE meetings ADD COLUMN status VARCHAR(20) DEFAULT 'SCHEDULED';
    END IF;

    -- Check and add notes column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetings' AND column_name = 'notes'
    ) THEN
        ALTER TABLE meetings ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Migrate data from old columns to new columns if they exist
UPDATE meetings 
SET meeting_date = scheduled_start::date,
    start_time = scheduled_start::time,
    end_time = COALESCE(scheduled_end::time, scheduled_start::time + INTERVAL '1 hour')
WHERE meeting_date IS NULL AND scheduled_start IS NOT NULL;

-- Drop old columns if they exist
DO $$
BEGIN
    -- Drop meeting_link column if google_meet_link exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetings' AND column_name = 'meeting_link'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetings' AND column_name = 'google_meet_link'
    ) THEN
        ALTER TABLE meetings DROP COLUMN meeting_link;
    END IF;

    -- Drop scheduled_start column if meeting_date and start_time exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetings' AND column_name = 'scheduled_start'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetings' AND column_name = 'meeting_date'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetings' AND column_name = 'start_time'
    ) THEN
        ALTER TABLE meetings DROP COLUMN scheduled_start;
    END IF;

    -- Drop scheduled_end column if end_time exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetings' AND column_name = 'scheduled_end'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetings' AND column_name = 'end_time'
    ) THEN
        ALTER TABLE meetings DROP COLUMN scheduled_end;
    END IF;

    -- Drop notes_url column if notes exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetings' AND column_name = 'notes_url'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetings' AND column_name = 'notes'
    ) THEN
        ALTER TABLE meetings DROP COLUMN notes_url;
    END IF;
END $$;

-- Make new columns NOT NULL after data migration
ALTER TABLE meetings 
    ALTER COLUMN meeting_date SET NOT NULL,
    ALTER COLUMN start_time SET NOT NULL,
    ALTER COLUMN end_time SET NOT NULL;

-- Add default status for existing records
UPDATE meetings SET status = 'SCHEDULED' WHERE status IS NULL;
