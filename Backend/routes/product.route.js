import express from 'express';
import { getProducts } from '../controller/product.controller.js';
const router = express.Router();

router.get('/', getProducts)

export default router;