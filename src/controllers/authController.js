const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');
const ErrorResponse = require('../utils/errors');
const { sendTokenResponse } = require('../config/jwt');
const { sendWelcomeEmail } = require('../services/emailService');

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  
  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedHash) => {
  const [salt, hash] = storedHash.split(':');
  
  const calculatedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  
  return calculatedHash === hash;
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const userExists = await prisma.user.findUnique({
      where: { email }
    });

    if (userExists) {
      return next(new ErrorResponse('Email already in use', 400));
    }

    const hashedPassword = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone
      }
    });

    await sendWelcomeEmail(user).catch(err => {
      logger.error(`Failed to send welcome email: ${err.message}`);
    });

    sendTokenResponse(user, 201, res, "User registered successfully");
  } catch (error) {
    next(error);
  }
};


exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorResponse('Please provide an email and password', 400));
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    const isMatch = verifyPassword(password, user.password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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