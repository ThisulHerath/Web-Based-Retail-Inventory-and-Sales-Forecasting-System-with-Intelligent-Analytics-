import Feedback from '../models/Feedback.js';

// @desc    Get approved feedbacks for public testimonials
// @route   GET /api/feedback/public
// @access  Public
export const getPublicFeedbacks = async (req, res) => {
    try {
        const limit = Number(req.query.limit || 6);
        const feedbacks = await Feedback.findPublic({ limit });
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current customer's feedbacks
// @route   GET /api/feedback/my
// @access  Private (Customer)
export const getMyFeedbacks = async (req, res) => {
    try {
        const customerId = req.customer._id || req.customer.id;
        const feedbacks = await Feedback.findByCustomer(customerId);
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private (Customer)
export const submitFeedback = async (req, res) => {
    try {
        const customerId = req.customer._id || req.customer.id;
        const { rating, comment } = req.body;

        const feedback = await Feedback.create({
            customerId,
            rating: Number(rating),
            comment,
        });

        res.status(201).json({
            message: 'Feedback submitted successfully and is pending review',
            feedback,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get feedbacks of a specific customer
// @route   GET /api/feedback/customer/:customerId
// @access  Private (Admin/Manager/Cashier)
export const getFeedbacksByCustomer = async (req, res) => {
    try {
        const feedbacks = await Feedback.findByCustomer(req.params.customerId);
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update feedback status (approve/rejected/pending)
// @route   PATCH /api/feedback/:id/status
// @access  Private (Admin/Manager)
export const updateFeedbackStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const existing = await Feedback.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        const updated = await Feedback.updateStatus(req.params.id, status);
        res.json({ message: 'Feedback status updated', feedback: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private (Admin/Manager)
export const deleteFeedback = async (req, res) => {
    try {
        const existing = await Feedback.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        await Feedback.deleteById(req.params.id);
        res.json({ message: 'Feedback deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
