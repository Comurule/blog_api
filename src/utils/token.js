const jwt = require('jsonwebtoken');
const constants = require('../config');

exports.generateToken = (user) => {
  return jwt.sign({ user }, constants.JWT_SECRET, {
    expiresIn: constants.JWT_EXPIRESIN,
  });
};

exports.verifyToken = (token = '') => {
  const payload = jwt.verify(token, constants.JWT_SECRET);
  if (!payload || !payload.user) return null;
  // if (!payload.exp || payload.exp * 1000 <= Date.now()) return null;

  return payload.user;
};
