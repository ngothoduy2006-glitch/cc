const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) return res.status(401).json({ message: 'Unauthorized: Missing Authorization header' });

  const parts = authHeader.split(' ');
  const token = parts.length === 2 ? parts[1] : parts[0];

  try {
    const payload = jwt.verify(token, jwtConfig.secret);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
}

module.exports = { authenticate };