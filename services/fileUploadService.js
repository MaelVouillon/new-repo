// services/fileUploadService.js

const EventEmitter = require('events');

class FileUploadService extends EventEmitter {
  // Simule le téléchargement d'un fichier
  uploadFile(fileData) {
    // Logique simulée pour le téléchargement de fichier
    console.log('Fichier téléchargé:', fileData);
    this.emit('fileUploaded', fileData);
  }
}

module.exports = new FileUploadService();