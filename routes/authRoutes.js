const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assurez-vous que le modèle User est correctement importé
const { google } = require('googleapis');
const authController = require('../controllers/authController');

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'http://localhost:3000/auth/callback' // Remplacez par votre URL de redirection
);

// Route pour l'inscription
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Vérifiez si l'utilisateur existe déjà
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà.' });
  }

  // Créez un nouvel utilisateur
  const newUser = await User.create({ name, email, password });

  res.status(201).json(newUser);
});

// Route pour l'authentification
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Vérifiez les informations d'identification de l'utilisateur
  const user = await User.findOne({ where: { email, password } });
  if (!user) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
  }

  // Générer un token JWT
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ token });
});

// Route pour démarrer le processus d'authentification
router.get('/auth', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.send',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Nécessaire pour obtenir un Refresh Token
    scope: scopes,
    prompt: 'consent', // Force la demande de consentement pour obtenir le Refresh Token
  });

  res.redirect(url);
});

// Route pour gérer le callback OAuth 2.0
router.get('/auth/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Optionnel : Enregistrez les tokens dans la base de données liés à l'utilisateur
    // Supposons que l'utilisateur est déjà authentifié et que son ID est disponible
    const userId = req.user.id; // Assurez-vous que `req.user` est défini via votre middleware d'authentification
    await User.update(
      {
        gmail_access_token: tokens.access_token,
        gmail_refresh_token: tokens.refresh_token,
        gmail_token_expiry: tokens.expiry_date,
      },
      {
        where: { id: userId },
      }
    );

    res.send('Authentification réussie ! Vous pouvez maintenant utiliser les fonctionnalités Gmail.');
  } catch (error) {
    console.error('Erreur lors de l\'authentification OAuth 2.0 :', error);
    res.status(500).send('Erreur lors de l\'authentification.');
  }
});

// Route pour continuer en tant qu'invité
router.post('/continue-as-guest', authController.continueAsGuest);

module.exports = router;