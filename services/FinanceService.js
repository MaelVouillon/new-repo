// services/FinanceService.js

const FinanceService = {
  getData: async () => {
    // Remplacez ceci par la logique réelle pour récupérer les données financières.
    return {
      cashFlow: [
        { month: 'Janvier', value: 10000 },
        { month: 'Février', value: 15000 },
        // Ajoutez d'autres mois
      ],
      revenue: [
        { month: 'Janvier', income: 50000, expenses: 30000 },
        { month: 'Février', income: 55000, expenses: 32000 },
        // Ajoutez d'autres mois
      ],
      expenses: [
        { category: 'Marketing', expenses: 15000 },
        { category: 'Développement', expenses: 20000 },
        // Ajoutez d'autres catégories
      ],
    };
  },
};

module.exports = FinanceService;