-- Add first-login password enforcement flag for staff users.
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_change_required BOOLEAN NOT NULL DEFAULT FALSE;

-- For existing staff, keep current behavior (no forced reset) unless manually reset by admin.
UPDATE users
SET password_change_required = FALSE
WHERE password_change_required IS NULL;
