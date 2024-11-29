// services/dataMonitoringService.js

const EventEmitter = require('events');

class DataMonitoringService extends EventEmitter {
  // Simule la surveillance des données
  monitorData(data) {
    // Logique simulée pour la surveillance des données
    console.log('Données surveillées:', data);
    if (data.value) {
      this.emit('dataChanged', data);
    }
  }
}

module.exports = new DataMonitoringService();