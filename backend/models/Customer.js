import { supabase } from '../config/db.js';
import bcrypt from 'bcryptjs';

const TABLE = 'customers';

const Customer = {
    async findById(id) {
        const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? Customer.format(data) : null;
    },

    async findOne(query) {
        let q = supabase.from(TABLE).select('*');
        if (query.email) q = q.eq('email', query.email.toLowerCase());
        q = q.limit(1).single();
        const { data, error } = await q;
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? Customer.format(data) : null;
    },

    async find(query = {}, options = {}) {
        let selectFields = '*';
        if (options.excludePassword) {
            selectFields = 'id, first_name, last_name, email, phone, loyalty_points, total_purchases, is_active, created_at, updated_at';
        }
        let q = supabase.from(TABLE).select(selectFields);

        if (query.$or) {
            // Handle OR queries for search
            const searchTerms = query.$or.map(cond => {
                if (cond.firstName) return `first_name.ilike.%${cond.firstName.$regex || cond.firstName}%`;
                if (cond.lastName) return `last_name.ilike.%${cond.lastName.$regex || cond.lastName}%`;
                if (cond.email) return `email.ilike.%${cond.email.$regex || cond.email}%`;
                return null;
            }).filter(Boolean);
            if (searchTerms.length > 0) {
                q = q.or(searchTerms.join(','));
            }
        }

        q = q.order('created_at', { ascending: false });
        if (options.skip) q = q.range(options.skip, options.skip + (options.limit || 10) - 1);
        else if (options.limit) q = q.limit(options.limit);
        const { data, error } = await q;
        if (error) throw error;
        return (data || []).map(Customer.format);
    },

    async create(obj) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(obj.password, salt);
        const row = {
            first_name: obj.firstName,
            last_name: obj.lastName,
            email: obj.email.toLowerCase(),
            phone: obj.phone,
            password: hashedPassword,
            loyalty_points: obj.loyaltyPoints || 0,
            total_purchases: obj.totalPurchases || 0,
            is_active: obj.isActive !== undefined ? obj.isActive : true,
        };
        const { data, error } = await supabase.from(TABLE).insert(row).select().single();
        if (error) throw error;
        return Customer.format(data);
    },

    async updateById(id, updates) {
        const row = {};
        if (updates.firstName !== undefined) row.first_name = updates.firstName;
        if (updates.lastName !== undefined) row.last_name = updates.lastName;
        if (updates.email !== undefined) row.email = updates.email.toLowerCase();
        if (updates.phone !== undefined) row.phone = updates.phone;
        if (updates.isActive !== undefined) row.is_active = updates.isActive;
        if (updates.loyaltyPoints !== undefined) row.loyalty_points = updates.loyaltyPoints;
        if (updates.totalPurchases !== undefined) row.total_purchases = updates.totalPurchases;
        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            row.password = await bcrypt.hash(updates.password, salt);
        }
        const { data, error } = await supabase.from(TABLE).update(row).eq('id', id).select().single();
        if (error) throw error;
        return Customer.format(data);
    },

    async deleteOne(id) {
        const { error } = await supabase.from(TABLE).delete().eq('id', id);
        if (error) throw error;
    },

    async countDocuments(query = {}) {
        let q = supabase.from(TABLE).select('id', { count: 'exact', head: true });
        if (query.isActive !== undefined) q = q.eq('is_active', query.isActive);
        const { count, error } = await q;
        if (error) throw error;
        return count || 0;
    },

    async aggregate(pipeline) {
        // Simple sum aggregation for loyalty points
        const { data, error } = await supabase.from(TABLE).select('loyalty_points');
        if (error) throw error;
        const totalPoints = (data || []).reduce((sum, row) => sum + (row.loyalty_points || 0), 0);
        return [{ _id: null, totalPoints }];
    },

    format(row) {
        if (!row) return null;
        return {
            _id: row.id,
            id: row.id,
            firstName: row.first_name,
            lastName: row.last_name,
            email: row.email,
            phone: row.phone,
            password: row.password,
            loyaltyPoints: row.loyalty_points,
            totalPurchases: row.total_purchases,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            async matchPassword(enteredPassword) {
                return await bcrypt.compare(enteredPassword, row.password);
            },
            async save() {
                return await Customer.updateById(row.id, {
                    firstName: row.first_name,
                    lastName: row.last_name,
                    phone: row.phone,
                    isActive: row.is_active,
                    loyaltyPoints: row.loyalty_points,
                    totalPurchases: row.total_purchases,
                });
            },
            toJSON() {
                const obj = { ...this };
                delete obj.matchPassword;
                delete obj.save;
                delete obj.toJSON;
                return obj;
            },
        };
    },
};

export default Customer;
