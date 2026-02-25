import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

// Protect routes - verify token
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Check user type from token and find in appropriate collection
            if (decoded.type === 'admin') {
                req.user = await Admin.findById(decoded.id).select('-password');
                req.userType = 'admin';
            } else {
                req.user = await User.findById(decoded.id).select('-password');
                req.userType = 'user';
            }
            
            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }
            
            if (req.user.status === 'Suspended') {
                return res.status(403).json({ message: 'Account suspended' });
            }
            
            return next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    return res.status(401).json({ message: 'Not authorized, no token' });
};

// Admin only middleware
export const admin = (req, res, next) => {
    if (req.userType === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as admin' });
    }
};

// Generate JWT token with user type
export const generateToken = (id, type = 'user') => {
    return jwt.sign({ id, type }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};
