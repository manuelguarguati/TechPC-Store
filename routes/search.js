const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// GET /search?q=algo
router.get('/', searchController.buscar);

module.exports = router;
