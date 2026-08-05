const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

// Public/Citizen query
router.get('/', productController.getProducts);
router.get('/nearby', productController.getProductsWithinDeliveryRadius);
router.post('/:productId/pre-book', protect, productController.preBookHarvestCrop);

// Seller/Admin protected routes
router.post('/', protect, authorize('Seller', 'Admin'), productController.createProduct);
router.get('/seller/my-products', protect, authorize('Seller', 'Admin'), productController.getSellerProducts);
router.delete('/:id', protect, authorize('Seller', 'Admin'), productController.deleteProduct);

module.exports = router;

