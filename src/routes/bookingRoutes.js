const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  checkAvailability,
  cancelBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middlewares/auth');

router.route('/')
  .post(createBooking)
  .get(protect, authorize('ADMIN', 'STAFF'), getBookings);

router.get('/mybookings', protect, getMyBookings);

router.post('/check-availability', checkAvailability);

router.route('/:id')
  .get(protect, getBookingById);

router.route('/:id/status')
  .put(protect, authorize('ADMIN', 'STAFF'), updateBookingStatus);

router.route('/:id/cancel')
  .put(protect, cancelBooking);

module.exports = router;