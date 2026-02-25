import express from 'express';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import { generateToken, protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log('Register attempt:', { name, email });

        // Check if user exists in both collections
        const userExists = await User.findOne({ email: email.toLowerCase() });
        const adminExists = await Admin.findOne({ email: email.toLowerCase() });
        
        if (userExists || adminExists) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Create user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
        });

        console.log('User created:', user._id);

        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: 'user',
            token: generateToken(user._id, 'user'),
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', email);

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if suspended
        if (user.status === 'Suspended') {
            return res.status(403).json({ message: 'Your account has been suspended' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Update last login using findByIdAndUpdate to avoid triggering pre-save hook
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        console.log('Login successful:', user._id);

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: 'user',
            token: generateToken(user._id, 'user'),
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/auth/admin/login
// @desc    Admin login (uses Admin collection)
// @access  Public
router.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find admin in Admin collection
        const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');

        if (!admin) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        if (admin.status === 'Suspended') {
            return res.status(403).json({ message: 'Admin account suspended' });
        }

        const isMatch = await admin.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        // Update last login using findByIdAndUpdate to avoid triggering pre-save hook
        await Admin.findByIdAndUpdate(admin._id, { lastLogin: new Date() });

        res.json({
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: 'admin',
            permissions: admin.permissions,
            token: generateToken(admin._id, 'admin'),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/auth/admin/register
// @desc    Register a new admin (requires existing admin)
// @access  Private/Admin
router.post('/admin/register', protect, async (req, res) => {
    try {
        // Only admins can create other admins
        if (req.userType !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { name, email, password, permissions } = req.body;

        const adminExists = await Admin.findOne({ email: email.toLowerCase() });
        const userExists = await User.findOne({ email: email.toLowerCase() });
        
        if (adminExists || userExists) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const admin = await Admin.create({
            name,
            email: email.toLowerCase(),
            password,
            permissions: permissions || {},
        });

        res.status(201).json({
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: 'admin',
            permissions: admin.permissions,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user/admin
// @access  Private
router.get('/me', protect, async (req, res) => {
    if (req.userType === 'admin') {
        res.json({
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: 'admin',
            phone: req.user.phone,
            permissions: req.user.permissions,
        });
    } else {
        res.json({
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: 'user',
            phone: req.user.phone,
            address: req.user.address,
        });
    }
});

export default router;
