const express = require('express');
const router = express.Router();
const { createSubscriptionOrder, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-order', protect, createSubscriptionOrder);
router.post('/verify', protect, verifyPayment);

module.exports = router;
