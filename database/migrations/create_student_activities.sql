-- Create student_activities table for tracking student actions
-- This table will track various student activities like enrollments, lesson completions, etc.

-- Create enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE activity_type AS ENUM (
        'ENROLLED',
        'COMPLETED_LESSON', 
        'COMPLETED_COURSE',
        'SUBMITTED_ASSIGNMENT',
        'COMPLETED_QUIZ',
        'VIEWED_MATERIAL',
        'JOINED_MEETING',
        'EARNED_CERTIFICATE',
        'PROFILE_UPDATE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS student_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    user_id UUID NOT NULL,
    
    activity_type activity_type NOT NULL,
    
    message TEXT NOT NULL,
    
    course_id UUID, -- Optional: relevant course if activity is course-related
    
    metadata JSONB DEFAULT '{}', -- Additional data like lesson_id, assignment_id, etc.
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_activity_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
        
    CONSTRAINT fk_activity_course 
        FOREIGN KEY (course_id) 
        REFERENCES courses(id) 
        ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX idx_activities_user_created ON student_activities(user_id, created_at DESC);
CREATE INDEX idx_activities_type ON student_activities(activity_type);
CREATE INDEX idx_activities_course ON student_activities(course_id);

-- Add comments for documentation
COMMENT ON TABLE student_activities IS 'Tracks student activities and actions for dashboard and analytics';
COMMENT ON COLUMN student_activities.activity_type IS 'Type of activity performed by student';
COMMENT ON COLUMN student_activities.message IS 'Human-readable description of the activity';
COMMENT ON COLUMN student_activities.metadata IS 'Additional context data (lesson_id, score, etc.)';