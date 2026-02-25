import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const sampleProducts = [
    {
        name: 'Nike Air Max Pro Running Shoes',
        price: 8999,
        originalPrice: 12999,
        category: 'Footwear',
        tag: 'Best Seller',
        badge: 'New',
        status: 'Active',
        stock: 50,
        sport: 'running',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=640&q=80',
        description: 'Premium running shoes with air cushioning technology for maximum comfort.',
        sizes: ['7', '8', '9', '10', '11'],
        colors: ['Black', 'White', 'Red'],
        gender: 'Unisex',
        ratings: { average: 4.5, count: 128 },
    },
    {
        name: 'Adidas Performance Jersey',
        price: 2499,
        originalPrice: 3499,
        category: 'Performance Wear',
        tag: 'Popular',
        status: 'Active',
        stock: 100,
        sport: 'football',
        image: 'https://images.unsplash.com/photo-1580087256394-dc596e1c8f4f?auto=format&fit=crop&w=640&q=80',
        description: 'Breathable performance jersey for intense training sessions.',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Blue', 'Red', 'Black'],
        gender: 'Men',
        ratings: { average: 4.3, count: 85 },
    },
    {
        name: 'Wilson Pro Tennis Racket',
        price: 15999,
        originalPrice: 19999,
        category: 'Equipment',
        tag: 'Premium',
        status: 'Active',
        stock: 25,
        sport: 'tennis',
        image: 'https://images.unsplash.com/photo-1617083934555-ac7d35e4f02e?auto=format&fit=crop&w=640&q=80',
        description: 'Professional grade tennis racket for competitive players.',
        sizes: [],
        colors: ['Black/Red'],
        gender: 'Unisex',
        ratings: { average: 4.8, count: 42 },
    },
    {
        name: 'Puma Training Shorts',
        price: 1299,
        originalPrice: 1799,
        category: 'Performance Wear',
        status: 'Active',
        stock: 150,
        sport: 'gym',
        image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=640&q=80',
        description: 'Lightweight training shorts with moisture-wicking fabric.',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'Navy', 'Grey'],
        gender: 'Men',
        ratings: { average: 4.2, count: 67 },
    },
    {
        name: 'Basketball Pro Ball',
        price: 2999,
        originalPrice: 3999,
        category: 'Equipment',
        tag: 'Official Size',
        status: 'Active',
        stock: 75,
        sport: 'basketball',
        image: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=640&q=80',
        description: 'Official size and weight basketball for indoor and outdoor play.',
        sizes: [],
        colors: ['Orange/Black'],
        gender: 'Unisex',
        ratings: { average: 4.6, count: 93 },
    },
    {
        name: 'Cricket Bat - English Willow',
        price: 12999,
        originalPrice: 16999,
        category: 'Equipment',
        tag: 'Premium',
        status: 'Active',
        stock: 30,
        sport: 'cricket',
        image: '/Deviate-Play-Men\'s-English-Willow-Cricket-Bat.avif',
        description: 'Grade A English Willow cricket bat for professional performance.',
        sizes: ['SH', 'LB'],
        colors: ['Natural'],
        gender: 'Unisex',
        ratings: { average: 4.7, count: 56 },
    },
    {
        name: 'Sports Duffle Bag',
        price: 1999,
        originalPrice: 2499,
        category: 'Accessories',
        status: 'Active',
        stock: 80,
        sport: 'gym',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=640&q=80',
        description: 'Spacious duffle bag with separate shoe compartment.',
        sizes: [],
        colors: ['Black', 'Navy', 'Grey'],
        gender: 'Unisex',
        ratings: { average: 4.4, count: 112 },
    },
    {
        name: 'Yoga Mat Premium',
        price: 1499,
        originalPrice: 1999,
        category: 'Equipment',
        status: 'Active',
        stock: 60,
        sport: 'yoga',
        image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=640&q=80',
        description: 'Extra thick yoga mat with anti-slip surface.',
        sizes: [],
        colors: ['Purple', 'Blue', 'Pink', 'Black'],
        gender: 'Unisex',
        ratings: { average: 4.5, count: 78 },
    },
    {
        name: 'Swimming Goggles Pro',
        price: 899,
        originalPrice: 1299,
        category: 'Accessories',
        status: 'Active',
        stock: 90,
        sport: 'swimming',
        image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=640&q=80',
        description: 'Anti-fog swimming goggles with UV protection.',
        sizes: [],
        colors: ['Blue', 'Black', 'Clear'],
        gender: 'Unisex',
        ratings: { average: 4.3, count: 145 },
    },
    {
        name: 'Football Cleats Elite',
        price: 7499,
        originalPrice: 9999,
        category: 'Footwear',
        tag: 'New Arrival',
        status: 'Active',
        stock: 40,
        sport: 'football',
        image: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=640&q=80',
        description: 'Professional football cleats for maximum grip and control.',
        sizes: ['7', '8', '9', '10', '11'],
        colors: ['Black/Gold', 'White/Blue'],
        gender: 'Men',
        ratings: { average: 4.6, count: 67 },
    },
];

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MongoDBURI);
        console.log('Connected to MongoDB');

        // Check existing products count
        const existingCount = await Product.countDocuments();
        console.log(`Existing products: ${existingCount}`);

        if (existingCount > 0) {
            console.log('Products already exist. Skipping seed.');
            process.exit(0);
        }

        // Insert products
        const products = await Product.insertMany(sampleProducts);
        console.log(`✅ ${products.length} products seeded successfully!`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

seedProducts();
