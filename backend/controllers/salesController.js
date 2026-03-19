import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import StockTransaction from '../models/StockTransaction.js';
import Customer from '../models/Customer.js';
import Coupon from '../models/Coupon.js';
import { autoGenerateLoyaltyCoupon } from './couponController.js';

// @desc    Get all sales with pagination, search, and filter
// @route   GET /api/sales
// @access  Private
export const getAllSales = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', startDate, endDate } = req.query;

        let parsedStartDate = null;
        let parsedEndDate = null;

        if (startDate) {
            parsedStartDate = new Date(`${startDate}T00:00:00`);
            if (Number.isNaN(parsedStartDate.getTime())) {
                return res.status(400).json({ message: 'Invalid startDate format. Use YYYY-MM-DD.' });
            }
        }

        if (endDate) {
            parsedEndDate = new Date(`${endDate}T23:59:59.999`);
            if (Number.isNaN(parsedEndDate.getTime())) {
                return res.status(400).json({ message: 'Invalid endDate format. Use YYYY-MM-DD.' });
            }
        }

        if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
            return res.status(400).json({ message: 'startDate must be less than or equal to endDate.' });
        }

        let query = {};
        if (search) query.invoiceNumber = { $regex: search };
        if (parsedStartDate || parsedEndDate) {
            query.createdAt = {};
            if (parsedStartDate) query.createdAt.$gte = parsedStartDate;
            if (parsedEndDate) query.createdAt.$lte = parsedEndDate;
        }

        const sales = await Sale.find(query, {
            limit: Number(limit),
            skip: (Number(page) - 1) * Number(limit),
        });

        const count = await Sale.countDocuments(query);

        res.status(200).json({
            sales,
            totalPages: Math.ceil(count / Number(limit)),
            currentPage: Number(page),
            totalSales: count,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single sale by ID
// @route   GET /api/sales/:id
// @access  Private
export const getSaleById = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id);
        if (!sale) return res.status(404).json({ message: 'Sale not found' });
        res.status(200).json(sale);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new sale (with Inventory integration)
// @route   POST /api/sales
// @access  Private
export const createSale = async (req, res) => {
    try {
        const { customerName, customerId, items, paymentMethod, couponCode } = req.body;

        if (!customerName || !items || items.length === 0 || !paymentMethod) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        let totalCost = 0;
        const processedItems = [];

        // Validate stock availability and capture cost price
        for (const item of items) {
            if (item.productId) {
                const product = await Product.findById(item.productId);
                if (!product) {
                    return res.status(404).json({ message: `Product not found: ${item.productName}` });
                }
                const inv = await Inventory.findOne({ product: item.productId });
                const stock = inv ? inv.displayedStock : 0;
                if (stock < item.quantity) {
                    return res.status(400).json({
                        message: `Insufficient stock for ${product.productName}. Available: ${stock}, Requested: ${item.quantity}`,
                    });
                }

                totalCost += product.costPrice * item.quantity;
                processedItems.push({
                    ...item,
                    costPrice: product.costPrice
                });
            } else {
                processedItems.push({
                    ...item,
                    costPrice: item.costPrice || 0
                });
                totalCost += (item.costPrice || 0) * item.quantity;
            }
        }

        const subtotal = processedItems.reduce((sum, item) => sum + item.total, 0);

        let customer = null;
        if (customerId) {
            customer = await Customer.findById(customerId);
            if (!customer) {
                return res.status(404).json({ message: 'Selected customer not found' });
            }
        }

        let discount = 0;
        let couponUsedId = null;

        // Apply Coupon if provided
        if (couponCode) {
            const cleanedCouponCode = couponCode.trim().toUpperCase();
            const coupon = await Coupon.findOne({ code: cleanedCouponCode, isUsed: false });

            if (!coupon) {
                return res.status(400).json({ message: 'Invalid or already used coupon code' });
            }

            if (new Date(coupon.expiryDate) < new Date()) {
                return res.status(400).json({ message: 'Coupon has expired' });
            }

            if (customerId && coupon.customerId && coupon.customerId !== customerId) {
                return res.status(400).json({ message: 'Coupon does not belong to selected customer' });
            }

            if (coupon.discountType === 'Percentage') {
                discount = subtotal * (coupon.discountValue / 100);
            } else {
                discount = coupon.discountValue;
            }

            // Guard against discount exceeding subtotal
            discount = Math.min(discount, subtotal);
            couponUsedId = coupon._id;
        }

        const discountedSubtotal = subtotal - discount;
        const tax = discountedSubtotal * 0.1;
        const grandTotal = discountedSubtotal + tax;
        const totalProfit = discountedSubtotal - totalCost;

        // Generate invoice number
        const lastSale = await Sale.findOne({ sort: { createdAt: -1 } });
        let invoiceNumber;
        if (lastSale && lastSale.invoiceNumber) {
            const lastNumber = parseInt(lastSale.invoiceNumber.replace('INV-', ''));
            invoiceNumber = `INV-${String(lastNumber + 1).padStart(6, '0')}`;
        } else {
            invoiceNumber = 'INV-000001';
        }

        // Calculate Loyalty Points for Customer
        let pointsEarned = 0;
        if (customerId) {
            pointsEarned = Math.floor(discountedSubtotal / 100);
        }

        const sale = await Sale.create({
            invoiceNumber,
            customerName,
            customer: customerId || null,
            items: processedItems,
            subtotal,
            discountAmount: discount,
            discountedSubtotal,
            tax,
            grandTotal,
            totalCost,
            totalProfit,
            paymentMethod,
            couponUsed: couponUsedId,
            pointsEarned
        });

        // Update Coupon status
        if (couponUsedId) {
            await Coupon.findByIdAndUpdate(couponUsedId, { isUsed: true });
        }

        // Update Customer Record
        if (customerId && customer) {
            const newLoyaltyPoints = (customer.loyaltyPoints || 0) + pointsEarned;
            const newTotalPurchases = (customer.totalPurchases || 0) + 1;

            let finalPoints = newLoyaltyPoints;
            // Loyalty Milestone: 500 points -> Auto 5% Coupon
            if (newLoyaltyPoints >= 500) {
                await autoGenerateLoyaltyCoupon(customer._id);
                finalPoints = newLoyaltyPoints - 500;
            }

            await Customer.updateById(customerId, {
                loyaltyPoints: finalPoints,
                totalPurchases: newTotalPurchases,
            });
        }

        // Deduct from Inventory
        for (const item of items) {
            if (item.productId) {
                let inv = await Inventory.findOne({ product: item.productId });
                if (inv) {
                    inv.displayedStock -= item.quantity;
                    inv.lastUpdated = new Date();
                    await inv.save();
                }
                await StockTransaction.create({
                    product: item.productId,
                    type: 'stock-out',
                    quantity: item.quantity,
                    createdBy: req.user._id,
                    notes: `Sale: ${invoiceNumber}`,
                    referenceType: 'sale',
                    referenceId: sale._id,
                });
            }
        }

        res.status(201).json(sale);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update sale
// @route   PUT /api/sales/:id
// @access  Private (Admin & Manager)
export const updateSale = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id);
        if (!sale) return res.status(404).json({ message: 'Sale not found' });

        const { customerName, items, paymentMethod } = req.body;
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const tax = subtotal * 0.1;
        const grandTotal = subtotal + tax;

        const updatedSale = await Sale.updateById(req.params.id, {
            customerName: customerName || sale.customerName,
            items: items || sale.items,
            paymentMethod: paymentMethod || sale.paymentMethod,
            subtotal,
            tax,
            grandTotal,
        });

        res.status(200).json(updatedSale);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete sale (restore Inventory stock)
// @route   DELETE /api/sales/:id
// @access  Private (Admin only)
export const deleteSale = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id);
        if (!sale) return res.status(404).json({ message: 'Sale not found' });

        // Restore stock to Inventory
        for (const item of sale.items) {
            if (item.productId) {
                let inv = await Inventory.findOne({ product: item.productId });
                if (inv) {
                    inv.displayedStock += item.quantity;
                    inv.lastUpdated = new Date();
                    await inv.save();
                }
                await StockTransaction.create({
                    product: item.productId,
                    type: 'stock-in',
                    quantity: item.quantity,
                    createdBy: req.user._id,
                    notes: `Sale deleted: ${sale.invoiceNumber}`,
                    referenceType: 'manual',
                });
            }
        }

        await Sale.deleteOne(req.params.id);
        res.status(200).json({ message: 'Sale deleted successfully and stock restored' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get detailed sales analytics (charts + top products)
// @route   GET /api/sales/analytics
// @access  Private
export const getSalesAnalytics = async (req, res) => {
    try {
        const { sales, items } = await Sale.getAnalyticsData();

        // Payment method breakdown
        const paymentMap = {};
        for (const s of sales) {
            const method = s.payment_method || 'Unknown';
            if (!paymentMap[method]) paymentMap[method] = { name: method, count: 0, revenue: 0 };
            paymentMap[method].count += 1;
            paymentMap[method].revenue += parseFloat(s.grand_total || 0);
        }

        // Daily revenue for last 30 days
        const now = new Date();
        const dailyMap = {};
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            dailyMap[key] = { date: key, revenue: 0, profit: 0, count: 0 };
        }
        for (const s of sales) {
            const key = (s.created_at || '').slice(0, 10);
            if (dailyMap[key]) {
                dailyMap[key].revenue += parseFloat(s.grand_total || 0);
                dailyMap[key].profit += parseFloat(s.total_profit || 0);
                dailyMap[key].count += 1;
            }
        }

        // Top 5 products by revenue
        const productMap = {};
        for (const item of items) {
            const name = item.product_name || 'Unknown';
            if (!productMap[name]) productMap[name] = { name, quantity: 0, revenue: 0 };
            productMap[name].quantity += item.quantity;
            productMap[name].revenue += parseFloat(item.total || 0);
        }
        const topProducts = Object.values(productMap)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.grand_total || 0), 0);
        const totalProfit = sales.reduce((sum, s) => sum + parseFloat(s.total_profit || 0), 0);
        const totalSalesCount = sales.length;

        res.status(200).json({
            paymentBreakdown: Object.values(paymentMap),
            dailyRevenue: Object.values(dailyMap),
            topProducts,
            summary: { totalRevenue, totalProfit, totalSalesCount },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get sales statistics
// @route   GET /api/sales/stats/summary
// @access  Private
export const getSalesStats = async (req, res) => {
    try {
        const totalSales = await Sale.countDocuments();
        const revenueResult = await Sale.aggregate();
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
        const totalProfit = revenueResult.length > 0 ? revenueResult[0].totalProfit : 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaySales = await Sale.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } });

        res.status(200).json({ totalSales, totalRevenue, totalProfit, todaySales });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
