import { supabase } from '../config/db.js';

const TABLE = 'stock_transactions';

const StockTransaction = {
    async findById(id) {
        const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? StockTransaction.format(data) : null;
    },

    async find(query = {}, options = {}) {
        let q = supabase.from(TABLE).select('*');
        if (query.product) q = q.eq('product_id', query.product);
        if (query.type) q = q.eq('type', query.type);
        if (query.referenceType) q = q.eq('reference_type', query.referenceType);
        if (query.referenceId) q = q.eq('reference_id', query.referenceId);
        q = q.order('created_at', { ascending: false });
        if (options.skip) q = q.range(options.skip, options.skip + (options.limit || 20) - 1);
        else if (options.limit) q = q.limit(options.limit);
        const { data, error } = await q;
        if (error) throw error;
        return (data || []).map(StockTransaction.format);
    },

    async findPopulated(query = {}, options = {}) {
        const transactions = await StockTransaction.find(query, options);
        
        // Populate product and createdBy
        const productIds = [...new Set(transactions.map(t => t.productId).filter(Boolean))];
        const userIds = [...new Set(transactions.map(t => t.createdById).filter(Boolean))];
        
        const prodMap = {};
        const userMap = {};
        
        if (productIds.length > 0) {
            const { data: prods } = await supabase.from('products').select('id, product_name, sku, category_id').in('id', productIds);
            (prods || []).forEach(p => { prodMap[p.id] = { _id: p.id, id: p.id, productName: p.product_name, sku: p.sku, category: p.category_id }; });
        }
        if (userIds.length > 0) {
            const { data: users } = await supabase.from('users').select('id, name, email').in('id', userIds);
            (users || []).forEach(u => { userMap[u.id] = { _id: u.id, id: u.id, name: u.name, email: u.email }; });
        }
        
        return transactions.map(t => {
            t.product = prodMap[t.productId] || null;
            t.createdBy = userMap[t.createdById] || null;
            return t;
        });
    },

    async create(obj) {
        const row = {
            product_id: obj.product,
            type: obj.type,
            reference_type: obj.referenceType || 'manual',
            reference_id: obj.referenceId || null,
            quantity: obj.quantity,
            date: obj.date || new Date().toISOString(),
            created_by: obj.createdBy,
            notes: obj.notes || '',
        };
        const { data, error } = await supabase.from(TABLE).insert(row).select().single();
        if (error) throw error;
        return StockTransaction.format(data);
    },

    async deleteMany(query) {
        let q = supabase.from(TABLE).delete();
        if (query.referenceType) q = q.eq('reference_type', query.referenceType);
        if (query.referenceId) q = q.eq('reference_id', query.referenceId);
        const { error } = await q;
        if (error) throw error;
    },

    async countDocuments(query = {}) {
        let q = supabase.from(TABLE).select('id', { count: 'exact', head: true });
        if (query.product) q = q.eq('product_id', query.product);
        if (query.type) q = q.eq('type', query.type);
        const { count, error } = await q;
        if (error) throw error;
        return count || 0;
    },

    format(row) {
        if (!row) return null;
        return {
            _id: row.id,
            id: row.id,
            product: row.product_id,
            productId: row.product_id,
            type: row.type,
            referenceType: row.reference_type,
            referenceId: row.reference_id,
            quantity: row.quantity,
            date: row.date,
            createdBy: row.created_by,
            createdById: row.created_by,
            notes: row.notes,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            async populate(field, select) {
                // Populate helper
                if (field === 'product') {
                    const { data } = await supabase.from('products').select('id, product_name, sku').eq('id', row.product_id).single();
                    if (data) this.product = { _id: data.id, id: data.id, productName: data.product_name, sku: data.sku };
                }
                if (field === 'createdBy') {
                    const { data } = await supabase.from('users').select('id, name, email').eq('id', row.created_by).single();
                    if (data) this.createdBy = { _id: data.id, id: data.id, name: data.name, email: data.email };
                }
                return this;
            },
            toJSON() {
                const obj = { ...this };
                delete obj.populate;
                delete obj.toJSON;
                return obj;
            },
        };
    },
};

export default StockTransaction;
