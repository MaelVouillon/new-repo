// controllers/workflowController.js

const Workflow = require('../models/Workflow');
const helpers = require('../middleware/helpers');
const workflowExecutor = require('../workflows/core/workflowExecutor');
const { handleError } = require('../middleware/errorHandler'); // Assurez-vous que ce chemin est correct
const TriggerManager = require('../workflows/core/TriggerManager');

// Crée un nouveau workflow
const createWorkflow = async (req, res) => {
  try {
    const { name, trigger, actions } = req.body;

    // Validation des données
    if (!name || !trigger || !actions) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    // Création du workflow dans la base de données
    const newWorkflow = await Workflow.create({
      name,
      trigger,
      actions,
      createdBy: req.user.id, // ID de l'utilisateur authentifié
    });

    // Enregistrer le déclencheur
    TriggerManager.register(trigger, newWorkflow);

    res.status(201).json(newWorkflow);
  } catch (error) {
    handleError(res, error);
  }
};

// Récupère tous les workflows pour un utilisateur
const getAllWorkflows = async (req, res) => {
  try {
    if (req.user.role === 'guest') {
      // Limiter l'accès ou fournir des données spécifiques pour les invités
      return res.status(200).json([]); // Exemple : retourner un tableau vide
    }

    const workflows = await Workflow.findAll({
      where: { createdBy: req.user.id },
    });

    res.status(200).json(workflows);
  } catch (error) {
    handleError(res, error);
  }
};

// Récupère un workflow par ID
const getWorkflowById = async (req, res) => {
  try {
    const { id } = req.params;
    const workflow = await Workflow.findByPk(id);

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow non trouvé.' });
    }

    res.status(200).json(workflow);
  } catch (error) {
    handleError(res, error);
  }
};

// Met à jour un workflow
const updateWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, trigger, actions } = req.body;

    const workflow = await Workflow.findByPk(id);

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow non trouvé.' });
    }

    // Si le type de déclencheur a changé, désenregistrer l'ancien et enregistrer le nouveau
    if (trigger && trigger.type !== workflow.trigger.type) {
      TriggerManager.unregisterEmailTrigger(workflow.trigger, workflow); // Adapter selon le type
      TriggerManager.register(trigger, workflow);
    }

    workflow.name = name || workflow.name;
    workflow.trigger = trigger || workflow.trigger;
    workflow.actions = actions || workflow.actions;

    await workflow.save();

    res.status(200).json(workflow);
  } catch (error) {
    handleError(res, error);
  }
};

// Supprime un workflow
const deleteWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    const workflow = await Workflow.findByPk(id);

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow non trouvé.' });
    }

    await workflow.destroy();

    // Désenregistrer le déclencheur
    if (workflow.trigger.type === 'emailReceived') {
      TriggerManager.unregisterEmailTrigger(workflow.trigger, workflow);
    }

    res.status(200).json({ message: 'Workflow supprimé avec succès.' });
  } catch (error) {
    handleError(res, error);
  }
};

// Exécute un workflow
const executeWorkflow = async (req, res) => {
  try {
    const { workflowId, inputData } = req.body;

    const workflow = await Workflow.findByPk(workflowId);

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow non trouvé.' });
    }

    const result = await workflowExecutor.execute(workflow, inputData);

    res.status(200).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

// Récupérer tous les triggers
const getAllTriggers = async (req, res) => {
  try {
    const triggers = await Trigger.findAll(); // Assurez-vous d'importer le modèle Trigger
    res.status(200).json(triggers);
  } catch (error) {
    handleError(res, error);
  }
};

// Créer un nouveau trigger
const createTrigger = async (req, res) => {
  try {
    const { name, type, config } = req.body;
    const newTrigger = await Trigger.create({ name, type, config });
    res.status(201).json(newTrigger);
  } catch (error) {
    handleError(res, error);
  }
};

// Supprimer un trigger
const deleteTrigger = async (req, res) => {
  try {
    const { id } = req.params;
    const trigger = await Trigger.findByPk(id);
    if (!trigger) {
      return res.status(404).json({ error: 'Trigger non trouvé.' });
    }
    await trigger.destroy();
    res.status(200).json({ message: 'Trigger supprimé avec succès.' });
  } catch (error) {
    handleError(res, error);
  }
};

// Exportation des fonctions
module.exports = {
  createWorkflow,
  getAllWorkflows,
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow,
  getAllTriggers,
  createTrigger,
  deleteTrigger,
};
