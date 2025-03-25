const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const menuRoutes = require('./menuRoutes');
const orderRoutes = require('./orderRoutes');
const bookingRoutes = require('./bookingRoutes');
const restaurantRoutes = require('./restaurantRoutes');
const userRoutes = require('./userRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/menu', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/bookings', bookingRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/users', userRoutes);

module.exports = router;