import { supabase } from '../config/db.js';

const TABLE = 'sales_audit';

const SalesAudit = {
    async create(auditData) {
        const row = {
            sale_id: auditData.saleId,
            user_id: auditData.userId,
            user_name: auditData.userName,
            user_role: auditData.userRole,
            action: auditData.action, // CREATE, UPDATE, DELETE
            changes: auditData.changes || {}, // JSON object with before/after values
            reason: auditData.reason || null,
            ip_address: auditData.ipAddress || null,
            status_code: auditData.statusCode || 200,
        };

        const { data, error } = await supabase.from(TABLE).insert(row).select().single();
        if (error) throw error;
        return data;
    },

    async findBySaleId(saleId, options = {}) {
        let q = supabase.from(TABLE).select('*').eq('sale_id', saleId);
        q = q.order('created_at', { ascending: false });
        
        if (options.limit) q = q.limit(options.limit);
        
        const { data, error } = await q;
        if (error) throw error;
        return data || [];
    },

    async find(query = {}, options = {}) {
        let q = supabase.from(TABLE).select('*');

        if (query.action) {
            q = q.eq('action', query.action);
        }

        if (query.userId) {
            q = q.eq('user_id', query.userId);
        }

        if (query.saleId) {
            q = q.eq('sale_id', query.saleId);
        }

        if (query.startDate || query.endDate) {
            if (query.startDate) {
                q = q.gte('created_at', query.startDate.toISOString());
            }
            if (query.endDate) {
                q = q.lte('created_at', query.endDate.toISOString());
            }
        }

        q = q.order('created_at', { ascending: false });

        if (options.skip) {
            q = q.range(options.skip, options.skip + (options.limit || 10) - 1);
        } else if (options.limit) {
            q = q.limit(options.limit);
        }

        const { data, error } = await q;
        if (error) throw error;
        return data || [];
    },

    async count(query = {}) {
        let q = supabase.from(TABLE).select('id', { count: 'exact', head: true });

        if (query.action) {
            q = q.eq('action', query.action);
        }

        if (query.userId) {
            q = q.eq('user_id', query.userId);
        }

        if (query.saleId) {
            q = q.eq('sale_id', query.saleId);
        }

        if (query.startDate) {
            q = q.gte('created_at', query.startDate.toISOString());
        }

        if (query.endDate) {
            q = q.lte('created_at', query.endDate.toISOString());
        }

        const { count, error } = await q;
        if (error) throw error;
        return count || 0;
    },

    format(data) {
        if (!data) return null;
        return {
            id: data.id,
            saleId: data.sale_id,
            userId: data.user_id,
            userName: data.user_name,
            userRole: data.user_role,
            action: data.action,
            changes: data.changes,
            reason: data.reason,
            ipAddress: data.ip_address,
            statusCode: data.status_code,
            createdAt: data.created_at,
        };
    },
};

export default SalesAudit;
