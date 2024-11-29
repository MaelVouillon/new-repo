// Déclenche un workflow manuellement depuis l’interface ou une API

class ManualTrigger {
    /**
     * Valide et active le déclencheur manuel.
     * @param {Object} trigger - Configuration du déclencheur (pas nécessaire ici).
     * @param {Object} inputData - Données associées pour valider le déclencheur.
     * @returns {Boolean} Toujours vrai pour un déclencheur manuel.
     */
    static validate(trigger, inputData) {
      console.log('Déclencheur manuel activé.');
      return true; // Toujours valide pour un déclencheur manuel.
    }
  }
  
  module.exports = ManualTrigger;
  