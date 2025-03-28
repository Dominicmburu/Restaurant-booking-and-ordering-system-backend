const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ErrorResponse = require('../utils/errors');

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
exports.getRestaurants = async (req, res, next) => {
  try {
    const restaurants = await prisma.restaurant.findMany();

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single restaurant
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!restaurant) {
      return next(new ErrorResponse(`Restaurant not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new restaurant
// @route   POST /api/restaurants
// @access  Private/Admin
exports.createRestaurant = async (req, res, next) => {
  try {
    const restaurant = await prisma.restaurant.create({
      data: req.body
    });

    res.status(201).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private/Admin
exports.updateRestaurant = async (req, res, next) => {
  try {
    let restaurant = await prisma.restaurant.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!restaurant) {
      return next(new ErrorResponse(`Restaurant not found with id of ${req.params.id}`, 404));
    }

    restaurant = await prisma.restaurant.update({
      where: {
        id: req.params.id
      },
      data: req.body
    });

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private/Admin
exports.deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!restaurant) {
      return next(new ErrorResponse(`Restaurant not found with id of ${req.params.id}`, 404));
    }

    await prisma.restaurant.delete({
      where: {
        id: req.params.id
      }
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant menu
// @route   GET /api/restaurants/:id/menu
// @access  Public
exports.getRestaurantMenu = async (req, res, next) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!restaurant) {
      return next(new ErrorResponse(`Restaurant not found with id of ${req.params.id}`, 404));
    }

    const menuItems = await prisma.menuItem.findMany({
      where: {
        restaurantId: req.params.id
      },
      orderBy: {
        category: 'asc'
      }
    });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    next(error);
  }
};