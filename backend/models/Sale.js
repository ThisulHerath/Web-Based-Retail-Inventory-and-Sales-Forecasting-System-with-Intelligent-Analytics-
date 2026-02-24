import { supabase } from '../config/db.js';

const TABLE = 'sales';
const ITEMS_TABLE = 'sale_items';

const Sale = {
    async findById(id) {
        const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        if (!data) return null;
        const { data: items } = await supabase.from(ITEMS_TABLE).select('*').eq('sale_id', id);
        return Sale.format(data, items || []);
    },

    async findOne(options = {}) {
        let q = supabase.from(TABLE).select('*');
        if (options.sort) {
            q = q.order('created_at', { ascending: false });
        }
        q = q.limit(1).single();
        const { data, error } = await q;
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? Sale.format(data, []) : null;
    },

    async find(query = {}, options = {}) {
        let q = supabase.from(TABLE).select('*');
        if (query.invoiceNumber) {
            if (typeof query.invoiceNumber === 'object' && query.invoiceNumber.$regex) {
                q = q.ilike('invoice_number', `%${query.invoiceNumber.$regex}%`);
            } else {
                q = q.eq('invoice_number', query.invoiceNumber);
            }
        }
        if (query.createdAt) {
            if (query.createdAt.$gte) q = q.gte('created_at', query.createdAt.$gte.toISOString());
            if (query.createdAt.$lte) q = q.lte('created_at', query.createdAt.$lte.toISOString());
        }
        q = q.order('created_at', { ascending: false });
        if (options.skip) q = q.range(options.skip, options.skip + (options.limit || 10) - 1);
        else if (options.limit) q = q.limit(options.limit);
        const { data, error } = await q;
        if (error) throw error;
        
        const sales = [];
        for (const s of (data || [])) {
            const { data: items } = await supabase.from(ITEMS_TABLE).select('*').eq('sale_id', s.id);
            sales.push(Sale.format(s, items || []));
        }
        return sales;
    },

    async create(obj) {
        const row = {
            invoice_number: obj.invoiceNumber,
            customer_name: obj.customerName,
            customer_id: obj.customer || null,
            subtotal: obj.subtotal,
            tax: obj.tax || 0,
            grand_total: obj.grandTotal,
            total_cost: obj.totalCost || 0,
            total_profit: obj.totalProfit || 0,
            payment_method: obj.paymentMethod,
            coupon_used: obj.couponUsed || null,
            points_earned: obj.pointsEarned || 0,
        };
        const { data, error } = await supabase.from(TABLE).insert(row).select().single();
        if (error) throw error;

        // Insert items
        const items = [];
        if (obj.items && obj.items.length > 0) {
            const itemRows = obj.items.map(item => ({
                sale_id: data.id,
                product_id: item.productId,
                product_name: item.productName,
                quantity: item.quantity,
                cost_price: item.costPrice || 0,
                unit_price: item.unitPrice,
                total: item.total,
            }));
            const { data: itemData, error: itemError } = await supabase.from(ITEMS_TABLE).insert(itemRows).select();
            if (itemError) throw itemError;
            items.push(...(itemData || []));
        }
        return Sale.format(data, items);
    },

    async deleteOne(id) {
        await supabase.from(ITEMS_TABLE).delete().eq('sale_id', id);
        const { error } = await supabase.from(TABLE).delete().eq('id', id);
        if (error) throw error;
    },

    async countDocuments(query = {}) {
        let q = supabase.from(TABLE).select('id', { count: 'exact', head: true });
        if (query.createdAt) {
            if (query.createdAt.$gte) q = q.gte('created_at', query.createdAt.$gte.toISOString());
            if (query.createdAt.$lt) q = q.lt('created_at', query.createdAt.$lt.toISOString());
        }
        const { count, error } = await q;
        if (error) throw error;
        return count || 0;
    },

    async aggregate(pipeline) {
        // Revenue and profit aggregation
        const { data } = await supabase.from(TABLE).select('grand_total, total_profit');
        const totalRevenue = (data || []).reduce((sum, r) => sum + parseFloat(r.grand_total || 0), 0);
        const totalProfit = (data || []).reduce((sum, r) => sum + parseFloat(r.total_profit || 0), 0);
        return [{ _id: null, totalRevenue, totalProfit }];
    },

    async countSaleItemsForProduct(productId) {
        const { count, error } = await supabase
            .from(ITEMS_TABLE)
            .select('id', { count: 'exact', head: true })
            .eq('product_id', productId);
        if (error) throw error;
        return count || 0;
    },

    async updateById(id, updates) {
        const row = {};
        if (updates.customerName !== undefined) row.customer_name = updates.customerName;
        if (updates.paymentMethod !== undefined) row.payment_method = updates.paymentMethod;
        if (updates.subtotal !== undefined) row.subtotal = updates.subtotal;
        if (updates.tax !== undefined) row.tax = updates.tax;
        if (updates.grandTotal !== undefined) row.grand_total = updates.grandTotal;
        const { data, error } = await supabase.from(TABLE).update(row).eq('id', id).select().single();
        if (error) throw error;

        // If items are being updated, delete old items and insert new ones
        if (updates.items) {
            await supabase.from(ITEMS_TABLE).delete().eq('sale_id', id);
            const itemRows = updates.items.map(item => ({
                sale_id: id,
                product_id: item.productId,
                product_name: item.productName,
                quantity: item.quantity,
                cost_price: item.costPrice || 0,
                unit_price: item.unitPrice,
                total: item.total,
            }));
            await supabase.from(ITEMS_TABLE).insert(itemRows);
        }

        const { data: items } = await supabase.from(ITEMS_TABLE).select('*').eq('sale_id', id);
        return Sale.format(data, items || []);
    },

    format(row, items = []) {
        if (!row) return null;
        const formattedItems = items.map(i => ({
            productId: i.product_id,
            productName: i.product_name,
            quantity: i.quantity,
            costPrice: parseFloat(i.cost_price),
            unitPrice: parseFloat(i.unit_price),
            total: parseFloat(i.total),
        }));
        return {
            _id: row.id,
            id: row.id,
            invoiceNumber: row.invoice_number,
            customerName: row.customer_name,
            customer: row.customer_id,
            customerId: row.customer_id,
            items: formattedItems,
            subtotal: parseFloat(row.subtotal),
            tax: parseFloat(row.tax),
            grandTotal: parseFloat(row.grand_total),
            totalCost: parseFloat(row.total_cost),
            totalProfit: parseFloat(row.total_profit),
            paymentMethod: row.payment_method,
            couponUsed: row.coupon_used,
            pointsEarned: row.points_earned,
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

export default Sale;
