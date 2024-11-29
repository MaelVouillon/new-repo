// middleware/errorHandler.js

const handleError = (res, error) => {
  console.error(error);
  res.status(500).json({ error: error.message || 'Erreur serveur' });
};

module.exports = {
  handleError,
};