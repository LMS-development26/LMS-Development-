-- Migration to update learning_materials table schema
-- Run this to update existing databases to match the new schema

-- Add new columns
ALTER TABLE learning_materials 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS external_url TEXT,
ADD COLUMN IF NOT EXISTS file_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 1;

-- Rename columns to match new naming convention
DO $$
BEGIN
    -- Rename material_type to type if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'learning_materials' AND column_name = 'material_type') THEN
        ALTER TABLE learning_materials RENAME COLUMN material_type TO type;
    END IF;
    
    -- Rename file_url to s3_url if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'learning_materials' AND column_name = 'file_url') THEN
        ALTER TABLE learning_materials RENAME COLUMN file_url TO s3_url;
    END IF;
    
    -- Rename file_size to file_size_bytes if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'learning_materials' AND column_name = 'file_size') THEN
        ALTER TABLE learning_materials RENAME COLUMN file_size TO file_size_bytes;
    END IF;
END $$;

-- Update display_order for existing records
UPDATE learning_materials SET display_order = 1 WHERE display_order IS NULL;