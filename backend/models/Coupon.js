import { supabase } from '../config/db.js';

const TABLE = 'coupons';

const Coupon = {
    async findById(id) {
        const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? Coupon.format(data) : null;
    },

    async findOne(query) {
        let q = supabase.from(TABLE).select('*');
        if (query.code) q = q.eq('code', query.code.toUpperCase());
        if (query.isUsed !== undefined) q = q.eq('is_used', query.isUsed);
        q = q.limit(1).single();
        const { data, error } = await q;
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? Coupon.format(data) : null;
    },

    async findOnePopulated(query) {
        const coupon = await Coupon.findOne(query);
        if (!coupon) return null;
        // populate customer
        if (coupon.customerId) {
            const { data: custData } = await supabase
                .from('customers')
                .select('id, first_name, last_name')
                .eq('id', coupon.customerId)
                .single();
            if (custData) {
                coupon.customer = {
                    _id: custData.id,
                    id: custData.id,
                    firstName: custData.first_name,
                    lastName: custData.last_name,
                };
            }
        }
        return coupon;
    },

    async find(query = {}, options = {}) {
        let q = supabase.from(TABLE).select('*');
        if (query.customer) q = q.eq('customer_id', query.customer);
        q = q.order('created_at', { ascending: false });
        if (options.limit) q = q.limit(options.limit);
        const { data, error } = await q;
        if (error) throw error;
        return (data || []).map(Coupon.format);
    },

    async create(obj) {
        let code = obj.code;
        if (!code) {
            const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
            code = `CPN-${rand}`;
        }
        const row = {
            code: code.toUpperCase(),
            discount_type: obj.discountType || 'Percentage',
            discount_value: obj.discountValue,
            expiry_date: obj.expiryDate,
            is_used: obj.isUsed || false,
            customer_id: obj.customer,
        };
        const { data, error } = await supabase.from(TABLE).insert(row).select().single();
        if (error) throw error;
        return Coupon.format(data);
    },

    async findByIdAndUpdate(id, updates) {
        const row = {};
        if (updates.isUsed !== undefined) row.is_used = updates.isUsed;
        if (updates.code) row.code = updates.code;
        const { data, error } = await supabase.from(TABLE).update(row).eq('id', id).select().single();
        if (error) throw error;
        return Coupon.format(data);
    },

    format(row) {
        if (!row) return null;
        return {
            _id: row.id,
            id: row.id,
            code: row.code,
            discountType: row.discount_type,
            discountValue: parseFloat(row.discount_value),
            expiryDate: row.expiry_date,
            isUsed: row.is_used,
            customer: row.customer_id,
            customerId: row.customer_id,
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

export default Coupon;
