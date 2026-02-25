import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: false,
    },
    name: {
        type: String,
        required: true,
    },
    image: String,
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
    size: String,
    color: String,
});

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    email: {
        type: String,
        required: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        phone: String,
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'Card', 'UPI', 'NetBanking'],
        default: 'COD',
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
        default: 'Pending',
    },
    paymentDetails: {
        transactionId: String,
        paidAt: Date,
    },
    itemsTotal: {
        type: Number,
        required: true,
    },
    shippingCost: {
        type: Number,
        default: 0,
    },
    tax: {
        type: Number,
        default: 0,
    },
    discount: {
        type: Number,
        default: 0,
    },
    total: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
    trackingNumber: String,
    notes: String,
    deliveredAt: Date,
}, {
    timestamps: true,
});

// Generate order ID before saving
orderSchema.pre('save', function() {
    if (!this.orderId) {
        this.orderId = '#SO-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }
});

export default mongoose.model('Order', orderSchema);
