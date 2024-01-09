const hashService = require('../../utils/hash');
const tokenService = require('../../utils/token');
const userRepo = require('./user.repository');
const { ResourceConflictError, ForbiddenError } = require('../../utils/Errors');

exports.createAUser = async (data) => {
  const duplicate = await userRepo.findUserByEmail(data.email);
  if (duplicate) {
    throw new ResourceConflictError(`User, with email: ${data.email}, already exists.`);
  }

  const password = await hashService.hashPassword(data.password);
  const newUser = await userRepo.createAUser({
    password,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
  });

  delete newUser.password;
  return newUser;
};

exports.signinAUser = async (credentials) => {
  try {
    const savedUser = await userRepo.findUserByEmail(credentials.email);
    if (!savedUser) throw new ForbiddenError();

    const isValidPassword = await hashService.validatePassword(
      credentials.password,
      savedUser.password,
    );
    if (!isValidPassword) throw new ForbiddenError();

    delete savedUser.password;
    const accessToken = tokenService.generateToken(savedUser._id);
    return {
      accessToken,
      user: savedUser,
    };
  } catch (error) {
    if (error instanceof ForbiddenError) {
      throw new ForbiddenError('Invalid login credentials.');
    }
    throw error;
  }
};

exports.getAll = async (query = {}) => {
  return userRepo.findAllSelectedUsers(query);
};
