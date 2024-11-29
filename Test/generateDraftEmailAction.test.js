// Test/generateDraftEmailAction.test.js

const GenerateDraftEmailAction = require('../workflows/actions/generateDraftEmailAction');
const GmailIntegration = require('../integrations/email/GmailIntegration');
const Workflow = require('../models/Workflow'); // Assurez-vous que ce chemin est correct
const WorkflowLog = require('../models/WorkflowLog'); // Assurez-vous que ce chemin est correct

jest.mock('../integrations/email/GmailIntegration');

describe('GenerateDraftEmailAction', () => {
  let workflow;

  beforeEach(async () => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();

    // Créer une instance de Workflow pour les tests
    workflow = await Workflow.create({
      name: 'Test Workflow',
      trigger: {
        type: 'manualTrigger',
        config: {}
      },
      actions: [
        {
          type: 'generateDraftEmail',
          config: {}
        }
      ],
      createdBy: 'some-uuid' // Assurez-vous que cette valeur correspond à un utilisateur valide dans vos tests
    });
  });

  afterEach(async () => {
    // Nettoyer les données après chaque test
    await WorkflowLog.destroy({ where: {} });
    await Workflow.destroy({ where: {} });
  });

  test('should generate a draft email successfully', async () => {
    const config = {
      to: 'test@example.com',
      subject: 'Test Brouillon',
      text: 'Ceci est un test de brouillon.',
      html: '<p>Ceci est un test de brouillon.</p>',
    };
    const inputData = {
      htmlContent: '<p>Ceci est un contenu HTML personnalisé.</p>',
    };

    GmailIntegration.createDraft.mockResolvedValue({ success: true, id: 'draft12345' });

    const result = await GenerateDraftEmailAction.execute(workflow, config, inputData);

    expect(GmailIntegration.createDraft).toHaveBeenCalledWith(
      config.to,
      config.subject,
      config.text,
      config.html
    );
    expect(result).toEqual({ success: true, draftId: 'draft12345' });
    expect(console.log).toHaveBeenCalledWith('Préparation de la génération de brouillon d\'email à : test@example.com');
    expect(console.log).toHaveBeenCalledWith('Brouillon créé avec l\'ID : draft12345');
  });

  test('should handle errors during draft generation', async () => {
    const config = {
      to: 'test@example.com',
      subject: 'Test Brouillon',
      text: 'Ceci est un test de brouillon.',
      html: '<p>Ceci est un test de brouillon.</p>',
    };
    const inputData = {
      htmlContent: '<p>Ceci est un contenu HTML personnalisé.</p>',
    };

    GmailIntegration.createDraft.mockRejectedValue(new Error('Erreur de l\'API Gmail'));

    const result = await GenerateDraftEmailAction.execute(workflow, config, inputData);

    expect(GmailIntegration.createDraft).toHaveBeenCalledWith(
      config.to,
      config.subject,
      config.text,
      config.html
    );
    expect(result).toEqual({ success: false, error: 'Erreur de l\'API Gmail' });
    expect(console.error).toHaveBeenCalledWith('Erreur lors de la génération du brouillon d\'email :', 'Erreur de l\'API Gmail');
  });
});