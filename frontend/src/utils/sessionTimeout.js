/**
 * Session Timeout Utility
 * Manages inactivity timeout for both admin and customer sessions
 * Triggers warning at 4 minutes, auto-logout at 5 minutes
 */

const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const WARNING_TIME_MS = 4 * 60 * 1000; // 4 minutes (show warning 1 min before timeout)

export class SessionTimeoutManager {
    constructor(onWarning, onLogout) {
        this.inactivityTimeout = null;
        this.warningTimeout = null;
        this.onWarning = onWarning;
        this.onLogout = onLogout;
        this.isWarningShown = false;
    }

    /**
     * Start session timeout tracking
     */
    startTracking() {
        this.resetInactivityTimer();
        this.attachActivityListeners();
    }

    /**
     * Stop session timeout tracking
     */
    stopTracking() {
        this.clearTimers();
        this.detachActivityListeners();
        this.isWarningShown = false;
    }

    /**
     * Attach listeners to detect user activity
     */
    attachActivityListeners() {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, this.handleActivity, true);
        });
    }

    /**
     * Detach activity listeners
     */
    detachActivityListeners() {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.removeEventListener(event, this.handleActivity, true);
        });
    }

    /**
     * Handle user activity - reset the timer
     */
    handleActivity = () => {
        // Only reset if warning hasn't been shown
        if (!this.isWarningShown) {
            this.resetInactivityTimer();
        }
    };

    /**
     * Reset the inactivity timer
     */
    resetInactivityTimer() {
        // Clear existing timers
        this.clearTimers();
        this.isWarningShown = false;

        // Set warning timeout (4 minutes)
        this.warningTimeout = setTimeout(() => {
            this.isWarningShown = true;
            if (this.onWarning) {
                this.onWarning();
            }
        }, WARNING_TIME_MS);

        // Set logout timeout (5 minutes)
        this.inactivityTimeout = setTimeout(() => {
            this.performLogout();
        }, SESSION_TIMEOUT_MS);
    }

    /**
     * Clear all timers
     */
    clearTimers() {
        if (this.warningTimeout) {
            clearTimeout(this.warningTimeout);
            this.warningTimeout = null;
        }
        if (this.inactivityTimeout) {
            clearTimeout(this.inactivityTimeout);
            this.inactivityTimeout = null;
        }
    }

    /**
     * Perform logout
     */
    performLogout() {
        this.clearTimers();
        this.detachActivityListeners();
        if (this.onLogout) {
            this.onLogout();
        }
    }

    /**
     * Extend session (called when user chooses to stay logged in)
     */
    extendSession() {
        this.isWarningShown = false;
        this.resetInactivityTimer();
        return true;
    }

    /**
     * Get remaining time in milliseconds
     */
    getRemainingTime() {
        if (!this.inactivityTimeout) {
            return 0;
        }
        // Approximate remaining time
        return SESSION_TIMEOUT_MS;
    }
}

/**
 * Create a session timeout manager instance
 * @param {Function} onWarning - Callback when warning should be shown
 * @param {Function} onLogout - Callback when session should end
 * @returns {SessionTimeoutManager}
 */
export const createSessionTimeout = (onWarning, onLogout) => {
    return new SessionTimeoutManager(onWarning, onLogout);
};
