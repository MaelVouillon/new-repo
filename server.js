// server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { syncDatabase, checkConnection } = require('./config/dbConfig');
const app = express();
const workflowRoutes = require('./routes/workflowRoutes');
const userRoutes = require('./routes/userRoutes'); // Importez les routes utilisateurs
const authRoutes = require('./routes/authRoutes'); // Importez les routes d'authentification
const TriggerManager = require('./workflows/core/TriggerManager');
const fileProcessingRouter = require('./routes/fileProcessing'); // Importez les routes de traitement de fichiers
const excelProcessingRouter = require('./routes/excelProcessing'); // Importez les routes de traitement de fichiers Excel
const financeRoutes = require('./routes/financeRoutes');
const triggerRoutes = require('./routes/triggerRoutes');

// Configurer CORS
app.use(cors({
  origin: 'http://localhost:3000', // Remplacez par l'URL de votre frontend
  credentials: true,
}));

// Configurer les sessions
app.use(session({
  secret: 'votre_secret_de_session',
  resave: false,
  saveUninitialized: true,
}));

// Middleware global pour parser les JSON et les URL encodées
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ajoutez ici vos routes
app.use('/api', workflowRoutes); // Enregistrez les routes workflows avec le préfixe /api
app.use('/api', userRoutes); // Enregistrez les routes utilisateurs avec le préfixe /api
app.use('/api', authRoutes); // Enregistrez les routes d'authentification avec le préfixe /api
app.use('/api', fileProcessingRouter); // Enregistrez les routes de traitement de fichiers avec le préfixe /api
app.use('/api', excelProcessingRouter); // Enregistrez les routes de traitement de fichiers Excel avec le préfixe /api
app.use('/api', financeRoutes);
app.use('/api', triggerRoutes);

// Utiliser les routes d'authentification
app.use('/', authRoutes);

// Gestion des erreurs globales (optionnelle)
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message || 'Erreur serveur' });
});

const path = require('path');

app.use(express.static(path.join(__dirname, 'frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000; // Assurez-vous que le port correspond

// Initialiser les déclencheurs après la connexion à la base de données
const startServer = async () => {
  try {
    await syncDatabase(); // Synchronise la base de données au démarrage du serveur
    await TriggerManager.init(); // Initialise les déclencheurs après synchronisation

    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur :', error);
  }
};

startServer();

// Vérification de la connexion à la base de données
checkConnection();
