// src/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { verifySession, checkPaymentIntent } = require('../controllers/paymentController');

// Verify checkout session
router.get('/verify-session/:sessionId', verifySession);

// Check payment intent status
router.get('/check-intent/:paymentIntentId', checkPaymentIntent);

module.exports = router;