import { supabase } from '../config/db.js';

// @desc    Get paginated audit logs with optional filters
// @route   GET /api/audit
// @access  Private (Admin only)
export const getAuditLogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            entityType,
            action,
            userId,
            from,
            to,
        } = req.query;

        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(200, Math.max(1, Number(limit)));
        const offset = (pageNum - 1) * limitNum;

        let query = supabase
            .from('audit_logs')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limitNum - 1);

        if (entityType) query = query.eq('entity_type', entityType);
        if (action) query = query.eq('action', action);
        if (userId) query = query.eq('user_id', userId);
        if (from) query = query.gte('created_at', from);
        if (to) query = query.lte('created_at', to);

        const { data, error, count } = await query;
        if (error) throw error;

        res.status(200).json({
            logs: data || [],
            total: count || 0,
            page: pageNum,
            totalPages: Math.ceil((count || 0) / limitNum),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get distinct entity types present in audit_logs (for filter dropdowns)
// @route   GET /api/audit/entity-types
// @access  Private (Admin only)
export const getAuditEntityTypes = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('entity_type')
            .order('entity_type');

        if (error) throw error;

        const uniqueTypes = [...new Set((data || []).map((r) => r.entity_type))];
        res.status(200).json({ entityTypes: uniqueTypes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
