const express = require('express');
const router = express.Router();
const payment = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/create-order', authenticate, payment.createOrder);
router.post('/verify', authenticate, payment.verifyPayment);
router.post('/webhook', payment.webhook);
router.get('/my-orders', authenticate, payment.getMyOrders);

module.exports = router;
