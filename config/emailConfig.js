// config/emailConfig.js

module.exports = {
  host: 'smtp.gmail.com',
  port: 587, // Port sécurisé TLS
  secure: false, // true pour le port 465, false pour le port 587
  auth: {
    user: process.env.EMAIL_USER, // Adresse Gmail
    pass: process.env.EMAIL_PASS, // Mot de passe ou App Password
  },
  sender: process.env.EMAIL_SENDER || 'vouillon.mael@gmail.com', // Optionnel
};