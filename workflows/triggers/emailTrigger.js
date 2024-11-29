const { EventEmitter } = require('events');
const Imap = require('node-imap');
const { simpleParser } = require('mailparser');

class EmailWatcher extends EventEmitter {
  constructor(config) {
    super();
    this.imapConfig = {
      user: config.user,
      password: config.password,
      host: config.host,
      port: config.port,
      tls: config.tls,
    };
    this.imap = new Imap(this.imapConfig);
  }

  start() {
    console.log('Démarrage de l\'EmailWatcher...');
    this.imap.once('ready', () => {
      console.log('Connexion IMAP prête.');
      this.openInbox();
    });
    this.imap.on('error', (err) => {
      console.error('Erreur IMAP :', err);
    });
    this.imap.on('end', () => {
      console.log('Connexion IMAP terminée.');
    });
    this.imap.on('mail', (numNewMsgs) => {
      console.log(`Nouveau(x) mail(s) détecté(s) : ${numNewMsgs}`);
      this.processNewMail();
    });
    this.imap.connect();
  }

  stop() {
    console.log('Arrêt de l\'EmailWatcher...');
    this.imap.end();
  }

  openInbox() {
    console.log('Ouverture de la boîte de réception...');
    this.imap.openBox('INBOX', false, (err, box) => {
      if (err) {
        console.error('Erreur lors de l\'ouverture de la boîte de réception :', err);
        return;
      }
      console.log('Boîte de réception ouverte:', box);
    });
  }

  processNewMail() {
    console.log('Traitement des nouveaux mails...');
    this.imap.search(['UNSEEN'], (err, results) => {
      if (err) {
        console.error('Erreur de recherche des mails non lus :', err);
        return;
      }
      if (!results || !results.length) {
        console.log('Aucun mail non lu trouvé.');
        return;
      }

      // Traiter uniquement le dernier email non lu
      const latestEmailUID = results[results.length - 1];
      const f = this.imap.fetch(latestEmailUID, { bodies: '' });
      f.on('message', (msg) => {
        msg.on('body', (stream) => {
          simpleParser(stream, (err, parsed) => {
            if (err) {
              console.error('Erreur lors de l\'analyse du mail :', err);
              return;
            }
            console.log('Nouveau email reçu :', parsed.subject);
            this.emit('newEmail', parsed);
          });
        });
      });

      f.once('error', (err) => {
        console.error('Erreur lors du fetch des mails :', err);
      });

      f.once('end', () => {
        console.log('Fetch des mails terminé.');
      });
    });
  }
}

module.exports = EmailWatcher;