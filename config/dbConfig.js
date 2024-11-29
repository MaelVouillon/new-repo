// Utilité :
// gère la configuration de la connexion à la base de données pour l'application backend
// Définit les paramètres de connexion à la base de données
// Utilise un ORM (Sequelize) pour simplifier les interactions
// Permet de configurer différentes bases de données pour le développement, les tests, et la production

// Interactions avec le Reste du Programme
// Sequelize (ORM) : Passe les informations de connexion à Sequelize pour établir la communication avec la base
// Modèles : Fournit une instance de connexion que les modèles utilisent pour interagir avec la base
// Middleware : Peut être utilisé pour valider l’état de la connexion avant de traiter les requêtes

const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_PORT } = process.env;

// Vérification des variables d'environnement
if (!DB_NAME || !DB_USER || !DB_PASS || !DB_HOST) {
  console.error('Erreur : Une ou plusieurs variables d\'environnement sont manquantes.');
  process.exit(1);
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT || 5432,
  dialect: 'postgres',
});

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données réussie.');
    await sequelize.sync({ alter: true }); // Synchronise les modèles
    console.log('Base de données synchronisée.');
  } catch (error) {
    console.error('Erreur lors de la connexion à la base de données :', error.message);
    process.exit(1);
  }
};

const checkConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données vérifiée avec succès !');
  } catch (error) {
    console.error('Erreur de connexion à la base de données :', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, syncDatabase, checkConnection };
