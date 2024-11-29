// Rôle : Définit les routes API pour les workflows
// Dépendances : 
// express : Pour créer et gérer les routes
// workflowController.js : Contient les fonctions associées à chaque endpoint.
// authMiddleware.js : Middleware pour vérifier l'authentification de l'utilisateur
// validationMiddleware.js : Middleware pour valider les données des requêtes

const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const GmailIntegration = require('../integrations/email/GmailIntegration'); // Chemin mis à jour

// Logs de débogage
console.log('authMiddleware type:', typeof authMiddleware); // Devrait afficher 'function'
console.log('validateWorkflowCreation type:', typeof validationMiddleware.validateWorkflowCreation); // 'function'
console.log('createWorkflow type:', typeof workflowController.createWorkflow); // 'function'
console.log('getAllWorkflows type:', typeof workflowController.getAllWorkflows); // 'function'
console.log('getWorkflowById type:', typeof workflowController.getWorkflowById); // 'function'
console.log('updateWorkflow type:', typeof workflowController.updateWorkflow); // 'function'
console.log('deleteWorkflow type:', typeof workflowController.deleteWorkflow); // 'function'
console.log('executeWorkflow type:', typeof workflowController.executeWorkflow); // 'function'

// Créer un nouveau workflow
router.post(
  '/workflows',
  authMiddleware, // Middleware d'authentification
  validationMiddleware.validateWorkflowCreation, // Middleware de validation
  workflowController.createWorkflow // Contrôleur
);

// Récupérer la liste de tous les workflows
router.get(
  '/workflows',
  authMiddleware, // Middleware d'authentification
  workflowController.getAllWorkflows // Contrôleur
);

// Récupérer un workflow spécifique par son ID
router.get(
  '/workflows/:id',
  authMiddleware, // Authentification requise
  workflowController.getWorkflowById // Contrôleur
);

// Mettre à jour un workflow
router.put(
  '/workflows/:id',
  authMiddleware, // Authentification requise
  validationMiddleware.validateWorkflowUpdate, // Middleware de validation
  workflowController.updateWorkflow // Contrôleur
);

// Supprimer un workflow
router.delete(
  '/workflows/:id',
  authMiddleware, // Authentification requise
  workflowController.deleteWorkflow // Contrôleur
);

// Exécuter un workflow
router.post(
  '/workflows/execute',
  authMiddleware, // Authentification requise
  validationMiddleware.validateWorkflowExecution, // Middleware de validation
  workflowController.executeWorkflow // Contrôleur
);

// Ajout du test d'envoi d'email
router.get('/test-email', async (req, res) => {
  console.log('Requête reçue pour /api/test-email');
  try {
    const result = await GmailIntegration.sendEmail(
      'maelpitch@gmail.com', // Remplacez par l'adresse de destination
      'Test d\'email depuis la plateforme',
      'Ceci est un email de test généré automatiquement.',
      '<p>Ceci est un email de test généré automatiquement.</p>'
    );

    res.status(200).json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('Erreur lors de l\'envoi d\'email :', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
