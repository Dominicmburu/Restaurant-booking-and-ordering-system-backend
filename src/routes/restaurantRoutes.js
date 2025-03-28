const express = require('express');
const router = express.Router();
const {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantMenu
} = require('../controllers/restaurantController');
const { protect, authorize } = require('../middlewares/auth');

router.route('/')
  .get(getRestaurants)
  .post(protect, authorize('ADMIN'), createRestaurant);

router.route('/:id')
  .get(getRestaurant)
  .put(protect, authorize('ADMIN'), updateRestaurant)
  .delete(protect, authorize('ADMIN'), deleteRestaurant);

router.get('/:id/menu', getRestaurantMenu);

module.exports = router;