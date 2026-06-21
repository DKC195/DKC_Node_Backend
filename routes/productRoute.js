const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } = require('../controllers/productController');
const uploadProductImage = require('../config/multer');

const router = express.Router();

router.post('/create',authMiddleware,uploadProductImage.single('image'),createProduct);
router.get('/all',getAllProducts);
router.get('/:id',getProductById);
router.put('/update/:id',authMiddleware,uploadProductImage.single('image'),updateProduct);
router.delete('/delete/:id',authMiddleware,deleteProduct);

module.exports = router;