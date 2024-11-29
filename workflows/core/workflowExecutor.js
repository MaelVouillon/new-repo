// Orchestrateur principal pour l’exécution des workflows. Ce fichier lit les étapes d’un workflow, valide les déclencheurs, et exécute les actions associées.

const Workflow = require('../../models/Workflow.js'); // Assurez-vous que ce chemin est correct
const WorkflowLog = require('../core/WorkflowLog.js'); // Assurez-vous que ce chemin est correct
const sendEmailAction = require('../actions/sendEmailAction');
const generateDraftEmailAction = require('../actions/generateDraftEmailAction'); // Import de la nouvelle action
const generateChartAction = require('../actions/generateChartAction');
const exportFileAction = require('../actions/exportFileAction');
const notifyUserAction = require('../actions/notifyUserAction');
const helpers = require('../../middleware/helpers.js');
const ManualTrigger = require('../triggers/manualTrigger'); // Chemin relatif

// Actions disponibles pour l'exécution
const actionMap = {
  sendEmail: sendEmailAction, // Envoi d'un e-mail
  generateDraftEmail: generateDraftEmailAction, // Génération d'un brouillon d'e-mail
  generateChart: generateChartAction, // Génération d'un graphique
  exportFile: exportFileAction, // Exportation d'un fichier
  notifyUser: notifyUserAction, // Notification d'un utilisateur
};

// Classe pour exécuter un workflow
class WorkflowExecutor {
  /**
   * Exécute un workflow.
   * @param {Object} workflow - Le workflow à exécuter.
   * @param {Object} inputData - Données d'entrée nécessaires pour exécuter le workflow.
   * @returns {Object} Résultat de l'exécution.
   */
  static async execute(workflow, inputData) {
    try {
      console.log(`Début d'exécution du workflow : ${workflow.name}`);

      if (!this.validateTrigger(workflow.trigger, inputData)) {
        console.log('Déclencheur non valide.');
        return { success: false, message: 'Déclencheur non valide.' };
      }

      const results = [];
      for (const action of workflow.actions) {
        const actionHandler = actionMap[action.type];

        if (!actionHandler) {
          throw new Error(`Action inconnue : ${action.type}`);
        }
        
        console.log(`Exécution de l'action : ${action.type}`);
        const result = await actionHandler.execute(workflow, action.config, inputData); // Assurez-vous de passer 'workflow'
        console.log(`Résultat de l'action ${action.type} :`, result);
        results.push({ action: action.type, result });
      }

      await WorkflowLog.create({
        workflowId: workflow.id,
        status: 'success',
        message: 'Workflow exécuté avec succès.',
      });

      console.log('Workflow exécuté avec succès.');
      return { success: true, results };
    } catch (error) {
      console.error('Erreur lors de l\'exécution du workflow :', error.message);
      
      if (workflow && workflow.id) {
        await WorkflowLog.create({
          workflowId: workflow.id,
          status: 'error',
          message: error.message
        });
      } else {
        console.error('Impossible de créer WorkflowLog car workflow.id est undefined.');
      }

      return { success: false, error: error.message };
    }
  }

  static validateTrigger(trigger, inputData) {
    if (trigger.type === 'manualTrigger') {
      return ManualTrigger.validate(trigger, inputData);
    }
    return true;
  }
}

module.exports = WorkflowExecutor;
