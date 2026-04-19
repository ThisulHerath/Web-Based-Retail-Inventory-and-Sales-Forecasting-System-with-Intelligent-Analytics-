# Session Timeout Implementation Guide (5 Minutes)

## Overview
This document outlines which files control session timeout and the implementation steps for both admin and customer sessions.

---

## 📋 Files That Control Session Timeout

### **BACKEND FILES**

#### 1. **`backend/controllers/authController.js`** (Admin Token Generation)
- **Current Setting**: `expiresIn: '30d'` (Line 16)
- **Function**: `generateToken(id)` - Creates JWT token for admin users
- **What to Change**: Set `expiresIn: '5m'` (5 minutes)
- **Impact**: Token expires server-side after 5 minutes

#### 2. **`backend/controllers/customerController.js`** (Customer Token Generation)
- **Current Setting**: `expiresIn: '30d'` (Line 24)
- **Function**: `generateToken(id)` - Creates JWT token for customers
- **What to Change**: Set `expiresIn: '5m'` (5 minutes)
- **Impact**: Token expires server-side after 5 minutes

#### 3. **`backend/middleware/auth.js`** (Admin Token Verification)
- **Purpose**: Verifies admin JWT tokens on protected routes
- **What Happens**: When token expires, `jwt.verify()` throws error, returns 401
- **Status**: ✅ Already handles expired tokens correctly

#### 4. **`backend/middleware/customerAuth.js`** (Customer Token Verification)
- **Purpose**: Verifies customer JWT tokens on protected routes
- **What Happens**: When token expires, `jwt.verify()` throws error, returns 401
- **Status**: ✅ Already handles expired tokens correctly

---

### **FRONTEND FILES - ADMIN**

#### 1. **`frontend/src/context/AuthContext.jsx`** (Admin Session State)
- **Current**: No inactivity timeout logic
- **Stores**: Token & user data in localStorage
- **What to Add**:
  - Inactivity timer (5 minutes = 300,000 ms)
  - Activity listeners (mouse, keyboard, scroll)
  - Auto-logout on timeout
  - Warning modal before logout

#### 2. **`frontend/src/services/api.js`** (Admin API Interceptor)
- **Current**: Handles 401 errors by clearing localStorage
- **Good**: Already clears token on unauthorized response
- **Status**: ✅ Works correctly with token expiry

#### 3. **`frontend/src/pages/admin/Login.jsx`** (Admin Login Page)
- **Purpose**: Admin login entry point
- **Status**: ✅ No changes needed (will redirect on 401)

---

### **FRONTEND FILES - CUSTOMER**

#### 1. **`frontend/src/context/CustomerContext.jsx`** (Customer Session State)
- **Current**: No inactivity timeout logic
- **Stores**: Token & customer data in localStorage
- **What to Add**:
  - Inactivity timer (5 minutes = 300,000 ms)
  - Activity listeners (mouse, keyboard, scroll)
  - Auto-logout on timeout
  - Warning modal before logout

#### 2. **`frontend/src/pages/customer/CustomerLogin.jsx`** (Customer Login Page)
- **Purpose**: Customer login entry point
- **Status**: ✅ No changes needed (will redirect on 401)

---

## 🔧 Implementation Checklist

### Phase 1: Backend Changes (Token Expiry)
- [ ] `backend/controllers/authController.js` - Change Line 16 from `'30d'` to `'5m'`
- [ ] `backend/controllers/customerController.js` - Change Line 24 from `'30d'` to `'5m'`
- [ ] Test with expired tokens

### Phase 2: Frontend - Create Timeout Utility
- [ ] Create `frontend/src/utils/sessionTimeout.js` - Reusable inactivity tracking logic
- [ ] Implement activity listener setup
- [ ] Implement activity reset function
- [ ] Implement logout callback

### Phase 3: Frontend - Admin Session Timeout
- [ ] Update `frontend/src/context/AuthContext.jsx`
  - Add inactivity state
  - Add activity listeners
  - Add auto-logout logic
  - Add warning modal state
