const { paginate } = require('../../database/helpers');
const DB = require('../../database/models');

const renderFilter = (query) => {
  let filter = {};
  if (query.searchKey) {
    filter = {
      $or: [
        { email: new RegExp(query.searchKey, 'gi') },
        { firstName: new RegExp(query.searchKey, 'gi') },
        { lastName: new RegExp(query.searchKey, 'gi') },
      ],
    };
  }

  return filter;
};

exports.findUserByEmail = (email) => {
  return DB.User.findOne({
    email: new RegExp(email, 'i'),
  }).lean();
};

exports.createAUser = async (data) => {
  const newUser = await DB.User.create(data);

  return newUser._doc;
};

exports.findAllSelectedUsers = async (query) => {
  const filter = renderFilter(query);

  return paginate(DB.User, { filter, ...query });
};
