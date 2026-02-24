import { supabase } from '../config/db.js';

const TABLE = 'inventory';

const Inventory = {
    async findOne(query) {
        let q = supabase.from(TABLE).select('*');
        if (query.product) q = q.eq('product_id', query.product);
        q = q.limit(1).single();
        const { data, error } = await q;
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? Inventory.format(data) : null;
    },

    async findById(id) {
        const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? Inventory.format(data) : null;
    },

    async find(query = {}) {
        let q = supabase.from(TABLE).select('*');
        const { data, error } = await q;
        if (error) throw error;
        return (data || []).map(Inventory.format);
    },

    async findPopulated() {
        // Get all inventory with product details
        const { data: invData, error } = await supabase.from(TABLE).select('*');
        if (error) throw error;
        if (!invData || invData.length === 0) return [];

        const productIds = invData.map(i => i.product_id);
        const { data: prods } = await supabase.from('products').select('*').in('id', productIds);
        const { data: cats } = await supabase.from('categories').select('*');

        const prodMap = {};
        (prods || []).forEach(p => {
            const cat = (cats || []).find(c => c.id === p.category_id);
            prodMap[p.id] = {
                _id: p.id, id: p.id,
                productName: p.product_name,
                sku: p.sku,
                category: cat ? { _id: cat.id, id: cat.id, categoryName: cat.category_name } : null,
                minimumStockLevel: p.minimum_stock_level,
                isActive: p.is_active,
                costPrice: parseFloat(p.cost_price),
                sellingPrice: parseFloat(p.selling_price),
            };
        });

        return invData.map(inv => {
            const formatted = Inventory.format(inv);
            formatted.product = prodMap[inv.product_id] || null;
            return formatted;
        });
    },

    async create(obj) {
        const row = {
            product_id: obj.product,
            current_stock: obj.currentStock || 0,
            last_updated: new Date().toISOString(),
        };
        const { data, error } = await supabase.from(TABLE).insert(row).select().single();
        if (error) throw error;
        return Inventory.format(data);
    },

    async updateById(id, updates) {
        const row = {};
        if (updates.currentStock !== undefined) row.current_stock = updates.currentStock;
        if (updates.lastUpdated) row.last_updated = updates.lastUpdated;
        const { data, error } = await supabase.from(TABLE).update(row).eq('id', id).select().single();
        if (error) throw error;
        return Inventory.format(data);
    },

    async deleteOne(query) {
        if (query.product) {
            const { error } = await supabase.from(TABLE).delete().eq('product_id', query.product);
            if (error) throw error;
        }
    },

    async aggregate(pipeline) {
        // For stock value calculation
        const { data: invData } = await supabase.from(TABLE).select('*');
        const { data: prodsData } = await supabase.from('products').select('id, cost_price');
        const prodMap = {};
        (prodsData || []).forEach(p => { prodMap[p.id] = parseFloat(p.cost_price); });
        let totalValue = 0;
        (invData || []).forEach(inv => {
            const costPrice = prodMap[inv.product_id] || 0;
            totalValue += inv.current_stock * costPrice;
        });
        return [{ _id: null, totalValue }];
    },

    format(row) {
        if (!row) return null;
        return {
            _id: row.id,
            id: row.id,
            product: row.product_id,
            productId: row.product_id,
            currentStock: row.current_stock,
            lastUpdated: row.last_updated,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            async save() {
                return await Inventory.updateById(row.id, {
                    currentStock: this.currentStock,
                    lastUpdated: new Date().toISOString(),
                });
            },
            toJSON() {
                const obj = { ...this };
                delete obj.save;
                delete obj.toJSON;
                return obj;
            },
        };
    },
};

export default Inventory;
