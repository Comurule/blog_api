const { UnauthorizedError } = require('../../utils/Errors');
const { verifyToken } = require('../../utils/token');

module.exports = async (req, res, next) => {
  try {
    if (!req.headers.authorization) throw new Error();

    const tokenArray = req.headers.authorization.split(' ');
    if (tokenArray[0] !== 'Bearer') throw new Error();

    const token = tokenArray[1];
    if (!token) throw new Error();

    const tokenUser = await verifyToken(token);
    if (!tokenUser) throw new Error();

    req.user = tokenUser;

    next();
  } catch (error) {
    next(new UnauthorizedError('User not authenticated.'));
  }
};
