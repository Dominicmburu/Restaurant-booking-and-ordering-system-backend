const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();
const ErrorResponse = require('../utils/errors');
const { sendTokenResponse } = require('../config/jwt');
const { sendPasswordResetEmail } = require('../services/emailService');

// Helper function to hash password using crypto
const hashPassword = (password) => {
  // Generate a random salt
  const salt = crypto.randomBytes(16).toString('hex');
  
  // Use PBKDF2 to hash the password with the salt
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  
  // Return both salt and hash, separated by a colon
  return `${salt}:${hash}`;
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check if user already exists
    const userExists = await prisma.user.findUnique({
      where: { email }
    });

    if (userExists) {
      return next(new ErrorResponse('Email already in use', 400));
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    // Remove password from update data
    const { password, ...updateData } = req.body;

    if (password) {
      const hashedPassword = hashPassword(password);
      updateData.password = hashedPassword;
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    // Delete user
    await prisma.user.delete({
      where: { id: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/users/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Verify current password
    const [salt, storedHash] = user.password.split(':');
    const calculatedHash = crypto.pbkdf2Sync(currentPassword, salt, 10000, 64, 'sha512').toString('hex');
    
    if (calculatedHash !== storedHash) {
      return next(new ErrorResponse('Current password is incorrect', 401));
    }

    // Hash new password
    const hashedPassword = hashPassword(newPassword);

    // Update user password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/users/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return next(new ErrorResponse('There is no user with that email', 404));
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    const resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetToken,
        resetExpires: new Date(resetTokenExpire)
      }
    });

    // Create reset url
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      // Send email
      await sendPasswordResetEmail(user, resetUrl);

      res.status(200).json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (err) {
      // If email fails, remove reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetExpires: null
        }
      });

      return next(new ErrorResponse('Email could not be sent', 500));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/users/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { resettoken } = req.params;

    // Find user by reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: resettoken,
        resetExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return next(new ErrorResponse('Invalid or expired token', 400));
    }

    // Hash new password
    const hashedPassword = hashPassword(password);

    // Update password and remove reset token fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetExpires: null
      }
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/updateprofile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;

    // Check if email is being changed and already exists
    if (email && email !== req.user.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return next(new ErrorResponse('Email already in use', 400));
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};