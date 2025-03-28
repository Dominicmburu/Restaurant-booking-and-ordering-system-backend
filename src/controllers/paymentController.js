// src/controllers/paymentController.js
const { verifyCheckoutSession, checkPaymentIntentStatus } = require('../services/paymentService');
const { logger } = require('../utils/logger');
const ErrorResponse = require('../utils/errors');
const prisma = require('../config/database').prisma;
const { sendOrderConfirmation } = require('../services/emailService');

// @desc    Verify payment session
// @route   GET /api/payments/verify-session/:sessionId
// @access  Public
exports.verifySession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    const sessionStatus = await verifyCheckoutSession(sessionId);
    
    // If payment is complete, update the order
    if (sessionStatus.isComplete && sessionStatus.orderId) {
      const order = await prisma.order.update({
        where: { id: sessionStatus.orderId },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED'
        },
        include: {
          restaurant: true,
          orderItems: {
            include: {
              menuItem: true
            }
          },
          user: true
        }
      });
      
      // Send confirmation email if payment succeeded
      const customer = order.user || {
        name: sessionStatus.customer?.name || '',
        email: sessionStatus.customer?.email || '',
        phone: ''
      };
      
      if (customer.email) {
        await sendOrderConfirmation(order, customer).catch(err => {
          logger.error(`Failed to send confirmation email: ${err.message}`);
        });
      }
      
      return res.status(200).json({
        success: true,
        data: {
          ...sessionStatus,
          order
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: sessionStatus
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check payment intent status
// @route   GET /api/payments/check-intent/:paymentIntentId
// @access  Public
exports.checkPaymentIntent = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.params;
    
    const paymentStatus = await checkPaymentIntentStatus(paymentIntentId);
    
    // If payment is successful, update the order
    if (paymentStatus.isSuccess) {
      // Extract order ID from metadata
      const orderId = paymentStatus.customer?.orderId;
      
      if (orderId) {
        const order = await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED'
          },
          include: {
            restaurant: true,
            orderItems: {
              include: {
                menuItem: true
              }
            },
            user: true
          }
        });
        
        // Get customer info
        const customer = order.user || {
          name: paymentStatus.customer.customerName || '',
          email: paymentStatus.customer.customerEmail || '',
          phone: ''
        };
        
        // Send confirmation email
        if (customer.email) {
          await sendOrderConfirmation(order, customer).catch(err => {
            logger.error(`Failed to send confirmation email: ${err.message}`);
          });
        }
        
        return res.status(200).json({
          success: true,
          data: {
            ...paymentStatus,
            order
          }
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: paymentStatus
    });
  } catch (error) {
    next(error);
  }
};