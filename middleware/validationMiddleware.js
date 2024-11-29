// middleware/validationMiddleware.js

const Joi = require('joi');

const validateWorkflowCreation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    trigger: Joi.object().required(),
    actions: Joi.array().items(Joi.object()).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateWorkflowUpdate = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(255),
    trigger: Joi.object(),
    actions: Joi.array().items(Joi.object()),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateWorkflowExecution = (req, res, next) => {
  const schema = Joi.object({
    workflowId: Joi.string().uuid().required(),
    inputData: Joi.object().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = {
  validateWorkflowCreation,
  validateWorkflowUpdate,
  validateWorkflowExecution,
};