const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getDashboard, updateRestaurant } = require('../controllers/adminController');
const { listCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { listProducts, createProduct, updateProduct, deleteProduct, upload } = require('../controllers/productController');
const { getQRCode } = require('../controllers/qrCodeController');
const { seedItalianMenu } = require('../controllers/seedController');

// All routes below require a valid JWT
router.use(auth);

// Dashboard
router.get('/dashboard', getDashboard);
router.put('/restaurant', updateRestaurant);

// Categories
router.get('/categories', listCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Products
router.get('/products', listProducts);
router.post('/products', upload.single('image'), createProduct);
router.put('/products/:id', upload.single('image'), updateProduct);
router.delete('/products/:id', deleteProduct);
router.post('/seed/italian-menu', seedItalianMenu);

// QR Code
router.get('/qrcode', getQRCode);

module.exports = router;
