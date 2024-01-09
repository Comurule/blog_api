const {
  ResourceConflictError,
  ResourceNotFoundError,
  ForbiddenError,
} = require('../../utils/Errors');
const blogRepo = require('./blog.repository');

exports.createAPost = async (data, userId) => {
  const duplicate = await blogRepo.findAPostByTitleAndAuthor(data.title, userId);
  if (duplicate) {
    throw new ResourceConflictError(`Blog post, with title: ${data.title}, already exists by this author.`);
  }

  return blogRepo.createAPost({
    title: data.title,
    content: data.content,
    author: userId,
  });
};

exports.updateAPost = async (id, data, userId) => {
  const savedPost = await blogRepo.findAPostById(id);
  if (!savedPost) {
    throw new ResourceNotFoundError('Post record not found.');
  }
  if (String(savedPost.author) !== userId) {
    throw new ForbiddenError('You can only edit posts you created.');
  }

  const updatePayload = {};
  if (data.content) updatePayload.content = data.content;
  if (data.title) {
    const duplicate = await blogRepo.findAPostByTitleAndAuthor(data.title, userId);
    if (duplicate && String(duplicate._id) !== id) {
      throw new ResourceConflictError(`Blog post, with title: ${data.title}, already exists by this author.`);
    }

    updatePayload.title = data.title;
  }

  return blogRepo.updateAPost(id, updatePayload);
};

exports.findAPostById = async (id) => {
  const savedPost = await blogRepo.findAPostById(id, true);
  if (!savedPost) {
    throw new ResourceNotFoundError('Post record not found.');
  }
  return savedPost;
};

exports.deleteAPostById = async (id, userId) => {
  const savedPost = await blogRepo.findAPostById(id);
  if (!savedPost) {
    throw new ResourceNotFoundError('Post record not found.');
  }
  if (String(savedPost.author) !== userId) {
    throw new ForbiddenError('You can only delete posts you created.');
  }

  return blogRepo.deleteAPostById(id);
};

exports.getAll = async (query = {}) => {
  return blogRepo.findAllSelectedPosts(query);
};
