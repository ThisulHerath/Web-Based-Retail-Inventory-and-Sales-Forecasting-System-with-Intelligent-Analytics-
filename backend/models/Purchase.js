import { supabase } from '../config/db.js';

const TABLE = 'purchases';
const ITEMS_TABLE = 'purchase_items';

const Purchase = {
    async findById(id) {
        const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        if (!data) return null;
        // Fetch items
        const { data: items } = await supabase.from(ITEMS_TABLE).select('*').eq('purchase_id', id);
        return Purchase.format(data, items || []);
    },

    async findByIdPopulated(id) {
        const purchase = await Purchase.findById(id);
        if (!purchase) return null;
        // Populate supplier
        if (purchase.supplierId) {
            const { data: sup } = await supabase.from('suppliers')
                .select('id, supplier_name, company_name, email, phone, address')
                .eq('id', purchase.supplierId).single();
            if (sup) {
                purchase.supplier = {
                    _id: sup.id, id: sup.id,
                    supplierName: sup.supplier_name, companyName: sup.company_name,
                    email: sup.email, phone: sup.phone, address: sup.address,
                };
            }
        }
        // Populate createdBy
        if (purchase.createdById) {
            const { data: user } = await supabase.from('users')
                .select('id, name, email')
                .eq('id', purchase.createdById).single();
            if (user) {
                purchase.createdBy = { _id: user.id, id: user.id, name: user.name, email: user.email };
            }
        }
        // Populate product details in items
        for (const item of purchase.products) {
            if (item.product) {
                const { data: prod } = await supabase.from('products')
                    .select('id, product_name, sku, category_id')
                    .eq('id', item.product).single();
                if (prod) {
                    item.productDetails = {
                        _id: prod.id, id: prod.id,
                        productName: prod.product_name, sku: prod.sku, category: prod.category_id,
                    };
                }
            }
        }
        return purchase;
    },

    async find(query = {}, options = {}) {
        let q = supabase.from(TABLE).select('*');
        if (query.supplier) q = q.eq('supplier_id', query.supplier);
        if (query.status) q = q.eq('status', query.status);
        if (query.purchaseDate) {
            if (query.purchaseDate.$gte) q = q.gte('purchase_date', query.purchaseDate.$gte.toISOString());
            if (query.purchaseDate.$lte) q = q.lte('purchase_date', query.purchaseDate.$lte.toISOString());
        }
        q = q.order('purchase_date', { ascending: false });
        if (options.skip) q = q.range(options.skip, options.skip + (options.limit || 10) - 1);
        else if (options.limit) q = q.limit(options.limit);
        const { data, error } = await q;
        if (error) throw error;

        const purchases = [];
        for (const p of (data || [])) {
            const { data: items } = await supabase.from(ITEMS_TABLE).select('*').eq('purchase_id', p.id);
            const formatted = Purchase.format(p, items || []);

            // Populate supplier & createdBy if needed
            if (options.populate) {
                if (p.supplier_id) {
                    const { data: sup } = await supabase.from('suppliers')
                        .select('id, supplier_name, company_name')
                        .eq('id', p.supplier_id).single();
                    if (sup) formatted.supplier = { _id: sup.id, id: sup.id, supplierName: sup.supplier_name, companyName: sup.company_name };
                }
                if (p.created_by) {
                    const { data: user } = await supabase.from('users')
                        .select('id, name')
                        .eq('id', p.created_by).single();
                    if (user) formatted.createdBy = { _id: user.id, id: user.id, name: user.name };
                }
            }
            purchases.push(formatted);
        }
        return purchases;
    },

    async create(obj) {
        // Auto-generate purchase number
        let purchaseNumber = obj.purchaseNumber;
        if (!purchaseNumber) {
            const { count } = await supabase.from(TABLE).select('id', { count: 'exact', head: true });
            purchaseNumber = `PO-${String((count || 0) + 1).padStart(5, '0')}`;
        }
        const row = {
            purchase_number: purchaseNumber,
            supplier_id: obj.supplier,
            total_amount: obj.totalAmount,
            purchase_date: obj.purchaseDate || new Date().toISOString(),
            created_by: obj.createdBy,
            status: obj.status || 'completed',
            notes: obj.notes || '',
        };
        const { data, error } = await supabase.from(TABLE).insert(row).select().single();
        if (error) throw error;

        // Insert items
        const items = [];
        if (obj.products && obj.products.length > 0) {
            const itemRows = obj.products.map(item => ({
                purchase_id: data.id,
                product_id: item.product,
                product_name: item.productName,
                quantity: item.quantity,
                cost_price: item.costPrice,
                total: item.total,
            }));
            const { data: itemData, error: itemError } = await supabase.from(ITEMS_TABLE).insert(itemRows).select();
            if (itemError) throw itemError;
            items.push(...(itemData || []));
        }
        const formatted = Purchase.format(data, items);
        formatted.purchaseNumber = purchaseNumber;
        return formatted;
    },

    async deleteOne(id) {
        await supabase.from(ITEMS_TABLE).delete().eq('purchase_id', id);
        const { error } = await supabase.from(TABLE).delete().eq('id', id);
        if (error) throw error;
    },

    async countDocuments(query = {}) {
        let q = supabase.from(TABLE).select('id', { count: 'exact', head: true });
        if (query.status) q = q.eq('status', query.status);
        if (query.supplier) q = q.eq('supplier_id', query.supplier);
        const { count, error } = await q;
        if (error) throw error;
        return count || 0;
    },

    async aggregate(pipeline) {
        // Simple aggregation for total cost
        const { data } = await supabase.from(TABLE).select('total_amount, status');
        const completed = (data || []).filter(r => r.status === 'completed');
        const totalCost = completed.reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0);
        return [{ _id: null, totalCost }];
    },

    async findSorted(query, sortField, sortDir) {
        let q = supabase.from(TABLE).select('*');
        if (query.supplier) q = q.eq('supplier_id', query.supplier);
        q = q.order(sortField === 'purchaseDate' ? 'purchase_date' : sortField, { ascending: sortDir === 1 });
        const { data, error } = await q;
        if (error) throw error;
        const result = [];
        for (const p of (data || [])) {
            const { data: items } = await supabase.from(ITEMS_TABLE).select('*').eq('purchase_id', p.id);
            result.push(Purchase.format(p, items || []));
        }
        return result;
    },

    format(row, items = []) {
        if (!row) return null;
        const formattedItems = items.map(i => ({
            product: i.product_id,
            productName: i.product_name,
            quantity: i.quantity,
            costPrice: parseFloat(i.cost_price),
            total: parseFloat(i.total),
        }));
        return {
            _id: row.id,
            id: row.id,
            purchaseNumber: row.purchase_number,
            supplier: row.supplier_id,
            supplierId: row.supplier_id,
            products: formattedItems,
            totalAmount: parseFloat(row.total_amount),
            purchaseDate: row.purchase_date,
            createdBy: row.created_by,
            createdById: row.created_by,
            status: row.status,
            notes: row.notes,
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

export default Purchase;
