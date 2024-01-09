const userService = require('./user.service');

exports.signup = async (req, res, next) => {
  try {
    const user = await userService.createAUser(req.body);

    return res.status(201).json({
      status: 'success',
      message: 'User created successfully.',
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const response = await userService.signinAUser(req.body);

    return res.status(200).json({
      status: 'success',
      message: 'User logged in successfully.',
      data: response,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const userLists = await userService.getAll(req.query);

    return res.status(200).json({
      status: 'success',
      message: 'User list.',
      data: userLists,
    });
  } catch (error) {
    return next(error);
  }
};
