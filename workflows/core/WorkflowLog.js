// models/WorkflowLog.js
// journalisation des workflows

const { DataTypes, Model } = require('sequelize'); // Importation correcte depuis sequelize
const { sequelize } = require('../../config/dbConfig'); // Chemin mis à jour

class WorkflowLog extends Model {}

WorkflowLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    workflowId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'WorkflowLog',
    tableName: 'workflow_logs',
    timestamps: true,
  }
);

module.exports = WorkflowLog;