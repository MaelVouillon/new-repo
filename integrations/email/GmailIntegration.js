// Fournit une interface pour envoyer des emails, gérer des erreurs spécifiques ou ajouter des fonctionnalités supplémentaires (comme envoyer avec des pièces jointes ou formater dynamiquement les emails).
// Cette classe utilise le module nodemailer pour envoyer des emails via Gmail.

const nodemailer = require('nodemailer');
const emailConfig = require('../../config/emailConfig');
const { google } = require('googleapis'); // Assurez-vous d'installer googleapis avec npm
const User = require('../../models/User'); // Importez le modèle User

class GmailIntegration {
  /**
   * Configure l'authentification OAuth2 pour un utilisateur spécifique.
   */
  static async getOAuth2Client(userId) {
    const user = await User.findByPk(userId);
    if (!user || !user.gmail_refresh_token) {
      throw new Error('Refresh Token non disponible pour cet utilisateur.');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      'http://localhost:3000/auth/callback' // Votre URL de redirection
    );

    oauth2Client.setCredentials({
      refresh_token: user.gmail_refresh_token,
    });

    return oauth2Client;
  }

  /**
   * Envoie un email.
   */
  static async sendEmail(userId, to, subject, text, html) {
    try {
      const oauth2Client = await this.getOAuth2Client(userId);
      const accessToken = await oauth2Client.getAccessToken();

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.EMAIL_USER,
          clientId: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_CLIENT_SECRET,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN,
          accessToken: accessToken.token,
        },
      });

      const mailOptions = {
        from: `Votre Nom <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`Email envoyé avec succès : ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Erreur lors de l\'envoi d\'email :', error.message);
      throw new Error('Impossible d\'envoyer l\'email.');
    }
  }

  /**
   * Crée un brouillon d'email.
   */
  static async createDraft(userId, to, subject, text, html) {
    try {
      const oauth2Client = await this.getOAuth2Client(userId);

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      const raw = Buffer.from(
        `To: ${to}\n` +
        `Subject: ${subject}\n` +
        `Content-Type: text/html; charset=utf-8\n\n` +
        `${html}`
      )
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const draft = await gmail.users.drafts.create({
        userId: 'me',
        requestBody: {
          message: {
            raw,
          },
        },
      });

      console.log(`Brouillon créé avec succès : ${draft.data.id}`);
      return { success: true, id: draft.data.id };
    } catch (error) {
      console.error('Erreur lors de la création du brouillon d\'email :', error.message);
      throw new Error('Impossible de créer le brouillon d\'email.');
    }
  }
}

module.exports = GmailIntegration;
