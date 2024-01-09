const bcrypt = require('bcryptjs');

exports.hashPassword = async (password) => {
  const randomNumber = Math.floor(Math.random() * 10) + 1;
  const salt = await bcrypt.genSalt(randomNumber);
  const hashedPassword = await bcrypt.hash(password, salt);

  return hashedPassword;
};

exports.validatePassword = (incomingPassword = '', hashedPassword = '') => {
  return bcrypt.compare(incomingPassword, hashedPassword);
};
