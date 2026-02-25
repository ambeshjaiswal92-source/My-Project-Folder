import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false,
    },
    phone: {
        type: String,
        default: '',
    },
    role: {
        type: String,
        default: 'admin',
        immutable: true,
    },
    permissions: {
        manageProducts: { type: Boolean, default: true },
        manageOrders: { type: Boolean, default: true },
        manageUsers: { type: Boolean, default: true },
        viewAnalytics: { type: Boolean, default: true },
        manageSettings: { type: Boolean, default: false },
    },
    status: {
        type: String,
        enum: ['Active', 'Suspended'],
        default: 'Active',
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Encrypt password before saving
adminSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match password
adminSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('Admin', adminSchema);
