// controllers/financeController.js

const FinanceService = require('../services/FinanceService'); // Ajoutez cette ligne
const { handleError } = require('../middleware/errorHandler'); // Assurez-vous que ce middleware est correct

const getFinanceData = async (req, res) => {
  try {
    const data = await FinanceService.getData();
    res.status(200).json(data);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getFinanceData,
  // ... autres fonctions
};