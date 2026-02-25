import Product from "../Model/Product.model.js";

export const getProducts = async (req, res) => {    
    try {
        const Products = await Product.find();
        res.status(200).json(Products)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}