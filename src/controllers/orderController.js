const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ErrorResponse = require('../utils/errors');
const { sendOrderConfirmation } = require('../services/emailService');
const { logger } = require('../utils/logger');
const { createCheckoutSession } = require('../services/paymentService');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
exports.createOrder = async (req, res, next) => {
  try {
    const {
      items,
      restaurantId,
      orderType,
      deliveryFee,
      tip,
      address,
      addressDetails,
      city,
      postcode,
      scheduledTime,
      notes,
      customer,
      paymentMethod
    } = req.body;


    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    });

    if (!restaurant) {
      return next(new ErrorResponse('Restaurant not found', 404));
    }

    // Check if all menu items exist
    const menuItemIds = items.map(item => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds }
      }
    });

    console.log(menuItems.length, menuItemIds);


    if (menuItems.length !== menuItemIds.length) {
      return next(new ErrorResponse('One or more menu items not found', 404));
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString().substring(7)}`;

    // Calculate total
    let subtotal = 0;
    items.forEach(item => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      subtotal += Number(menuItem.price) * item.quantity;
    });

    // Add delivery fee and tip if provided
    const total = subtotal + (deliveryFee || 0) + (tip || 0);

    // Create order transaction with appropriate status based on payment method
    const order = await prisma.$transaction(async (prisma) => {
      // Create order
      const newOrder = await prisma.order.create({
        data: {
          orderNumber,
          orderType,
          total,
          deliveryFee,
          tip,
          address,
          addressDetails,
          city,
          postcode,
          scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
          notes,
          // Set payment-related fields
          paymentMethod,
          paymentStatus: paymentMethod === 'CASH' ? 'PAID' : 'PENDING',
          status: paymentMethod === 'CASH' ? 'CONFIRMED' : 'PENDING',
          restaurant: {
            connect: { id: restaurantId }
          },
          // Connect to user if logged in
          user: req.user ? { connect: { id: req.user.id } } : undefined
        }
      });

      // Create order items
      // Replace the createMany with individual creates
      const orderItemPromises = items.map(item => {
        const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
        return prisma.orderItem.create({
          data: {
            quantity: item.quantity,
            price: menuItem.price,
            notes: item.notes,
            orderId: newOrder.id,
            menuItemId: item.menuItemId
          }
        });
      });

      await Promise.all(orderItemPromises);

      // Get complete order with items
      return prisma.order.findUnique({
        where: { id: newOrder.id },
        include: {
          restaurant: true,
          orderItems: {
            include: {
              menuItem: true
            }
          }
        }
      });
    });

    // For CASH payments, send confirmation email immediately
    if (paymentMethod === 'CASH') {
      const emailCustomer = req.user ? req.user : customer;
      if (emailCustomer && emailCustomer.email) {
        await sendOrderConfirmation(order, emailCustomer).catch(err => {
          logger.error(`Failed to send confirmation email: ${err.message}`);
        });
      }

      return res.status(201).json({
        success: true,
        data: {
          order,
          payment: {
            requiresAction: false
          }
        }
      });
    }
    // For CARD payments, create Stripe checkout session
    else if (paymentMethod === 'CARD') {
      // Format order items for Stripe
      const lineItems = order.orderItems.map(item => ({
        name: item.menuItem.name,
        description: item.menuItem.description.substring(0, 255),
        price: Number(item.price),
        quantity: item.quantity,
        id: item.menuItem.id
      }));

      // Define success and cancel URLs
      const successUrl = `${process.env.FRONTEND_URL}/payment-success?order_id=${order.id}`;
      const cancelUrl = `${process.env.FRONTEND_URL}/payment-cancel?order_id=${order.id}`;

      try {
        // Create Stripe checkout session
        const session = await createCheckoutSession({
          orderId: order.id,
          items: lineItems,
          customer: customer || req.user,
          summary: {
            orderType,
            total: Number(total),
            deliveryFee: deliveryFee ? Number(deliveryFee) : 0,
            tip: tip ? Number(tip) : 0,
            location: restaurant
          }
        }, successUrl, cancelUrl);

        // Update order with Stripe session ID
        await prisma.order.update({
          where: { id: order.id },
          data: {
            stripeSessionId: session.id
          }
        });

        // Return order with payment session URL
        return res.status(201).json({
          success: true,
          data: {
            order,
            payment: {
              requiresAction: true,
              sessionId: session.id,
              url: session.url
            }
          }
        });
      } catch (error) {
        logger.error(`Payment session creation failed: ${error.message}`);

        // Update order status to failed
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'FAILED',
            status: 'CANCELLED'
          }
        });

        return next(new ErrorResponse('Payment processing failed', 500));
      }
    } else {
      return next(new ErrorResponse('Invalid payment method', 400));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Handle payment success from Stripe redirect
// @route   POST /api/orders/:id/payment-success
// @access  Public
exports.handlePaymentSuccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { session_id } = req.body;

    if (!session_id) {
      return next(new ErrorResponse('Session ID is required', 400));
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        restaurant: true,
      }
    });

    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${id}`, 404));
    }

    // Verify this is the correct session
    if (order.stripeSessionId !== session_id) {
      return next(new ErrorResponse('Invalid payment session', 400));
    }

    // We'll update the order status in the verify-session endpoint
    // This endpoint is just for acknowledging the redirect

    res.status(200).json({
      success: true,
      message: 'Payment redirect received, please verify session status',
      data: {
        orderId: id,
        sessionId: session_id
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle payment cancellation from Stripe redirect
// @route   POST /api/orders/:id/payment-cancel
// @access  Public
exports.handlePaymentCancel = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        paymentStatus: 'FAILED',
        status: 'CANCELLED'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Payment cancelled',
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        restaurant: true,
        orderItems: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        restaurant: true,
        orderItems: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: {
        id: req.params.id
      },
      include: {
        restaurant: true,
        orderItems: {
          include: {
            menuItem: true
          }
        }
      }
    });

    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is order owner or admin
    if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
      return next(new ErrorResponse('Not authorized to access this order', 403));
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    // Check if order exists
    let order = await prisma.order.findUnique({
      where: {
        id: req.params.id
      },
      include: {
        restaurant: true
      }
    });

    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
    }

    // Update order status
    order = await prisma.order.update({
      where: {
        id: req.params.id
      },
      data: {
        status
      },
      include: {
        restaurant: true,
        orderItems: {
          include: {
            menuItem: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};