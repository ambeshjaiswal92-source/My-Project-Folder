import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MongoDBURI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: 'admin@modersports.com' });
        if (existingAdmin) {
            console.log('Admin already exists!');
            console.log('Email: admin@modersports.com');
            process.exit(0);
        }

        // Create admin
        const admin = await Admin.create({
            name: 'Super Admin',
            email: 'admin@modersports.com',
            password: 'admin123',
            permissions: {
                manageProducts: true,
                manageOrders: true,
                manageUsers: true,
                viewAnalytics: true,
                manageSettings: true,
            },
        });

        console.log('✅ Admin created successfully!');
        console.log('Email: admin@modersports.com');
        console.log('Password: admin123');
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

createAdmin();
