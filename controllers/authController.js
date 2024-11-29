// controllers/authController.js
const jwt = require('jsonwebtoken');

const continueAsGuest = (req, res) => {
  const token = jwt.sign({ role: 'guest' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.status(200).json({ token, role: 'guest' });
};

module.exports = {
  // ... autres fonctions
  continueAsGuest,
};