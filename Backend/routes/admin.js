import express from 'express';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin access
router.use(protect, admin);

// @route   GET /api/admin/dashboard
// @desc    Get dashboard overview
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thisWeek = new Date();
        thisWeek.setDate(thisWeek.getDate() - 7);

        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);

        // User stats (all users collection are regular users now)
        const totalUsers = await User.countDocuments();
        const newUsersToday = await User.countDocuments({
            createdAt: { $gte: today }
        });

        // Product stats
        const totalProducts = await Product.countDocuments();
        const lowStockProducts = await Product.countDocuments({
            stock: { $gt: 0, $lte: 10 }
        });
        const outOfStockProducts = await Product.countDocuments({ stock: 0 });

        // Order stats
        const totalOrders = await Order.countDocuments();
        const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } });
        const pendingOrders = await Order.countDocuments({ status: 'Pending' });

        // Revenue stats
        const totalRevenueResult = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const totalRevenue = totalRevenueResult[0]?.total || 0;

        const todayRevenueResult = await Order.aggregate([
            { $match: { createdAt: { $gte: today }, status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const todayRevenue = todayRevenueResult[0]?.total || 0;

        const weekRevenueResult = await Order.aggregate([
            { $match: { createdAt: { $gte: thisWeek }, status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const weekRevenue = weekRevenueResult[0]?.total || 0;

        const monthRevenueResult = await Order.aggregate([
            { $match: { createdAt: { $gte: thisMonth }, status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const monthRevenue = monthRevenueResult[0]?.total || 0;

        // Recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email');

        // Top selling products
        const topProducts = await Order.aggregate([
            { $unwind: '$items' },
            { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
            { $unwind: '$product' },
            { $project: { name: '$product.name', image: '$product.image', totalSold: 1, revenue: 1 } }
        ]);

        res.json({
            users: {
                total: totalUsers,
                newToday: newUsersToday,
            },
            products: {
                total: totalProducts,
                lowStock: lowStockProducts,
                outOfStock: outOfStockProducts,
            },
            orders: {
                total: totalOrders,
                today: todayOrders,
                pending: pendingOrders,
            },
            revenue: {
                total: totalRevenue,
                today: todayRevenue,
                week: weekRevenue,
                month: monthRevenue,
            },
            recentOrders,
            topProducts,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/admin/analytics/sales
// @desc    Get sales analytics
// @access  Private/Admin
router.get('/analytics/sales', async (req, res) => {
    try {
        const { period = '7d' } = req.query;
        
        let startDate = new Date();
        switch (period) {
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(startDate.getDate() - 90);
                break;
        }

        // Daily sales
        const dailySales = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate }, status: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    orders: { $sum: 1 },
                    revenue: { $sum: '$total' },
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Sales by category
        const salesByCategory = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate }, status: { $ne: 'Cancelled' } } },
            { $unwind: '$items' },
            { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
            { $unwind: '$product' },
            {
                $group: {
                    _id: '$product.category',
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                    quantity: { $sum: '$items.quantity' },
                }
            }
        ]);

        // Sales by payment method
        const salesByPayment = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate }, status: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: '$paymentMethod',
                    count: { $sum: 1 },
                    revenue: { $sum: '$total' },
                }
            }
        ]);

        res.json({
            dailySales,
            salesByCategory,
            salesByPayment,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/admin/reports/inventory
// @desc    Get inventory report
// @access  Private/Admin
router.get('/reports/inventory', async (req, res) => {
    try {
        const products = await Product.find().sort({ stock: 1 });
        
        const inventoryValue = await Product.aggregate([
            { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$stock'] } } } }
        ]);

        const stockByCategory = await Product.aggregate([
            { $group: { _id: '$category', totalStock: { $sum: '$stock' }, products: { $sum: 1 } } }
        ]);

        res.json({
            products,
            totalValue: inventoryValue[0]?.total || 0,
            stockByCategory,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/admin/users/create-admin
// @desc    Create admin user (uses Admin collection)
// @access  Private/Admin
router.post('/users/create-admin', async (req, res) => {
    try {
        const { name, email, password, permissions } = req.body;

        const userExists = await User.findOne({ email: email.toLowerCase() });
        const adminExists = await Admin.findOne({ email: email.toLowerCase() });
        
        if (userExists || adminExists) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const newAdmin = await Admin.create({
            name,
            email: email.toLowerCase(),
            password,
            permissions: permissions || {},
        });

        res.status(201).json({
            id: newAdmin._id,
            name: newAdmin.name,
            email: newAdmin.email,
            role: 'admin',
            permissions: newAdmin.permissions,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/admin/admins
// @desc    Get all admins
// @access  Private/Admin
router.get('/admins', async (req, res) => {
    try {
        const admins = await Admin.find().select('-password');
        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/admin/admins/:id
// @desc    Update admin
// @access  Private/Admin
router.put('/admins/:id', async (req, res) => {
    try {
        const { name, phone, permissions, status } = req.body;
        
        const adminToUpdate = await Admin.findById(req.params.id);
        if (!adminToUpdate) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        if (name) adminToUpdate.name = name;
        if (phone) adminToUpdate.phone = phone;
        if (permissions) adminToUpdate.permissions = permissions;
        if (status) adminToUpdate.status = status;

        await adminToUpdate.save();

        res.json({
            id: adminToUpdate._id,
            name: adminToUpdate.name,
            email: adminToUpdate.email,
            phone: adminToUpdate.phone,
            permissions: adminToUpdate.permissions,
            status: adminToUpdate.status,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/admin/admins/:id
// @desc    Delete admin
// @access  Private/Admin
router.delete('/admins/:id', async (req, res) => {
    try {
        // Prevent deleting yourself
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete your own admin account' });
        }

        const adminToDelete = await Admin.findById(req.params.id);
        if (!adminToDelete) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        await adminToDelete.deleteOne();
        res.json({ message: 'Admin deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/admin/settings
// @desc    Get admin settings
// @access  Private/Admin
router.get('/settings', async (req, res) => {
    // In production, fetch from database or config
    res.json({
        storeName: 'Moder Sports Hub',
        currency: 'INR',
        taxRate: 18,
        freeShippingThreshold: 999,
        shippingCost: 99,
        orderStatuses: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        paymentMethods: ['COD', 'Card', 'UPI', 'NetBanking'],
    });
});

export default router;
