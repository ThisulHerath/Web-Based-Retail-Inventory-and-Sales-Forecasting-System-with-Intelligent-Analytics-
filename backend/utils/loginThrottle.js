const DEFAULT_STAFF_WINDOW_MS = 60 * 1000;
const DEFAULT_CUSTOMER_WINDOW_MS = 60 * 1000;
const DEFAULT_MAX_ATTEMPTS = 8;

const attemptStore = new Map();

const getWindowMs = (scope = 'staff') => {
    if (scope === 'customer') {
        return Number(process.env.CUSTOMER_LOGIN_THROTTLE_WINDOW_MS || DEFAULT_CUSTOMER_WINDOW_MS);
    }

    return Number(process.env.STAFF_LOGIN_THROTTLE_WINDOW_MS || DEFAULT_STAFF_WINDOW_MS);
};
const getMaxAttempts = () => Number(process.env.LOGIN_THROTTLE_MAX_ATTEMPTS || DEFAULT_MAX_ATTEMPTS);

export const getLoginAttemptKey = (req, email, scope = 'staff') => {
    const forwarded = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    const ip = forwarded || req.socket?.remoteAddress || 'unknown';
    const normalizedEmail = String(email || '').toLowerCase().trim() || 'unknown';
    return `${scope}|${ip}|${normalizedEmail}`;
};

const resetIfExpired = (entry, now, windowMs) => {
    if (!entry) return null;
    if (now - entry.firstAttempt > windowMs) {
        return null;
    }
    return entry;
};

export const isLoginBlocked = (key, scope = 'staff') => {
    const now = Date.now();
    const windowMs = getWindowMs(scope);
    const entry = resetIfExpired(attemptStore.get(key), now, windowMs);

    if (!entry) {
        attemptStore.delete(key);
        return false;
    }

    if (entry.blockedUntil && entry.blockedUntil > now) {
        return true;
    }

    if (entry.blockedUntil && entry.blockedUntil <= now) {
        attemptStore.delete(key);
        return false;
    }

    return entry.count >= getMaxAttempts();
};

export const recordFailedLogin = (key, scope = 'staff') => {
    const now = Date.now();
    const windowMs = getWindowMs(scope);
    const maxAttempts = getMaxAttempts();

    let entry = resetIfExpired(attemptStore.get(key), now, windowMs);

    if (!entry) {
        entry = { count: 1, firstAttempt: now, blockedUntil: null };
    } else {
        entry.count += 1;
    }

    if (entry.count >= maxAttempts) {
        entry.blockedUntil = now + windowMs;
    }

    attemptStore.set(key, entry);
    return entry;
};

export const recordSuccessfulLogin = (key) => {
    attemptStore.delete(key);
};

export const getRetryAfterSeconds = (key) => {
    const entry = attemptStore.get(key);
    if (!entry?.blockedUntil) return 0;
    return Math.max(0, Math.ceil((entry.blockedUntil - Date.now()) / 1000));
};
