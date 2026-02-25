import express from 'express';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/payment/process
// @desc    Process payment
// @access  Private
router.post('/process', protect, async (req, res) => {
    try {
        const { orderId, paymentMethod, paymentDetails } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify user owns this order
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Create payment record
        const transactionId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const payment = new Payment({
            transactionId,
            order: order._id,
            user: req.user._id,
            amount: order.total,
            paymentMethod,
            status: 'Processing',
            ipAddress: req.ip,
        });

        // Simulate payment processing based on method
        let paymentResult = { success: false };

        switch (paymentMethod) {
            case 'COD':
                payment.status = 'Pending';
                paymentResult = {
                    success: true,
                    message: 'Cash on Delivery confirmed',
                };
                break;

            case 'Card':
                if (paymentDetails?.cardNumber && paymentDetails?.cvv) {
                    payment.paymentDetails = {
                        cardLast4: paymentDetails.cardNumber.slice(-4),
                        cardBrand: detectCardBrand(paymentDetails.cardNumber),
                    };
                    payment.status = 'Completed';
                    payment.paidAt = new Date();
                    paymentResult = {
                        success: true,
                        message: 'Card payment successful',
                    };
                } else {
                    payment.status = 'Failed';
                    payment.failureReason = 'Invalid card details';
                    paymentResult = {
                        success: false,
                        message: 'Invalid card details',
                    };
                }
                break;

            case 'UPI':
                if (paymentDetails?.upiId) {
                    payment.paymentDetails = { upiId: paymentDetails.upiId };
                    payment.status = 'Completed';
                    payment.paidAt = new Date();
                    paymentResult = {
                        success: true,
                        message: 'UPI payment successful',
                    };
                } else {
                    payment.status = 'Failed';
                    payment.failureReason = 'Invalid UPI ID';
                    paymentResult = {
                        success: false,
                        message: 'Invalid UPI ID',
                    };
                }
                break;

            case 'NetBanking':
                if (paymentDetails?.bank) {
                    payment.paymentDetails = { bankName: paymentDetails.bank };
                    payment.status = 'Completed';
                    payment.paidAt = new Date();
                    paymentResult = {
                        success: true,
                        message: 'Net Banking payment successful',
                    };
                } else {
                    payment.status = 'Failed';
                    payment.failureReason = 'Bank selection required';
                    paymentResult = {
                        success: false,
                        message: 'Bank selection required',
                    };
                }
                break;

            default:
                payment.status = 'Failed';
                payment.failureReason = 'Invalid payment method';
                paymentResult = {
                    success: false,
                    message: 'Invalid payment method',
                };
        }

        // Save payment record
        await payment.save();

        if (paymentResult.success) {
            order.paymentStatus = paymentMethod === 'COD' ? 'Pending' : 'Paid';
            order.paymentMethod = paymentMethod;
            order.paymentDetails = {
                transactionId: payment.transactionId,
                paidAt: payment.paidAt,
            };
            order.status = 'Processing';
            await order.save();

            res.json({
                success: true,
                message: paymentResult.message,
                transactionId: payment.transactionId,
                paymentId: payment._id,
                order,
            });
        } else {
            order.paymentStatus = 'Failed';
            await order.save();

            res.status(400).json({
                success: false,
                message: paymentResult.message,
                paymentId: payment._id,
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Helper function to detect card brand
function detectCardBrand(cardNumber) {
    const num = cardNumber.replace(/\s/g, '');
    if (/^4/.test(num)) return 'Visa';
    if (/^5[1-5]/.test(num)) return 'Mastercard';
    if (/^3[47]/.test(num)) return 'Amex';
    if (/^6(?:011|5)/.test(num)) return 'Discover';
    if (/^(?:2131|1800|35)/.test(num)) return 'JCB';
    if (/^60/.test(num) || /^65/.test(num) || /^81/.test(num) || /^82/.test(num)) return 'RuPay';
    return 'Unknown';
}

// @route   GET /api/payment/:id
// @desc    Get payment by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('order')
            .populate('user', 'name email');

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Users can only view their own payments unless admin
        if (req.userType !== 'admin' && payment.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/payment/transaction/:transactionId
// @desc    Get payment by transaction ID
// @access  Private
router.get('/transaction/:transactionId', protect, async (req, res) => {
    try {
        const payment = await Payment.findOne({ transactionId: req.params.transactionId })
            .populate('order')
            .populate('user', 'name email');

        if (!payment) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (req.userType !== 'admin' && payment.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/payment/verify
// @desc    Verify payment status
// @access  Private
router.post('/verify', protect, async (req, res) => {
    try {
        const { transactionId } = req.body;

        const payment = await Payment.findOne({ transactionId })
            .populate('order');

        if (!payment) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json({
            verified: true,
            paymentId: payment._id,
            transactionId: payment.transactionId,
            status: payment.status,
            amount: payment.amount,
            paymentMethod: payment.paymentMethod,
            orderId: payment.order._id,
            orderStatus: payment.order.status,
            paidAt: payment.paidAt,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/payment/refund
// @desc    Process refund (admin only)
// @access  Private/Admin
router.post('/refund', protect, admin, async (req, res) => {
    try {
        const { orderId, reason, amount } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const payment = await Payment.findOne({ order: orderId, status: 'Completed' });
        if (!payment) {
            return res.status(400).json({ message: 'No completed payment found for this order' });
        }

        const refundAmount = amount || payment.amount;

        // Update payment record
        payment.status = 'Refunded';
        payment.refundedAt = new Date();
        payment.refundReason = reason;
        payment.refundAmount = refundAmount;
        await payment.save();

        // Update order
        order.paymentStatus = 'Refunded';
        order.status = 'Cancelled';
        order.notes = `Refund reason: ${reason}. Amount: ₹${refundAmount}`;
        await order.save();

        res.json({
            success: true,
            message: 'Refund processed successfully',
            payment,
            order,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/payment/user/history
// @desc    Get user's payment history
// @access  Private
router.get('/user/history', protect, async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user._id })
            .populate('order', 'orderId status total')
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/payment/all
// @desc    Get all payments (admin only)
// @access  Private/Admin
router.get('/all', protect, admin, async (req, res) => {
    try {
        const { status, method, startDate, endDate } = req.query;
        let query = {};

        if (status) query.status = status;
        if (method) query.paymentMethod = method;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const payments = await Payment.find(query)
            .populate('order', 'orderId status')
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/payment/stats
// @desc    Get payment statistics (admin only)
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalPayments = await Payment.countDocuments();
        const completedPayments = await Payment.countDocuments({ status: 'Completed' });
        const failedPayments = await Payment.countDocuments({ status: 'Failed' });
        const refundedPayments = await Payment.countDocuments({ status: 'Refunded' });

        const totalRevenue = await Payment.aggregate([
            { $match: { status: 'Completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const todayRevenue = await Payment.aggregate([
            { $match: { status: 'Completed', paidAt: { $gte: today } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const byMethod = await Payment.aggregate([
            { $match: { status: 'Completed' } },
            { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$amount' } } }
        ]);

        const refundedAmount = await Payment.aggregate([
            { $match: { status: 'Refunded' } },
            { $group: { _id: null, total: { $sum: '$refundAmount' } } }
        ]);

        res.json({
            totalPayments,
            completedPayments,
            failedPayments,
            refundedPayments,
            totalRevenue: totalRevenue[0]?.total || 0,
            todayRevenue: todayRevenue[0]?.total || 0,
            refundedAmount: refundedAmount[0]?.total || 0,
            byMethod,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/payment/methods
// @desc    Get available payment methods
// @access  Public
router.get('/methods', (req, res) => {
    res.json({
        methods: [
            {
                id: 'COD',
                name: 'Cash on Delivery',
                description: 'Pay when you receive',
                icon: '💵',
                available: true,
            },
            {
                id: 'Card',
                name: 'Credit/Debit Card',
                description: 'Visa, Mastercard, RuPay',
                icon: '💳',
                available: true,
            },
            {
                id: 'UPI',
                name: 'UPI',
                description: 'GPay, PhonePe, Paytm',
                icon: '📱',
                available: true,
            },
            {
                id: 'NetBanking',
                name: 'Net Banking',
                description: 'All major banks',
                icon: '🏦',
                available: true,
            },
        ],
    });
});

export default router;
