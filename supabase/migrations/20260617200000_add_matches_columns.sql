-- Add missing columns to matches table for scorers and formation
-- This migration ensures the matches table has all necessary columns for match results

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'matches' AND column_name = 'scorers'
    ) THEN
        ALTER TABLE matches ADD COLUMN scorers TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'matches' AND column_name = 'formation'
    ) THEN
        ALTER TABLE matches ADD COLUMN formation TEXT DEFAULT '4-3-3';
    END IF;
END $$;
