const schedule = require('node-schedule');
const EmailWatcher = require('../triggers/emailTrigger');
const WorkflowExecutor = require('../core/WorkflowExecutor');
const Workflow = require('../../models/Workflow');

class TriggerManager {
  static registeredTriggers = [];
  static emailWatcher = null;
  static emailWatcherCount = 0; // Compteur pour les workflows utilisant EmailWatcher

  // Méthode d'initialisation pour charger les déclencheurs depuis la base de données
  static async init() {
    try {
      const workflows = await Workflow.findAll();
      workflows.forEach(workflow => {
        this.register(workflow.trigger, workflow);
      });
      console.log('Tous les déclencheurs ont été initialisés.');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des déclencheurs :', error);
    }
  }

  static register(trigger, workflow) {
    if (trigger.type === 'timeBased') {
      this.scheduleTimeBasedTrigger(trigger, workflow);
    } else if (trigger.type === 'eventBased') {
      this.registerEventTrigger(trigger, workflow);
    } else if (trigger.type === 'emailReceived') {
      this.registerEmailTrigger(trigger, workflow);
    }
  }

  static scheduleTimeBasedTrigger(trigger, workflow) {
    const { time, recurrence } = trigger.config;

    let job;
    if (recurrence === 'once') {
      job = schedule.scheduleJob(new Date(time), async () => {
        console.log(`Déclenchement unique pour le workflow : ${workflow.name}`);
        await this.executeWorkflow(workflow);
      });
    } else if (recurrence === 'daily') {
      job = schedule.scheduleJob({ hour: time.hour, minute: time.minute }, async () => {
        console.log(`Déclenchement quotidien pour le workflow : ${workflow.name}`);
        await this.executeWorkflow(workflow);
      });
    } else if (recurrence === 'weekly') {
      job = schedule.scheduleJob(
        { dayOfWeek: time.dayOfWeek, hour: time.hour, minute: time.minute },
        async () => {
          console.log(`Déclenchement hebdomadaire pour le workflow : ${workflow.name}`);
          await this.executeWorkflow(workflow);
        }
      );
    }
  }

  static registerEventTrigger(trigger, workflow) {
    const { eventType, condition } = trigger.config;

    if (eventType === 'fileUploaded') {
      console.log(`Déclencheur activé pour l'import de fichiers.`);
      this.listenToFileUploads(workflow, condition);
    } else if (eventType === 'thresholdExceeded') {
      console.log(`Déclencheur activé pour le dépassement de seuil.`);
      this.listenToThreshold(workflow, condition);
    }
  }

  static listenToFileUploads(workflow, condition) {
    const fileUploadService = require('../../services/fileUploadService');
    fileUploadService.on('fileUploaded', async (fileData) => {
      if (this.matchesCondition(fileData, condition)) {
        console.log(`Condition remplie pour le workflow : ${workflow.name}`);
        await this.executeWorkflow(workflow);
      }
    });
  }

  static listenToThreshold(workflow, condition) {
    const dataMonitoringService = require('../../services/dataMonitoringService');
    dataMonitoringService.on('dataChanged', async (data) => {
      if (data.value > condition.threshold) {
        console.log(`Seuil dépassé pour le workflow : ${workflow.name}`);
        await this.executeWorkflow(workflow);
      }
    });
  }

  static registerEmailTrigger(trigger, workflow) {
    console.log(`Enregistrement du déclencheur email pour le workflow : ${workflow.name}`);
    
    // Incrémenter le compteur
    this.emailWatcherCount += 1;

    if (!this.emailWatcher) {
      this.emailWatcher = new EmailWatcher({
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASS,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
      });

      this.emailWatcher.on('newEmail', (email) => {
        this.handleNewEmail(email, trigger, workflow);
      });

      this.emailWatcher.start();
      console.log('EmailWatcher démarré.');
    }

    console.log(`Déclencheur email enregistré pour le workflow : ${workflow.name}`);
  }

  static unregisterEmailTrigger(trigger, workflow) {
    console.log(`Désenregistrement du déclencheur email pour le workflow : ${workflow.name}`);

    // Décrémenter le compteur
    this.emailWatcherCount -= 1;

    if (this.emailWatcherCount <= 0 && this.emailWatcher) {
      this.emailWatcher.stop(); // Assurez-vous que cette méthode existe dans EmailWatcher
      this.emailWatcher = null;
      console.log('EmailWatcher arrêté car aucun workflow ne l\'utilise.');
    }

    console.log(`Déclencheur email désenregistré pour le workflow : ${workflow.name}`);
  }

  static handleNewEmail(email, trigger, workflow) {
    console.log('Gestion d\'un nouvel email reçu');
    const { from, subject } = email;
    const { criteria } = trigger.config;

    console.log(`Email reçu de: ${from.text}, Sujet: ${subject}`);

    // Logs supplémentaires
    console.log('Critères du déclencheur :', criteria);
    console.log('Détails de l\'email :', { from: from.text, subject });

    // Vérifiez si l'email correspond aux critères du déclencheur
    const matches = (!criteria.subject || subject.includes(criteria.subject)) &&
                    (!criteria.from || from.text.includes(criteria.from));

    if (matches) {
      console.log(`Email correspondant trouvé : ${subject}`);
      WorkflowExecutor.execute(workflow, { 
        email: { 
          from: { text: from.text }, 
          subject: subject,} });
    } else {
      console.log('L\'email ne correspond pas aux critères spécifiés.');
    }
  }

  static matchesCondition(data, condition) {
    // Implémentez la logique spécifique ici
    return true; // Placeholder
  }

  static async executeWorkflow(workflow) {
    console.log(`Exécution du workflow : ${workflow.name}`);
    await WorkflowExecutor.execute(workflow, {});
  }
}

module.exports = TriggerManager;
