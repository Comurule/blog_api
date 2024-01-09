const blogService = require('./blog.service');

exports.createAPost = async (req, res, next) => {
  try {
    const response = await blogService.createAPost(req.body, req.user);

    return res.status(201).json({
      status: 'success',
      message: 'Post created successfully.',
      data: response,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateAPost = async (req, res, next) => {
  try {
    const response = await blogService.updateAPost(req.params.id, req.body, req.user);

    return res.status(200).json({
      status: 'success',
      message: 'Post updated successfully.',
      data: response,
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteAPost = async (req, res, next) => {
  try {
    await blogService.deleteAPostById(req.params.id, req.user);

    return res.status(200).json({
      status: 'success',
      message: 'Post deleted successfully.',
      data: true,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getAPost = async (req, res, next) => {
  try {
    const response = await blogService.findAPostById(req.params.id);

    return res.status(200).json({
      status: 'success',
      message: 'Post details.',
      data: response,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const response = await blogService.getAll(req.query);

    return res.status(200).json({
      status: 'success',
      message: 'Post list.',
      data: response,
    });
  } catch (error) {
    return next(error);
  }
};
