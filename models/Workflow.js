// Workflow.js
// Représente la structure des données des workflows dans la base de données. Il fournit des méthodes pour créer, lire, mettre à jour, et supprimer les workflows.
// Définit les champs nécessaires pour un workflow
// Fournit des méthodes spécifiques pour interagir avec les workflows
// Utilise un ORM comme Sequelize pour communiquer avec la base

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/dbConfig');
const User = require('./User');

class Workflow extends Model {}

Workflow.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 255], // Le nom doit contenir entre 3 et 255 caractères
      },
    },
    trigger: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    actions: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    createdBy: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: 'id',
      },
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Workflow',
    tableName: 'workflows',
    timestamps: true,
  }
);

// Associations
User.hasMany(Workflow, { foreignKey: 'createdBy' });
Workflow.belongsTo(User, { foreignKey: 'createdBy' });

module.exports = Workflow;
