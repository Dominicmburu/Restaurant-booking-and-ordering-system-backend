const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ErrorResponse = require('../utils/errors');

// @desc    Create a new table for a restaurant
// @route   POST /api/tables
// @access  Private/Admin
exports.createTable = async (req, res, next) => {
  try {
    const { restaurantId, tableNumber, capacity } = req.body;

    // Check if the restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    });

    if (!restaurant) {
      return next(new ErrorResponse('Restaurant not found', 404));
    }

    // Create the table for the restaurant
    const newTable = await prisma.table.create({
      data: {
        restaurantId,
        tableNumber,
        capacity,
        isAvailable: true // New table is available by default
      }
    });

    res.status(201).json({
      success: true,
      data: newTable
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tables for a specific restaurant
// @route   GET /api/tables/:restaurantId
// @access  Private/Admin
exports.getTablesByRestaurant = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    // Get tables for the restaurant
    const tables = await prisma.table.findMany({
      where: { restaurantId },
      include: { restaurant: true }
    });

    if (tables.length === 0) {
      return next(new ErrorResponse('No tables found for this restaurant', 404));
    }

    res.status(200).json({
      success: true,
      count: tables.length,
      data: tables
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a table's details (availability or capacity)
// @route   PUT /api/tables/:id
// @access  Private/Admin
exports.updateTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tableNumber, capacity, isAvailable } = req.body;

    // Check if the table exists
    const table = await prisma.table.findUnique({
      where: { id }
    });

    if (!table) {
      return next(new ErrorResponse('Table not found', 404));
    }

    // Update table details
    const updatedTable = await prisma.table.update({
      where: { id },
      data: {
        tableNumber,
        capacity,
        isAvailable
      }
    });

    res.status(200).json({
      success: true,
      data: updatedTable
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a table from a restaurant
// @route   DELETE /api/tables/:id
// @access  Private/Admin
exports.deleteTable = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if the table exists
    const table = await prisma.table.findUnique({
      where: { id }
    });

    if (!table) {
      return next(new ErrorResponse('Table not found', 404));
    }

    // Delete the table
    await prisma.table.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Table deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
