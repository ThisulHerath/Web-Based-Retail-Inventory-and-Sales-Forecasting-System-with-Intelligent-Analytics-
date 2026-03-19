import { supabase } from '../config/db.js';

const TABLE = 'products';

const Product = {
    async findById(id) {
        const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? Product.format(data) : null;
    },

    async findByIdPopulated(id) {
        const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        if (!data) return null;
        // Populate category
        let category = null;
        if (data.category_id) {
            const { data: catData } = await supabase.from('categories').select('id, category_name, is_active').eq('id', data.category_id).single();
            if (catData) {
                category = { _id: catData.id, id: catData.id, categoryName: catData.category_name, isActive: catData.is_active };
            }
        }
        const formatted = Product.format(data);
        formatted.category = category;
        return formatted;
    },

    async findOne(query) {
        let q = supabase.from(TABLE).select('*');
        if (query.productName) q = q.eq('product_name', query.productName);
        if (query.sku) q = q.eq('sku', query.sku);
        q = q.limit(1).single();
        const { data, error } = await q;
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? Product.format(data) : null;
    },

    async find(query = {}, options = {}) {
        let q = supabase.from(TABLE).select('*');
        if (query.$or) {
            const terms = query.$or.map(cond => {
                if (cond.productName) return `product_name.ilike.%${cond.productName.$regex || cond.productName}%`;
                if (cond.sku) return `sku.ilike.%${cond.sku.$regex || cond.sku}%`;
                return null;
            }).filter(Boolean);
            if (terms.length > 0) q = q.or(terms.join(','));
        }
        if (query.category) q = q.eq('category_id', query.category);
        if (query.isActive !== undefined) q = q.eq('is_active', query.isActive);
        q = q.order('created_at', { ascending: false });
        if (options.skip) q = q.range(options.skip, options.skip + (options.limit || 10) - 1);
        else if (options.limit) q = q.limit(options.limit);
        const { data, error } = await q;
        if (error) throw error;
        const products = (data || []).map(Product.format);
        // Populate categories if requested
        if (options.populateCategory) {
            const catIds = [...new Set(products.map(p => p.categoryId).filter(Boolean))];
            if (catIds.length > 0) {
                const { data: cats } = await supabase.from('categories').select('*').in('id', catIds);
                const catMap = {};
                (cats || []).forEach(c => { catMap[c.id] = { _id: c.id, id: c.id, categoryName: c.category_name, isActive: c.is_active }; });
                products.forEach(p => { p.category = catMap[p.categoryId] || null; });
            }
        }
        return products;
    },

    async create(obj) {
        let sku = obj.sku;
        if (!sku) {
            const ts = Date.now().toString(36).toUpperCase();
            const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
            sku = `SKU-${ts}-${rand}`;
        }
        const row = {
            product_name: obj.productName,
            sku,
            category_id: obj.category,
            description: obj.description || '',
            cost_price: obj.costPrice,
            selling_price: obj.sellingPrice,
            minimum_stock_level: obj.minimumStockLevel ?? 10,
            is_active: obj.isActive !== undefined ? obj.isActive : true,
            product_image: obj.productImage || null,
        };
        const { data, error } = await supabase.from(TABLE).insert(row).select().single();
        if (error) throw error;
        return Product.format(data);
    },

    async updateById(id, updates) {
        const row = {};
        if (updates.productName !== undefined) row.product_name = updates.productName;
        if (updates.sku !== undefined) row.sku = updates.sku;
        if (updates.category !== undefined) row.category_id = updates.category;
        if (updates.description !== undefined) row.description = updates.description;
        if (updates.costPrice !== undefined) row.cost_price = updates.costPrice;
        if (updates.sellingPrice !== undefined) row.selling_price = updates.sellingPrice;
        if (updates.minimumStockLevel !== undefined) row.minimum_stock_level = updates.minimumStockLevel;
        if (updates.isActive !== undefined) row.is_active = updates.isActive;
        if (updates.productImage !== undefined) row.product_image = updates.productImage;
        const { data, error } = await supabase.from(TABLE).update(row).eq('id', id).select().single();
        if (error) throw error;
        return Product.format(data);
    },

    async findByIdAndUpdate(id, updates) {
        const row = {};
        if (updates.costPrice !== undefined) row.cost_price = updates.costPrice;
        if (updates.$addToSet && updates.$addToSet.suppliers) {
            // Handle adding supplier to product_suppliers junction
            const supplierId = updates.$addToSet.suppliers;
            await supabase.from('product_suppliers').upsert({
                product_id: id,
                supplier_id: supplierId,
            }, { onConflict: 'product_id,supplier_id' });
        }
        if (Object.keys(row).length > 0) {
            const { data, error } = await supabase.from(TABLE).update(row).eq('id', id).select().single();
            if (error) throw error;
            return Product.format(data);
        }
        return await Product.findById(id);
    },

    async deleteOne(id) {
        // Delete junction table entries
        await supabase.from('product_suppliers').delete().eq('product_id', id);
        const { error } = await supabase.from(TABLE).delete().eq('id', id);
        if (error) throw error;
    },

    async countDocuments(query = {}) {
        let q = supabase.from(TABLE).select('id', { count: 'exact', head: true });
        if (query.category) q = q.eq('category_id', query.category);
        if (query.isActive !== undefined) q = q.eq('is_active', query.isActive);
        const { count, error } = await q;
        if (error) throw error;
        return count || 0;
    },

    async countWithItemsFilter(filter) {
        // For checking if product is used in sales/purchases
        // filter is like { 'items.productId': id } or { 'products.product': id }
        return 0; // Handled separately in controllers
    },

    format(row) {
        if (!row) return null;
        return {
            _id: row.id,
            id: row.id,
            productName: row.product_name,
            sku: row.sku,
            category: row.category_id,
            categoryId: row.category_id,
            description: row.description,
            costPrice: parseFloat(row.cost_price),
            sellingPrice: parseFloat(row.selling_price),
            minimumStockLevel: row.minimum_stock_level,
            isActive: row.is_active,
            productImage: row.product_image,
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

export default Product;
