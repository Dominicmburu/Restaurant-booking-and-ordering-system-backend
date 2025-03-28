const express = require('express');
const router = express.Router();
const { createTable, getTablesByRestaurant, updateTable, deleteTable } = require('../controllers/tableController');

router.post('/', createTable);

router.get('/:restaurantId', getTablesByRestaurant);

router.put('/:id', updateTable);

router.delete('/:id', deleteTable);

module.exports = router;
