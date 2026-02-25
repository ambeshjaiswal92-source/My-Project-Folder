import mongoose from "mongoose";


const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    Price: {
        type: Number,
        required: true,
    },
    badge: {
        type: String,
    },
    tag: {
        type: String,
    },});
    
    const Product = mongoose.model('Product', productSchema);

    export default Product;