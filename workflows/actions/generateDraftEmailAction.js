// workflows/actions/generateDraftEmailAction.js

const WorkflowLog = require('../core/WorkflowLog'); // Chemin mis à jour
const GmailIntegration = require('../../integrations/email/GmailIntegration'); // Chemin mis à jour
const Workflow = require('../../models/Workflow');

class GenerateDraftEmailAction {
  /**
   * Exécute l'action de génération de brouillon d'email.
   * @param {Object} workflow - Le workflow en cours d'exécution.
   * @param {Object} config - Configuration spécifique à l'action.
   * @param {Object} inputData - Données nécessaires pour personnaliser le brouillon.
   * @returns {Object} Résultat de la création du brouillon.
   */
  static async execute(workflow, config, inputData) {
    try {
      // Utiliser config.to ou extraire 'from.text' de l'email trigger
      const to = config.to || (inputData.email && inputData.email.from && inputData.email.from.text);

      if (!to) {
        throw new Error('Adresse e-mail du destinataire non spécifiée.');
      }

      console.log(`Préparation de la génération de brouillon d'email à : ${to}`);
      
      const result = await GmailIntegration.createDraft(
        to,
        config.subject || 'Notification',
        config.text || 'Voici un message généré automatiquement.',
        config.html || (inputData.email && inputData.email.htmlContent) || '<p>Aucun contenu HTML fourni.</p>'
      );
      
      // Créer un log associé au workflow
      await WorkflowLog.create({
        workflowId: workflow.id,
        status: 'success',
        message: `Brouillon créé avec l'ID : ${result.draftId}`
      });

      console.log(`Brouillon créé avec l'ID : ${result.draftId}`);
      return { success: true, draftId: result.draftId };
    } catch (error) {
      console.error('Erreur lors de la génération du brouillon d\'email :', error.message);
      
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
}

module.exports = GenerateDraftEmailAction;