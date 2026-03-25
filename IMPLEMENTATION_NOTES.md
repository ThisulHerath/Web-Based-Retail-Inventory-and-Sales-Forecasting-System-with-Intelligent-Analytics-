# Activity Logs & Last Login Feature - Implementation Guide

## Features Implemented

### 1. **Last Login Date Column Display** ✅
   - Added "Last Login" column to the User Management table
   - Displays last login date and time for each user (or "Never" if not logged in)
   - Formatted as: "Mar 23, 2026, 12:20:27 PM"
   - Helps identify inactive accounts at a glance

### 2. **Activity Log / Audit Trail Viewer** ✅
   - New modal dialog to view detailed activity logs for each employee
   - Shows all actions performed by the user (CREATE, UPDATE, DELETE)
   - Displays:
     - Action type (with color-coded badges)
     - Entity type (what was being modified)
     - Entity ID (which item was modified)
     - Date & time of action
     - HTTP status code
     - IP address from which action was performed
   - Filterable by:
     - Action type (Create, Update, Delete)
     - Entity type (Products, Sales, etc.)
     - Date range (from/to)
   - Paginated results (20 items per page)

## Files Modified

### Backend Changes
1. **models/User.js**
   - Added `last_login_date` field to the user format method
   - Updated select queries to include `last_login_date` when excluding password
   - Users now return: `lastLoginDate` property

### Frontend Changes
1. **pages/users/Users.jsx**
   - Added Activity icon import from lucide-react
   - Added state for activity log modal and selected user
   - Added "Last Login" column header to table
   - Added "Last Login" data cell showing formatted date (or "Never")
   - Added Activity Log button in actions column
   - Added ActivityLogModal component

2. **pages/users/ActivityLogModal.jsx** (NEW FILE)
   - Complete modal component for viewing activity logs
   - Fetches audit logs filtered by user ID
   - Includes filters for action type, entity type, and date range
   - Displays results in a paginated table
   - Color-coded action badges (Green=Create, Blue=Update, Red=Delete)
   - Status code color coding (Green=2xx, Yellow=3xx, Red=4xx/5xx)
   - IP address and timestamp for each action

3. **services/userService.js**
   - Added `getAuditLogs()` function to fetch paginated audit logs with filters
   - Added `getAuditEntityTypes()` function to get available entity types (for future dropdown)

## Database Requirements

The database must have the following:

### Users Table Addition
```sql
ALTER TABLE users
ADD COLUMN last_login_date TIMESTAMPTZ DEFAULT NULL;
```

### Audit Logs Table (Already Exists)
The `audit_logs` table must contain:
- id (UUID)
- user_id (FK to users)
- user_name (VARCHAR)
- user_role (VARCHAR)
- action (VARCHAR - CREATE, UPDATE, DELETE)
- entity_type (VARCHAR)
- entity_id (VARCHAR)
- request_body (JSONB)
- ip_address (VARCHAR)
- status_code (INTEGER)
- created_at (TIMESTAMPTZ)

## API Endpoints Used

1. **GET /api/users** - Fetch users list (already existing)
2. **GET /api/audit** - Fetch audit logs with filters
   - Query parameters:
     - `userId` - Filter by user ID
     - `entityType` - Filter by entity type
     - `action` - Filter by action (CREATE, UPDATE, DELETE)
     - `from` - Filter by start date
     - `to` - Filter by end date
     - `page` - Pagination page
     - `limit` - Items per page (default: 50)

3. **GET /api/audit/entity-types** - Get distinct entity types (for future use)

## Frontend Routes

- **User Management Page**: `/admin/users`
  - Main page showing all users with Last Login column
  - Activity Log button for each user opens the modal
  - All existing functionality preserved (Edit, Delete, Resend Email)

## Usage Instructions

### For Admins:

1. **View User List with Last Login**:
   - Navigate to User Management
   - See "Last Login" column showing when each user last logged in
   - "Never" indicates user has never logged in

2. **View Activity Log for a User**:
   - Click the Activity icon (calendar clock) in the Actions column
   - Modal opens showing all actions by that user
   - Use filters to narrow down results:
     - Select action type from dropdown
     - Type entity type to filter
     - Set date range with "From" and "To" fields
   - Browse through pages if results exceed 20 items

## Color Coding in Activity Log

**Actions**:
- 🟢 CREATE - Green badge
- 🔵 UPDATE - Blue badge
- 🔴 DELETE - Red badge

**Status Codes**:
- 🟢 2xx (200-299) - Green
- 🟡 3xx (300-399) - Yellow
- 🔴 4xx/5xx (400+) - Red

## Notes

- This feature requires the database to have the `last_login_date` column in the users table
- All audit routes are admin-only (protected by auth middleware and role verification)
- Activity logs are automatically recorded by the audit middleware on all database modifications
- The implementation is fully responsive and works on desktop and mobile devices
- No external API calls beyond the existing backend endpoints

## Future Enhancements

1. Export activity logs to CSV/PDF
2. Email notifications for suspicious activities
3. Average number of transactions per employee (dashboard stat)
4. Activity summary by day/week/month
5. "What changed" detailed view in the modal
6. Bulk export of all employees' activity logs
