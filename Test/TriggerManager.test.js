const TriggerManager = require('../workflows/core/TriggerManager');
const EmailWatcher = require('../workflows/triggers/emailTrigger'); // Mise à jour du chemin
const fileUploadService = require('../services/fileUploadService');
const dataMonitoringService = require('../services/dataMonitoringService');

jest.mock('../workflows/triggers/emailTrigger'); // Mise à jour du chemin
jest.mock('../services/fileUploadService');
jest.mock('../services/dataMonitoringService');

describe('TriggerManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should register email trigger and handle new email', async () => {
    const trigger = {
      type: 'emailReceived',
      config: {
        criteria: {
          subject: 'Test Subject',
        },
      },
    };
    const workflow = { name: 'Test Workflow' };

    TriggerManager.register(trigger, workflow);

    expect(EmailWatcher).toHaveBeenCalledTimes(1);
    expect(EmailWatcher.mock.instances[0].on).toHaveBeenCalledWith('newEmail', expect.any(Function));

    const email = { from: { text: 'example@example.com' }, subject: 'Test Subject' };
    const handleNewEmail = EmailWatcher.mock.instances[0].on.mock.calls[0][1];
    await handleNewEmail(email);

    expect(console.log).toHaveBeenCalledWith('Email correspondant trouvé : Test Subject');
  });

  test('should register file upload trigger and handle file upload', async () => {
    const trigger = {
      type: 'eventBased',
      config: {
        eventType: 'fileUploaded',
        condition: { filename: 'test.txt' },
      },
    };
    const workflow = { name: 'Test Workflow' };

    TriggerManager.register(trigger, workflow);

    expect(fileUploadService.on).toHaveBeenCalledWith('fileUploaded', expect.any(Function));

    const fileData = { filename: 'test.txt' };
    const handleFileUpload = fileUploadService.on.mock.calls[0][1];
    await handleFileUpload(fileData);

    expect(console.log).toHaveBeenCalledWith('Condition remplie pour le workflow : Test Workflow');
  });

  test('should register threshold trigger and handle data change', async () => {
    const trigger = {
      type: 'eventBased',
      config: {
        eventType: 'thresholdExceeded',
        condition: { threshold: 100 },
      },
    };
    const workflow = { name: 'Test Workflow' };

    TriggerManager.register(trigger, workflow);

    expect(dataMonitoringService.on).toHaveBeenCalledWith('dataChanged', expect.any(Function));

    const data = { value: 150 };
    const handleDataChange = dataMonitoringService.on.mock.calls[0][1];
    await handleDataChange(data);

    expect(console.log).toHaveBeenCalledWith('Seuil dépassé pour le workflow : Test Workflow');
  });
});