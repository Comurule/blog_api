const { paginate } = require('../../database/helpers');
const DB = require('../../database/models');

const parseFilter = (query) => {
  let filter = {};
  if (query.searchKey) {
    filter = {
      $or: [
        { title: new RegExp(query.searchKey, 'gi') },
        { content: new RegExp(query.searchKey, 'gi') },
      ],
    };
  }

  return filter;
};

exports.findAPostByTitleAndAuthor = (title, author) => {
  return DB.Blog.findOne({
    title: new RegExp(title, 'i'),
    author,
  }).lean();
};

exports.createAPost = async (data) => {
  const post = await DB.Blog.create(data);

  return post._doc;
};

exports.updateAPost = (id, data) => {
  return DB.Blog.findByIdAndUpdate(id, data, { new: true });
};

exports.findAPostById = (id, populateAuthor = false) => {
  const query = DB.Blog.findById(id);

  return populateAuthor
    ? query.populate({ path: 'author', select: '_id firstName lastName' })
    : query;
};

exports.deleteAPostById = (id) => {
  return DB.Blog.findByIdAndDelete(id);
};

exports.findAllSelectedPosts = async (query) => {
  const filter = parseFilter(query);

  return paginate(DB.Blog, {
    filter,
    page: query.pageNumber,
    size: query.pageSize,
    sortKey: query.sortKey,
    sortOrder: query.sortOrder,
    populate: { path: 'author', select: '_id firstName lastName' },
  });
};
