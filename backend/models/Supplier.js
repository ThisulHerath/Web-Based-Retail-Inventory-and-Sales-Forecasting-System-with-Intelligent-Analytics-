import { supabase } from '../config/db.js';

const TABLE = 'suppliers';

const Supplier = {
    async findById(id) {
        const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        if (!data) return null;
        // Also fetch supplied products
        const { data: spData } = await supabase
            .from('supplier_supplied_products')
            .select('product_id')
            .eq('supplier_id', id);
        const suppliedProductIds = (spData || []).map(r => r.product_id);
        return Supplier.format(data, suppliedProductIds);
    },

    async findByIdPopulated(id) {
        const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        if (!data) return null;
        // Fetch supplied products with details
        const { data: spData } = await supabase
            .from('supplier_supplied_products')
            .select('product_id')
            .eq('supplier_id', id);
        const productIds = (spData || []).map(r => r.product_id);
        let suppliedProducts = [];
        if (productIds.length > 0) {
            const { data: prods } = await supabase
                .from('products')
                .select('id, product_name, category_id, selling_price')
                .in('id', productIds);
            suppliedProducts = (prods || []).map(p => ({
                _id: p.id,
                id: p.id,
                productName: p.product_name,
                category: p.category_id,
                sellingPrice: p.selling_price,
            }));
        }
        const formatted = Supplier.format(data, productIds);
        formatted.suppliedProducts = suppliedProducts;
        return formatted;
    },

    async find(query = {}, options = {}) {
        let q = supabase.from(TABLE).select('*');
        if (query.$or) {
            const terms = query.$or.map(cond => {
                if (cond.supplierName) return `supplier_name.ilike.%${cond.supplierName.$regex || cond.supplierName}%`;
                if (cond.companyName) return `company_name.ilike.%${cond.companyName.$regex || cond.companyName}%`;
                return null;
            }).filter(Boolean);
            if (terms.length > 0) q = q.or(terms.join(','));
        }
        if (query.isActive !== undefined) q = q.eq('is_active', query.isActive);
        q = q.order('created_at', { ascending: false });
        if (options.skip) q = q.range(options.skip, options.skip + (options.limit || 10) - 1);
        else if (options.limit) q = q.limit(options.limit);
        const { data, error } = await q;
        if (error) throw error;
        // Fetch supplied products for each
        const suppliers = data || [];
        const result = [];
        for (const s of suppliers) {
            const { data: spData } = await supabase
                .from('supplier_supplied_products')
                .select('product_id')
                .eq('supplier_id', s.id);
            const productIds = (spData || []).map(r => r.product_id);
            let suppliedProducts = [];
            if (options.populateProducts && productIds.length > 0) {
                const { data: prods } = await supabase
                    .from('products')
                    .select('id, product_name, category_id')
                    .in('id', productIds);
                suppliedProducts = (prods || []).map(p => ({
                    _id: p.id, id: p.id, productName: p.product_name, category: p.category_id,
                }));
            }
            const formatted = Supplier.format(s, productIds);
            if (options.populateProducts) formatted.suppliedProducts = suppliedProducts;
            result.push(formatted);
        }
        return result;
    },

    async create(obj) {
        const row = {
            supplier_name: obj.supplierName,
            company_name: obj.companyName || '',
            email: obj.email || '',
            phone: obj.phone || '',
            address: obj.address || '',
            is_active: obj.isActive !== undefined ? obj.isActive : true,
        };
        const { data, error } = await supabase.from(TABLE).insert(row).select().single();
        if (error) throw error;
        return Supplier.format(data, []);
    },

    async updateById(id, updates) {
        const row = {};
        if (updates.supplierName !== undefined) row.supplier_name = updates.supplierName;
        if (updates.companyName !== undefined) row.company_name = updates.companyName;
        if (updates.email !== undefined) row.email = updates.email;
        if (updates.phone !== undefined) row.phone = updates.phone;
        if (updates.address !== undefined) row.address = updates.address;
        if (updates.isActive !== undefined) row.is_active = updates.isActive;
        const { data, error } = await supabase.from(TABLE).update(row).eq('id', id).select().single();
        if (error) throw error;
        return Supplier.format(data);
    },

    async deleteOne(id) {
        // Also delete supplied products links
        await supabase.from('supplier_supplied_products').delete().eq('supplier_id', id);
        const { error } = await supabase.from(TABLE).delete().eq('id', id);
        if (error) throw error;
    },

    async countDocuments(query = {}) {
        let q = supabase.from(TABLE).select('id', { count: 'exact', head: true });
        if (query.isActive !== undefined) q = q.eq('is_active', query.isActive);
        if (query.supplier) q = q.eq('id', query.supplier);
        const { count, error } = await q;
        if (error) throw error;
        return count || 0;
    },

    async addSuppliedProduct(supplierId, productId) {
        const { error } = await supabase.from('supplier_supplied_products').upsert({
            supplier_id: supplierId,
            product_id: productId,
        }, { onConflict: 'supplier_id,product_id' });
        if (error && !error.message.includes('duplicate')) throw error;
    },

    format(row, suppliedProductIds = []) {
        if (!row) return null;
        return {
            _id: row.id,
            id: row.id,
            supplierName: row.supplier_name,
            companyName: row.company_name,
            email: row.email,
            phone: row.phone,
            address: row.address,
            isActive: row.is_active,
            suppliedProducts: suppliedProductIds,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            async save() {
                return await Supplier.updateById(row.id, {
                    supplierName: row.supplier_name,
                    companyName: row.company_name,
                    email: row.email,
                    phone: row.phone,
                    address: row.address,
                    isActive: row.is_active,
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

export default Supplier;
