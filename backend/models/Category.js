import { supabase } from '../config/db.js';

const TABLE = 'categories';

const Category = {
    async find(query = {}, options = {}) {
        let q = supabase.from(TABLE).select('*');
        if (query.categoryName) {
            q = q.ilike('category_name', `%${query.categoryName}%`);
        }
        if (query.isActive !== undefined) {
            q = q.eq('is_active', query.isActive);
        }
        if (options.sort) {
            const [field, dir] = Object.entries(options.sort)[0];
            const col = field === 'categoryName' ? 'category_name' : field;
            q = q.order(col, { ascending: dir === 1 || dir === 'asc' });
        } else {
            q = q.order('category_name', { ascending: true });
        }
        if (options.skip) q = q.range(options.skip, options.skip + (options.limit || 50) - 1);
        else if (options.limit) q = q.limit(options.limit);
        const { data, error } = await q;
        if (error) throw error;
        return (data || []).map(Category.format);
    },

    async findById(id) {
        const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? Category.format(data) : null;
    },

    async findOne(query) {
        let q = supabase.from(TABLE).select('*');
        if (query.categoryName) {
            if (typeof query.categoryName === 'object' && query.categoryName.$regex) {
                q = q.ilike('category_name', query.categoryName.$regex.replace(/[\^$]/g, ''));
            } else {
                q = q.eq('category_name', query.categoryName);
            }
        }
        q = q.limit(1).single();
        const { data, error } = await q;
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? Category.format(data) : null;
    },

    async create(obj) {
        const row = {
            category_name: obj.categoryName,
            description: obj.description || '',
            is_active: obj.isActive !== undefined ? obj.isActive : true,
        };
        const { data, error } = await supabase.from(TABLE).insert(row).select().single();
        if (error) throw error;
        return Category.format(data);
    },

    async updateById(id, updates) {
        const row = {};
        if (updates.categoryName !== undefined) row.category_name = updates.categoryName;
        if (updates.description !== undefined) row.description = updates.description;
        if (updates.isActive !== undefined) row.is_active = updates.isActive;
        const { data, error } = await supabase.from(TABLE).update(row).eq('id', id).select().single();
        if (error) throw error;
        return Category.format(data);
    },

    async deleteOne(id) {
        const { error } = await supabase.from(TABLE).delete().eq('id', id);
        if (error) throw error;
    },

    async countDocuments(query = {}) {
        let q = supabase.from(TABLE).select('id', { count: 'exact', head: true });
        if (query.categoryName) q = q.ilike('category_name', `%${query.categoryName}%`);
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
            categoryName: row.category_name,
            description: row.description,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            toJSON() { return { ...this }; },
        };
    },
};

export default Category;
