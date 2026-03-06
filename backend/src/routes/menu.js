const express = require('express');
const router = express.Router();
const { getMenu } = require('../controllers/menuController');

// Public route — no auth required
router.get('/:slug', getMenu);

module.exports = router;
