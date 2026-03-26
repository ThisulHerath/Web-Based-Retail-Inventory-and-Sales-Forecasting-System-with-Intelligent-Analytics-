import { supabase } from '../config/db.js';

const TABLE = 'walk_in_customers';

const WalkInCustomer = {
    async findById(id) {
        const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? WalkInCustomer.format(data) : null;
    },

    async findOne(query = {}) {
        let q = supabase.from(TABLE).select('*');
        if (query.phone) q = q.eq('phone', query.phone.trim());
        if (query.email) q = q.eq('email', query.email.toLowerCase());
        q = q.limit(1).single();

        const { data, error } = await q;
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? WalkInCustomer.format(data) : null;
    },

    async find(query = {}, options = {}) {
        let q = supabase.from(TABLE).select('*');

        if (query.search) {
            const search = String(query.search).trim();
            if (search) {
                q = q.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
            }
        }

        q = q.order('created_at', { ascending: false });
        if (options.skip) q = q.range(options.skip, options.skip + (options.limit || 10) - 1);
        else if (options.limit) q = q.limit(options.limit);

        const { data, error } = await q;
        if (error) throw error;
        return (data || []).map(WalkInCustomer.format);
    },

    async countDocuments(query = {}) {
        let q = supabase.from(TABLE).select('id', { count: 'exact', head: true });
        if (query.search) {
            const search = String(query.search).trim();
            if (search) {
                q = q.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
            }
        }
        const { count, error } = await q;
        if (error) throw error;
        return count || 0;
    },

    async create(obj) {
        const row = {
            full_name: obj.fullName,
            phone: obj.phone,
            email: obj.email ? obj.email.toLowerCase() : null,
            address: obj.address || null,
            loyalty_points: obj.loyaltyPoints || 0,
            total_spent: obj.totalSpent || 0,
            visit_count: obj.visitCount || 0,
            is_active: obj.isActive !== undefined ? obj.isActive : true,
        };
        const { data, error } = await supabase.from(TABLE).insert(row).select().single();
        if (error) throw error;
        return WalkInCustomer.format(data);
    },

    async updateById(id, updates) {
        const row = {};
        if (updates.fullName !== undefined) row.full_name = updates.fullName;
        if (updates.phone !== undefined) row.phone = updates.phone;
        if (updates.email !== undefined) row.email = updates.email ? updates.email.toLowerCase() : null;
        if (updates.address !== undefined) row.address = updates.address;
        if (updates.loyaltyPoints !== undefined) row.loyalty_points = updates.loyaltyPoints;
        if (updates.totalSpent !== undefined) row.total_spent = updates.totalSpent;
        if (updates.visitCount !== undefined) row.visit_count = updates.visitCount;
        if (updates.isActive !== undefined) row.is_active = updates.isActive;

        const { data, error } = await supabase.from(TABLE).update(row).eq('id', id).select().single();
        if (error) throw error;
        return WalkInCustomer.format(data);
    },

    async deleteOne(id) {
        const { error } = await supabase.from(TABLE).delete().eq('id', id);
        if (error) throw error;
    },

    format(row) {
        if (!row) return null;
        return {
            _id: row.id,
            id: row.id,
            fullName: row.full_name,
            phone: row.phone,
            email: row.email,
            address: row.address,
            loyaltyPoints: row.loyalty_points || 0,
            totalSpent: Number.parseFloat(row.total_spent || 0),
            visitCount: row.visit_count || 0,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            toJSON() {
                const obj = { ...this };
                delete obj.toJSON;
                return obj;
            },
        };
    },
};

export default WalkInCustomer;
