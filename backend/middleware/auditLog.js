import { supabase } from '../config/db.js';

// Fields that must never be stored in audit logs
const SENSITIVE_FIELDS = new Set(['password', 'confirmPassword', 'token', 'refreshToken', 'secret']);

const sanitizeBody = (body) => {
    if (!body || typeof body !== 'object') return null;
    const clean = { ...body };
    for (const key of Object.keys(clean)) {
        if (SENSITIVE_FIELDS.has(key)) {
            delete clean[key];
        } else if (Array.isArray(clean[key])) {
            clean[key] = clean[key].map((item) =>
                typeof item === 'object' ? sanitizeBody(item) : item
            );
        } else if (typeof clean[key] === 'object' && clean[key] !== null) {
            clean[key] = sanitizeBody(clean[key]);
        }
    }
    return clean;
};

/**
 * Derives a human-readable entity type from the request URL.
 * e.g.  /api/products/123  →  "product"
 *        /api/stock/in      →  "stock"
 */
const getEntityType = (path) => {
    const segments = path.replace(/^\/api\//, '').split('/');
    const base = segments[0] || 'unknown';
    // Normalise plurals to singular for display
    const singular = base.replace(/ies$/, 'y').replace(/s$/, '');
    return singular;
};

/**
 * Derives the entity id from the request params or response body.
 */
const getEntityId = (req, responseBody) => {
    if (req.params?.id) return req.params.id;
    if (req.params?.productId) return req.params.productId;
    // For POST create operations the id comes from the server response
    if (responseBody?.id) return String(responseBody.id);
    if (responseBody?._id) return String(responseBody._id);
    return null;
};

const METHOD_ACTION_MAP = {
    POST: 'CREATE',
    PUT: 'UPDATE',
    PATCH: 'UPDATE',
    DELETE: 'DELETE',
};

/**
 * Audit log middleware — attach to router or globally.
 * Intercepts POST / PUT / PATCH / DELETE responses and writes a row to audit_logs
 * asynchronously after the response is sent (fire-and-forget, non-blocking).
 *
 * IMPORTANT: Must be placed AFTER auth middleware (protect) so req.user is set.
 */
export const auditLog = (req, res, next) => {
    const action = METHOD_ACTION_MAP[req.method];
    if (!action) return next(); // skip GET / HEAD / OPTIONS

    // Skip auth endpoints to avoid logging credential attempts
    if (req.path.includes('/login') || req.path.includes('/register')) return next();

    const originalJson = res.json.bind(res);

    res.json = function (data) {
        // Only log successful mutations (2xx)
        if (res.statusCode >= 200 && res.statusCode < 300) {
            const logEntry = {
                user_id: req.user?.id || req.user?._id || null,
                user_name: req.user?.name || req.user?.email || 'unknown',
                user_role: req.user?.role || null,
                action,
                entity_type: getEntityType(req.path),
                entity_id: getEntityId(req, data),
                request_body: sanitizeBody(req.body),
                ip_address:
                    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
                    req.socket?.remoteAddress ||
                    null,
                status_code: res.statusCode,
            };

            // Fire-and-forget — don't block the response
            supabase
                .from('audit_logs')
                .insert(logEntry)
                .then(({ error }) => {
                    if (error) console.error('[AuditLog] write error:', error.message);
                });
        }

        return originalJson(data);
    };

    next();
};
