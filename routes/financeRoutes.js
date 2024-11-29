// routes/financeRoutes.js

const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const authMiddleware = require('../middleware/authMiddleware'); // Assurez-vous que ce middleware est correct

// Route protégée pour obtenir les données financières
router.get('/data/finance', authMiddleware, financeController.getFinanceData);

module.exports = router;