- [ ] Create `frontend/src/components/SessionTimeoutWarning.jsx` - Warning modal component

### Phase 4: Frontend - Customer Session Timeout
- [ ] Update `frontend/src/context/CustomerContext.jsx`
  - Add inactivity state
  - Add activity listeners
  - Add auto-logout logic
  - Add warning modal state

### Phase 5: Testing
- [ ] Test admin login and 5-minute inactivity logout
- [ ] Test customer login and 5-minute inactivity logout
- [ ] Test activity resets timer
- [ ] Test warning modal
- [ ] Test manual logout still works

---

## 📊 Session Timeout Flow Diagram

```
User Logs In
    ↓
Token Created (JWT expiresIn: '5m')
    ↓
Stored in localStorage (with timestamp)
    ↓
Activity Listeners Activate (mouse, keyboard, scroll)
    ↓
User Inactive for 4 minutes → Show Warning Modal
    ↓
User Inactive for 5 minutes total → Auto Logout
    ↓
Clear localStorage → Redirect to Login
    ↓
Browser makes API request with expired token
    ↓
Backend returns 401 (Unauthorized)
    ↓
Frontend: Confirm logout & redirect

OR

User Activity Detected
    ↓
Reset inactivity counter
    ↓
Timer restarts (5 minutes from now)
```

---

## 🎯 Token Expiration vs Inactivity Timeout

### Token Expiry (JWT expiresIn)
- **Handled by**: Backend (JWT claim)
- **When**: Token becomes invalid after set time
- **5min Example**: Token valid for 5 minutes from issuance, even if user active

### Inactivity Timeout UI (Frontend)
- **Handled by**: Frontend JavaScript
- **When**: No user activity for set time
- **5min Example**: No mouse/keyboard/scroll for 5 minutes → show warning → logout

**Best Practice**: 
- Token expiry: 5 minutes (backend)
- Inactivity warning: 4 minutes (frontend)
- Auto-logout: 5 minutes (frontend)
- This gives user 1 minute to confirm they want to stay logged in

---

## 🚀 Quick Reference Summary

| Component | File | Change Type | Current | New |
|-----------|------|------------|---------|-----|
| Admin Token | `authController.js:16` | expiresIn | `'30d'` | `'5m'` |
| Customer Token | `customerController.js:24` | expiresIn | `'30d'` | `'5m'` |
| Admin Context | `AuthContext.jsx` | Add Logic | None | Timer + Listeners |
| Customer Context | `CustomerContext.jsx` | Add Logic | None | Timer + Listeners |
| Token Verify (Admin) | `auth.js` | ✅ Ready | Works | Works |
| Token Verify (Customer) | `customerAuth.js` | ✅ Ready | Works | Works |

---

## 🔐 Security Considerations

1. **Token Becomes Invalid on Backend**: After 5 minutes, token is rejected by JWT
2. **Frontend Logout**: Clears localStorage before manual requests
3. **API Interceptor**: Catches 401 and auto-redirects to login
4. **Activity Tracking**: Only client-side (no server overhead)
5. **Warning Modal**: Gives user choice to stay or logout

---

## 📝 Environment Variables

No new environment variables needed. Uses existing:
- `JWT_SECRET` - Admin tokens
- `CUSTOMER_JWT_SECRET` - Customer tokens

---

## ⚠️ Important Notes

1. **Token Expiry is Server-Side**: Even if user stays in browser, token expires
2. **Inactivity Timeout is UI-Side**: Tracks user activity on frontend
3. **Both Should Work Together**: Token expiry as security, UI timeout for UX
4. **LocalStorage Persists**: Refresh page won't logout user if token still valid
5. **API Calls with Expired Token**: Return 401, triggering logout

---

## 📖 Next Steps

1. Review this document with your team
2. Implement Phase 1 (Backend token changes)
3. Create utilities (Phase 2)
4. Implement context updates (Phases 3-4)
5. Thoroughly test (Phase 5)
6. Deploy to production

---

**Last Updated**: April 19, 2026
**Implementation Difficulty**: Medium
**Estimated Time**: 2-3 hours
