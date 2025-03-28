const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ErrorResponse = require('../utils/errors');

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
exports.getMenuItems = async (req, res, next) => {
  try {
    const menuItems = await prisma.menuItem.findMany();

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
exports.getMenuItem = async (req, res, next) => {
  try {
    const menuItem = await prisma.menuItem.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!menuItem) {
      return next(new ErrorResponse(`Menu item not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new menu item
// @route   POST /api/menu
// @access  Private/Admin
exports.createMenuItem = async (req, res, next) => {
  try {
    const menuItem = await prisma.menuItem.create({
      data: req.body
    });

    res.status(201).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
exports.updateMenuItem = async (req, res, next) => {
  try {
    let menuItem = await prisma.menuItem.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!menuItem) {
      return next(new ErrorResponse(`Menu item not found with id of ${req.params.id}`, 404));
    }

    menuItem = await prisma.menuItem.update({
      where: {
        id: req.params.id
      },
      data: req.body
    });

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
exports.deleteMenuItem = async (req, res, next) => {
  try {
    const menuItem = await prisma.menuItem.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!menuItem) {
      return next(new ErrorResponse(`Menu item not found with id of ${req.params.id}`, 404));
    }

    await prisma.menuItem.delete({
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

// @desc    Get menu items by category
// @route   GET /api/menu/category/:category
// @access  Public
exports.getMenuItemsByCategory = async (req, res, next) => {
  try {
    const menuItems = await prisma.menuItem.findMany({
      where: {
        category: req.params.category
      },
      include: {
        restaurant: true
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

// @desc    Get popular menu items
// @route   GET /api/menu/popular
// @access  Public
exports.getPopularItems = async (req, res, next) => {
  try {
    const menuItems = await prisma.menuItem.findMany({
      where: {
        isPopular: true
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