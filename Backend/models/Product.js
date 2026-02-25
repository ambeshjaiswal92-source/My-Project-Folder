import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true,
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
    },
    originalPrice: {
        type: Number,
    },
    category: {
        type: String,
        required: true,
        enum: ['Performance Wear', 'Footwear', 'Equipment', 'Accessories'],
    },
    tag: {
        type: String,
        default: '',
    },
    badge: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Out of Stock', 'Low Stock'],
        default: 'Active',
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
    },
    sport: {
        type: String,
        default: '',
    },
    image: {
        type: String,
        default: '',
    },
    images: [{
        type: String,
    }],
    description: {
        type: String,
        default: '',
    },
    sizes: [{
        type: String,
    }],
    colors: [{
        type: String,
    }],
    gender: {
        type: String,
        enum: ['Men', 'Women', 'Unisex', 'Kids'],
        default: 'Unisex',
    },
    ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 },
    },
    reviews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        rating: Number,
        comment: String,
        date: { type: Date, default: Date.now },
    }],
}, {
    timestamps: true,
});

// Index for search
productSchema.index({ name: 'text', description: 'text', category: 'text', sport: 'text' });

export default mongoose.model('Product', productSchema);
