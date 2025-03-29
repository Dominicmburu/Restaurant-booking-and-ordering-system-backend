const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ErrorResponse = require('../utils/errors');
const { sendBookingConfirmation } = require('../services/emailService');
const { logger } = require('../utils/logger');


exports.createBooking = async (req, res, next) => {
  try {
    const {
      restaurantId,
      date,
      time,
      guests,
      tableId,
      specialRequests,
      customer
    } = req.body;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    });

    if (!restaurant) {
      return next(new ErrorResponse('Restaurant not found', 404));
    }

    if (tableId) {
      const table = await prisma.table.findUnique({
        where: { id: tableId }
      });

      if (!table) {
        return next(new ErrorResponse('Table not found', 404));
      }

      if (!table.isAvailable) {
        return next(new ErrorResponse('Table is not available for the selected time', 400));
      }

      // Check table capacity
      if (table.capacity < guests) {
        return next(new ErrorResponse(`Table can only accommodate ${table.capacity} guests`, 400));
      }
    }

    // Generate booking number
    const bookingNumber = `BK-${Date.now().toString().substring(7)}`;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        date: new Date(date),
        time,
        guests,
        specialRequests,
        restaurant: {
          connect: { id: restaurantId }
        },
        table: tableId ? {
          connect: { id: tableId }
        } : undefined,
        // Connect to user if logged in
        user: req.user ? { connect: { id: req.user.id } } : undefined
      },
      include: {
        restaurant: true,
        table: true
      }
    });

    // Send booking confirmation email
    const emailCustomer = req.user ? req.user : customer;
    if (emailCustomer && emailCustomer.email) {
      await sendBookingConfirmation(booking, emailCustomer);
    }

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        restaurant: true,
        table: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        restaurant: true,
        table: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: {
        id: req.params.id
      },
      include: {
        restaurant: true,
        table: true
      }
    });

    if (!booking) {
      return next(new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is booking owner or admin
    if (req.user.role !== 'ADMIN' && booking.userId !== req.user.id) {
      return next(new ErrorResponse('Not authorized to access this booking', 403));
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    // Check if booking exists
    let booking = await prisma.booking.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!booking) {
      return next(new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404));
    }

    // Update booking status
    booking = await prisma.booking.update({
      where: {
        id: req.params.id
      },
      data: {
        status
      },
      include: {
        restaurant: true,
        table: true
      }
    });

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check table availability
// @route   POST /api/bookings/check-availability
// @access  Public
exports.checkAvailability = async (req, res, next) => {
  try {
    const { restaurantId, date, time, guests } = req.body;

    // Format date for query
    const bookingDate = new Date(date);
    
    // Find all tables at the restaurant that can accommodate the party size
    const suitableTables = await prisma.table.findMany({
      where: {
        capacity: {
          gte: guests
        },
        isAvailable: true
      }
    });

    if (suitableTables.length === 0) {
      return res.status(200).json({
        success: true,
        available: false,
        message: 'No tables available that can accommodate your party size.'
      });
    }

    // Find bookings for this restaurant on the selected date and time
    const existingBookings = await prisma.booking.findMany({
      where: {
        restaurantId,
        date: {
          equals: bookingDate
        },
        time: time,
        status: {
          notIn: ['CANCELLED']
        }
      },
      include: {
        table: true
      }
    });

// Get IDs of tables already booked
const bookedTableIds = existingBookings.map(booking => booking.tableId).filter(Boolean);

// Find available tables
const availableTables = suitableTables.filter(table => !bookedTableIds.includes(table.id));

const available = availableTables.length > 0;

res.status(200).json({
  success: true,
  available,
  availableTables: available ? availableTables : [],
  message: available ? 'Tables available for booking' : 'No tables available for the selected time'
});
} catch (error) {
next(error);
}
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
try {
// Check if booking exists
let booking = await prisma.booking.findUnique({
  where: {
    id: req.params.id
  }
});

if (!booking) {
  return next(new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404));
}

// Make sure user is booking owner or admin
if (req.user.role !== 'ADMIN' && booking.userId !== req.user.id) {
  return next(new ErrorResponse('Not authorized to cancel this booking', 403));
}

// Update booking status to cancelled
booking = await prisma.booking.update({
  where: {
    id: req.params.id
  },
  data: {
    status: 'CANCELLED'
  },
  include: {
    restaurant: true,
    table: true
  }
});

res.status(200).json({
  success: true,
  data: booking
});
} catch (error) {
next(error);
}
};