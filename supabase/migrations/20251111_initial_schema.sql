-- ========================================
-- Initial Schema for Random Journey Generator
-- Created: 2025-11-11
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- Table: search_histories
-- Purpose: Store user search history with session-based tracking
-- ========================================
CREATE TABLE IF NOT EXISTS search_histories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL,
  departure_station TEXT NOT NULL,
  destination_station TEXT NOT NULL,
  jorudan_link TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for session_id lookups
CREATE INDEX idx_search_histories_session_id ON search_histories(session_id);

-- Index for created_at for cleanup queries
CREATE INDEX idx_search_histories_created_at ON search_histories(created_at);

-- ========================================
-- Table: announcements
-- Purpose: Store system announcements with visibility control
-- ========================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  content TEXT NOT NULL CHECK (char_length(content) <= 5000),
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'maintenance')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Composite index for active announcements queries
CREATE INDEX idx_announcements_active_dates
ON announcements(is_active, start_date, end_date)
WHERE is_active = true;

-- ========================================
-- Function: update_updated_at_column
-- Purpose: Automatically update updated_at on row modification
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for announcements table
CREATE TRIGGER update_announcements_updated_at
BEFORE UPDATE ON announcements
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Function: delete_old_search_histories
-- Purpose: Delete search histories older than 30 days
-- ========================================
CREATE OR REPLACE FUNCTION delete_old_search_histories()
RETURNS void AS $$
BEGIN
  DELETE FROM search_histories
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Row Level Security (RLS) Policies
-- ========================================

-- Enable RLS on search_histories
ALTER TABLE search_histories ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own session's history
CREATE POLICY search_histories_select_policy
ON search_histories
FOR SELECT
USING (
  session_id = COALESCE(
    (current_setting('request.headers', true)::json->>'x-session-id')::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  )
);

-- Policy: Users can insert with their own session_id
CREATE POLICY search_histories_insert_policy
ON search_histories
FOR INSERT
WITH CHECK (
  session_id = COALESCE(
    (current_setting('request.headers', true)::json->>'x-session-id')::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  )
);

-- Policy: Users can delete their own session's history
CREATE POLICY search_histories_delete_policy
ON search_histories
FOR DELETE
USING (
  session_id = COALESCE(
    (current_setting('request.headers', true)::json->>'x-session-id')::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  )
);

-- Enable RLS on announcements (read-only for all users)
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active announcements
CREATE POLICY announcements_select_policy
ON announcements
FOR SELECT
USING (
  is_active = true
  AND start_date <= NOW()
  AND (end_date IS NULL OR end_date > NOW())
);

-- ========================================
-- Comments for documentation
-- ========================================
COMMENT ON TABLE search_histories IS 'Stores user search history with anonymous session tracking';
COMMENT ON TABLE announcements IS 'System announcements with time-based visibility control';
COMMENT ON FUNCTION delete_old_search_histories() IS 'Scheduled function to clean up search histories older than 30 days';
COMMENT ON FUNCTION update_updated_at_column() IS 'Trigger function to automatically update updated_at timestamp';
