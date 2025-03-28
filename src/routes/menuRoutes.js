const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuItemsByCategory,
  getPopularItems
} = require('../controllers/menuController');
const { protect, authorize } = require('../middlewares/auth');

router.route('/')
  .get(getMenuItems)
  .post(protect, authorize('ADMIN'), createMenuItem);

router.route('/:id')
  .get(getMenuItem)
  .put(protect, authorize('ADMIN'), updateMenuItem)
  .delete(protect, authorize('ADMIN'), deleteMenuItem);

router.get('/category/:category', getMenuItemsByCategory);
router.get('/popular', getPopularItems);

module.exports = router;