const express = require('express');
const auth = require('../middleware/auth');
const requireSuperAdmin = require('../middleware/requireSuperAdmin');
const { listRestaurants, createRestaurant } = require('../controllers/superAdminController');

const router = express.Router();

router.use(auth);
router.use(requireSuperAdmin);

router.get('/restaurants', listRestaurants);
router.post('/restaurants', createRestaurant);

module.exports = router;
