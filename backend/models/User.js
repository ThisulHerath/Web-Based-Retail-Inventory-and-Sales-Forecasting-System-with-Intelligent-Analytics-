import { supabase } from '../config/db.js';
import bcrypt from 'bcryptjs';

const TABLE = 'users';

const User = {
    async findById(id) {
        const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? User.format(data) : null;
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
        return data ? User.format(data) : null;
    },

    async find(query = {}, options = {}) {
        let q = supabase.from(TABLE).select('*');
        if (query.role) q = q.eq('role', query.role);
        if (query.isActive !== undefined) q = q.eq('is_active', query.isActive);
        if (options.excludePassword) {
            q = supabase.from(TABLE).select('id, name, email, role, is_active, created_at, updated_at');
            if (query.role) q = q.eq('role', query.role);
            if (query.isActive !== undefined) q = q.eq('is_active', query.isActive);
        }
        q = q.order('created_at', { ascending: false });
        if (options.skip) q = q.range(options.skip, options.skip + (options.limit || 10) - 1);
        else if (options.limit) q = q.limit(options.limit);
        const { data, error } = await q;
        if (error) throw error;
        return (data || []).map(User.format);
    },

    async create(obj) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(obj.password, salt);
        const row = {
            name: obj.name,
            email: obj.email.toLowerCase(),
            password: hashedPassword,
            role: obj.role || 'cashier',
            is_active: obj.isActive !== undefined ? obj.isActive : true,
        };
        const { data, error } = await supabase.from(TABLE).insert(row).select().single();
        if (error) throw error;
        return User.format(data);
    },

    async updateById(id, updates) {
        const row = {};
        if (updates.name !== undefined) row.name = updates.name;
        if (updates.email !== undefined) row.email = updates.email.toLowerCase();
        if (updates.role !== undefined) row.role = updates.role;
        if (updates.isActive !== undefined) row.is_active = updates.isActive;
        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            row.password = await bcrypt.hash(updates.password, salt);
        }
        const { data, error } = await supabase.from(TABLE).update(row).eq('id', id).select().single();
        if (error) throw error;
        return User.format(data);
    },

    async deleteOne(id) {
        const { error } = await supabase.from(TABLE).delete().eq('id', id);
        if (error) throw error;
    },

    async countDocuments(query = {}) {
        let q = supabase.from(TABLE).select('id', { count: 'exact', head: true });
        if (query.role) q = q.eq('role', query.role);
        if (query.isActive !== undefined) q = q.eq('is_active', query.isActive);
        const { count, error } = await q;
        if (error) throw error;
        return count || 0;
    },

    format(row) {
        if (!row) return null;
        return {
            _id: row.id,
            id: row.id,
            name: row.name,
            email: row.email,
            password: row.password,
            role: row.role,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            async comparePassword(enteredPassword) {
                return await bcrypt.compare(enteredPassword, row.password);
            },
            toJSON() {
                const obj = { ...this };
                delete obj.comparePassword;
                delete obj.toJSON;
                return obj;
            },
        };
    },
};

export default User;
