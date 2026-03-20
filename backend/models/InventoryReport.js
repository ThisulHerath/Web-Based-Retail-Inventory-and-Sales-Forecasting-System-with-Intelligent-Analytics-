import { supabase } from '../config/db.js';

const TABLE = 'inventory_reports';

const InventoryReport = {
    format(row) {
        if (!row) return null;
        return {
            _id: row.id,
            id: row.id,
            title: row.title,
            fromDate: row.from_date,
            toDate: row.to_date,
            notes: row.notes || '',
            summary: row.summary || {
                totalActions: 0,
                stockInActions: 0,
                stockOutActions: 0,
                totalStockInQty: 0,
                totalStockOutQty: 0,
            },
            transactions: row.transactions || [],
            createdBy: row.created_by,
            updatedBy: row.updated_by,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    },

    async create(payload) {
        const row = {
            title: payload.title,
            from_date: payload.fromDate,
            to_date: payload.toDate,
            notes: payload.notes || '',
            summary: payload.summary,
            transactions: payload.transactions,
            created_by: payload.createdBy,
            updated_by: payload.updatedBy || payload.createdBy,
        };

        const { data, error } = await supabase.from(TABLE).insert(row).select('*').single();
        if (error) throw error;
        return InventoryReport.format(data);
    },

    async find(query = {}, options = {}) {
        let q = supabase.from(TABLE).select('*', { count: 'exact' }).order('created_at', { ascending: false });

        if (query.createdBy) q = q.eq('created_by', query.createdBy);

        if (options.limit) {
            const start = options.skip || 0;
            q = q.range(start, start + options.limit - 1);
        }

        const { data, error, count } = await q;
        if (error) throw error;

        return {
            data: (data || []).map(InventoryReport.format),
            count: count || 0,
        };
    },

    async findById(id) {
        const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return InventoryReport.format(data);
    },

    async updateById(id, updates) {
        const row = {
            title: updates.title,
            from_date: updates.fromDate,
            to_date: updates.toDate,
            notes: updates.notes || '',
            summary: updates.summary,
            transactions: updates.transactions,
            updated_by: updates.updatedBy,
        };

        const { data, error } = await supabase.from(TABLE).update(row).eq('id', id).select('*').single();
        if (error) throw error;
        return InventoryReport.format(data);
    },

    async deleteById(id) {
        const { error } = await supabase.from(TABLE).delete().eq('id', id);
        if (error) throw error;
    },
};

export default InventoryReport;
