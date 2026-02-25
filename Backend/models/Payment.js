import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        unique: true,
        required: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'INR',
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'Card', 'UPI', 'NetBanking'],
        required: true,
    },
    paymentDetails: {
        // For Card
        cardLast4: String,
        cardBrand: String,
        // For UPI
        upiId: String,
        // For NetBanking
        bankName: String,
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Completed', 'Failed', 'Refunded', 'Cancelled'],
        default: 'Pending',
    },
    paidAt: {
        type: Date,
    },
    refundedAt: {
        type: Date,
    },
    refundReason: {
        type: String,
    },
    refundAmount: {
        type: Number,
        default: 0,
    },
    gatewayResponse: {
        type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
        type: String,
    },
    failureReason: {
        type: String,
    },
}, {
    timestamps: true,
});

// Generate transaction ID before saving
paymentSchema.pre('save', function() {
    if (!this.transactionId) {
        const prefix = this.paymentMethod === 'COD' ? 'COD' : 
                       this.paymentMethod === 'Card' ? 'CARD' :
                       this.paymentMethod === 'UPI' ? 'UPI' : 'NB';
        this.transactionId = `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    }
});

export default mongoose.model('Payment', paymentSchema);
