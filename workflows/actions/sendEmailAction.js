// workflows/actions/sendEmailAction.js

const nodemailer = require('nodemailer');
const emailConfig = require('../../config/emailConfig'); // Chemin relatif
const GmailIntegration = require('../../integrations/email/GmailIntegration'); // Chemin mis à jour

class SendEmailAction {
  /**
   * Exécute l'action d'envoi d'email.
   * @param {Object} config - Configuration spécifique à l'action.
   * @param {Object} inputData - Données nécessaires pour personnaliser l'email.
   * @returns {Object} Résultat de l'envoi d'email.
   */
  static async execute(config, inputData) {
    try {
      console.log(`Préparation de l'envoi d'email à : ${config.to}`);
      const result = await GmailIntegration.sendEmail(
        config.to,
        config.subject || 'Notification',
        config.text || 'Voici un message généré automatiquement.',
        config.html || inputData.htmlContent || '<p>Aucun contenu HTML fourni.</p>'
      );

      console.log(`Email envoyé : ${result.messageId}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Erreur lors de l\'envoi d\'email :', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = SendEmailAction;
