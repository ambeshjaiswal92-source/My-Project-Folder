import express from 'express';
import Coupon from '../models/Coupon.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Get all coupons (Admin)
router.get('/', protect, admin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupons', error: error.message });
  }
});

// Get single coupon (Admin)
router.get('/:id', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupon', error: error.message });
  }
});

// Create coupon (Admin)
router.post('/', protect, admin, async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      startDate,
      endDate,
      isActive,
      applicableCategories,
      applicableProducts
    } = req.body;

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      startDate,
      endDate,
      isActive,
      applicableCategories,
      applicableProducts
    });

    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Error creating coupon', error: error.message });
  }
});

// Update coupon (Admin)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      startDate,
      endDate,
      isActive,
      applicableCategories,
      applicableProducts
    } = req.body;

    // Check if new code already exists (exclude current coupon)
    if (code) {
      const existingCoupon = await Coupon.findOne({ 
        code: code.toUpperCase(), 
        _id: { $ne: req.params.id } 
      });
      if (existingCoupon) {
        return res.status(400).json({ message: 'Coupon code already exists' });
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      {
        code: code?.toUpperCase(),
        description,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscount,
        usageLimit,
        startDate,
        endDate,
        isActive,
        applicableCategories,
        applicableProducts
      },
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Error updating coupon', error: error.message });
  }
});

// Delete coupon (Admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting coupon', error: error.message });
  }
});

// Toggle coupon status (Admin)
router.patch('/:id/toggle', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling coupon status', error: error.message });
  }
});

// Validate coupon (Public - for checkout)
router.post('/validate', async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    if (!coupon.isValid()) {
      return res.status(400).json({ message: 'Coupon is expired or has reached usage limit' });
    }

    if (orderTotal < coupon.minOrderAmount) {
      return res.status(400).json({ 
        message: `Minimum order amount is $${coupon.minOrderAmount}` 
      });
    }

    const discount = coupon.calculateDiscount(orderTotal);

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      },
      discount,
      finalTotal: orderTotal - discount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error validating coupon', error: error.message });
  }
});

// Apply coupon (increment usage count)
router.post('/apply', async (req, res) => {
  try {
    const { code } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon || !coupon.isValid()) {
      return res.status(400).json({ message: 'Invalid or expired coupon' });
    }

    coupon.usedCount += 1;
    await coupon.save();

    res.json({ message: 'Coupon applied successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error applying coupon', error: error.message });
  }
});

export default router;
