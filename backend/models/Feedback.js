import { supabase } from '../config/db.js';

const TABLE = 'customer_feedbacks';

const Feedback = {
    async create({ customerId, rating, comment }) {
        const row = {
            customer_id: customerId,
            rating,
            comment,
            status: 'pending',
        };

        const { data, error } = await supabase
            .from(TABLE)
            .insert(row)
            .select('*')
            .single();

        if (error) throw error;
        return Feedback.format(data);
    },

    async findPublic({ limit = 6 } = {}) {
        const { data, error } = await supabase
            .from(TABLE)
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return await Feedback.attachCustomerDetails(data || []);
    },

    async findByCustomer(customerId) {
        const { data, error } = await supabase
            .from(TABLE)
            .select('*')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return await Feedback.attachCustomerDetails(data || []);
    },

    async findById(id) {
        const { data, error } = await supabase
            .from(TABLE)
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        const rows = await Feedback.attachCustomerDetails([data]);
        return rows[0] || null;
    },

    async updateStatus(id, status) {
        const { data, error } = await supabase
            .from(TABLE)
            .update({ status })
            .eq('id', id)
            .select('*')
            .single();

        if (error) throw error;
        const rows = await Feedback.attachCustomerDetails([data]);
        return rows[0] || null;
    },

    async deleteById(id) {
        const { error } = await supabase.from(TABLE).delete().eq('id', id);
        if (error) throw error;
    },

    async attachCustomerDetails(feedbackRows) {
        if (!feedbackRows.length) return [];

        const customerIds = [...new Set(feedbackRows.map((row) => row.customer_id))];
        const { data: customers, error } = await supabase
            .from('customers')
            .select('id, first_name, last_name')
            .in('id', customerIds);

        if (error) throw error;

        const customerById = new Map((customers || []).map((c) => [c.id, c]));

        return feedbackRows.map((row) => {
            const customer = customerById.get(row.customer_id);
            return Feedback.format(row, customer);
        });
    },

    format(row, customer = null) {
        if (!row) return null;

        const firstName = customer?.first_name || '';
        const lastName = customer?.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'Customer';

        return {
            _id: row.id,
            id: row.id,
            customerId: row.customer_id,
            rating: row.rating,
            comment: row.comment,
            status: row.status,
            customerName: fullName,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    },
};

export default Feedback;
