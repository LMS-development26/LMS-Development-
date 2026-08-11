-- Add progress tracking fields to enrollments table
-- This migration adds fields to track course progress and last access time

ALTER TABLE enrollments 
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add index for performance on student_id and progress queries
CREATE INDEX IF NOT EXISTS idx_enrollments_student_progress 
ON enrollments(student_id, progress_percentage);

-- Add index for last access queries
CREATE INDEX IF NOT EXISTS idx_enrollments_last_accessed 
ON enrollments(last_accessed_at DESC);

-- Add comment to document the new fields
COMMENT ON COLUMN enrollments.progress_percentage IS 'Overall progress percentage for the course (0-100)';
COMMENT ON COLUMN enrollments.last_accessed_at IS 'Timestamp when student last accessed the course';