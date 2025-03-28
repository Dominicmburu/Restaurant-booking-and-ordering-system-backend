const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updatePassword,
  forgotPassword,
  resetPassword,
  updateProfile
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');

// Public routes
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Protected routes
router.route('/updatepassword').put(protect, updatePassword);
router.route('/updateprofile').put(protect, updateProfile);

// Admin routes
router
  .route('/')
  .get(protect, authorize('ADMIN'), getUsers)
  .post(protect, authorize('ADMIN'), createUser);

router
  .route('/:id')
  .get(protect, authorize('ADMIN'), getUser)
  .put(protect, authorize('ADMIN'), updateUser)
  .delete(protect, authorize('ADMIN'), deleteUser);

module.exports = router;