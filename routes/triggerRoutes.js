// routes/triggerRoutes.js

const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');

// Récupérer tous les triggers
router.get('/triggers', workflowController.getAllTriggers);

// Créer un nouveau trigger
router.post('/triggers', workflowController.createTrigger);

// Supprimer un trigger
router.delete('/triggers/:id', workflowController.deleteTrigger);

module.exports = router;