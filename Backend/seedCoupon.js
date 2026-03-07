import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Coupon from './models/Coupon.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/moder_sports';

const seedCoupon = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Delete existing demo coupon if exists
    await Coupon.deleteOne({ code: 'SAVE20' });

    // Create demo coupon
    const demoCoupon = await Coupon.create({
      code: 'SAVE20',
      description: 'Get 20% off on orders above ₹500',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 500,
      maxDiscount: 1000,
      usageLimit: 100,
      usedCount: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Valid for 1 year
      isActive: true
    });

    console.log('✅ Demo coupon created successfully!');
    console.log('');
    console.log('📋 Coupon Details:');
    console.log('   Code: SAVE20');
    console.log('   Discount: 20% off');
    console.log('   Min Order: ₹500');
    console.log('   Max Discount: ₹1000');
    console.log('');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding coupon:', error);
    process.exit(1);
  }
};

seedCoupon();
