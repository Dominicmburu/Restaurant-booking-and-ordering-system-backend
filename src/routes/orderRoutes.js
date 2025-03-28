const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  handlePaymentSuccess,
  handlePaymentCancel
} = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/auth');

router.route('/')
  .post(createOrder)
  .get(protect, authorize('ADMIN', 'STAFF'), getOrders);

router.get('/myorders', protect, getMyOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/status')
  .put(protect, authorize('ADMIN', 'STAFF'), updateOrderStatus);

router.route('/:id/payment-success')
  .post(handlePaymentSuccess);

router.route('/:id/payment-cancel')
  .post(handlePaymentCancel);

module.exports = router;