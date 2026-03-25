-- =====================================================
-- Migration: Add Last Login Date to Users Table
-- Date: March 2026
-- Description: Adds last_login_date column to users table
-- for tracking user activity and identifying inactive accounts
-- =====================================================

-- Add last_login_date column if it doesn't exist
ALTER TABLE IF EXISTS users
ADD COLUMN IF NOT EXISTS last_login_date TIMESTAMPTZ DEFAULT NULL;

-- Optional: Create an index on last_login_date for faster queries
CREATE INDEX IF NOT EXISTS idx_users_last_login_date ON users(last_login_date DESC);

-- Optional: Set last_login_date based on audit logs for existing users
-- This will set the last_login_date to the most recent audit log action
UPDATE users 
SET last_login_date = (
    SELECT created_at 
    FROM audit_logs 
    WHERE audit_logs.user_id = users.id 
    ORDER BY created_at DESC 
    LIMIT 1
)
WHERE last_login_date IS NULL 
AND EXISTS (
    SELECT 1 FROM audit_logs WHERE audit_logs.user_id = users.id
);

-- Verify the column was added successfully
-- SELECT id, name, email, last_login_date FROM users LIMIT 5;
