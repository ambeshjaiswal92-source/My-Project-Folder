import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/orders
// @desc    Get all orders (admin only)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;
        let query = {};

        if (status) query.status = status;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/orders/my-orders
// @desc    Get logged in user's orders
// @access  Private
router.get('/my-orders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Users can only view their own orders unless admin
        if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        console.log('Order request received');
        console.log('User:', req.user ? { id: req.user._id, email: req.user.email, name: req.user.name } : 'undefined');
        console.log('Body:', JSON.stringify(req.body, null, 2));
        
        const { items, shippingAddress, paymentMethod } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // Calculate totals
        let itemsTotal = 0;
        const orderItems = [];

        for (const item of items) {
            // Check if product ID is a valid MongoDB ObjectId
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(item.product);
            let productData = null;

            if (isValidObjectId) {
                // Try to find product in MongoDB
                productData = await Product.findById(item.product);
                if (productData) {
                    // Update stock for MongoDB products
                    if (productData.stock < item.quantity) {
                        return res.status(400).json({ message: `Insufficient stock for ${productData.name}` });
                    }
                    productData.stock -= item.quantity;
                    if (productData.stock === 0) productData.status = 'Out of Stock';
                    await productData.save();
                }
            }

            // Use MongoDB product data if found, otherwise use data from request
            const orderItem = {
                product: productData ? productData._id : null,
                name: productData ? productData.name : (item.name || 'Unknown Product'),
                image: productData ? productData.image : (item.image || ''),
                price: productData ? productData.price : (Number(item.price) || 0),
                quantity: Number(item.quantity) || 1,
                size: item.size || '',
                color: item.color || '',
            };

            orderItems.push(orderItem);
            itemsTotal += orderItem.price * orderItem.quantity;
        }

        const shippingCost = itemsTotal > 999 ? 0 : 99;
        const tax = Math.round(itemsTotal * 0.18);
        const total = itemsTotal + shippingCost + tax;

        // Generate unique orderId
        const orderId = '#SO-' + Math.random().toString(36).substr(2, 6).toUpperCase() + Date.now().toString(36).slice(-2).toUpperCase();

        // Safeguard for user data
        const userEmail = req.user?.email || 'unknown@example.com';
        const userName = req.user?.name || 'Unknown User';

        console.log('Creating order with:', { orderId, userEmail, userName, itemsTotal, total, orderItems: orderItems.length });

        const order = new Order({
            orderId,
            user: req.user._id,
            email: userEmail,
            customerName: userName,
            items: orderItems,
            shippingAddress: shippingAddress || {},
            paymentMethod: paymentMethod || 'COD',
            itemsTotal: itemsTotal || 0,
            shippingCost,
            tax,
            total: total || 0,
        });

        await order.save();
        console.log('Order saved successfully:', order._id);

        // Update user stats
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { orders: 1, spent: total }
        });

        res.status(201).json(order);
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ message: error.message, stack: error.stack, name: error.name });
    }
});

// @route   PATCH /api/orders/:id/status
// @desc    Update order status (admin only)
// @access  Private/Admin
router.patch('/:id/status', protect, admin, async (req, res) => {
    try {
        const { status, trackingNumber } = req.body;
        
        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updateData = { status };
        if (trackingNumber) updateData.trackingNumber = trackingNumber;
        if (status === 'Delivered') updateData.deliveredAt = new Date();

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // If cancelled, restore stock
        if (status === 'Cancelled') {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity }
                });
            }
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/orders/stats/overview
// @desc    Get order statistics (admin only)
// @access  Private/Admin
router.get('/stats/overview', protect, admin, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalOrders = await Order.countDocuments();
        const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } });
        
        const totalRevenue = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);

        const todayRevenue = await Order.aggregate([
            { $match: { createdAt: { $gte: today }, status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);

        const byStatus = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.json({
            totalOrders,
            todayOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            todayRevenue: todayRevenue[0]?.total || 0,
            byStatus: byStatus.reduce((acc, item) => {
                acc[item._id.toLowerCase()] = item.count;
                return acc;
            }, {}),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
