const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_SIZE = 20;

exports.paginate = async (model, options) => {
  const {
    filter = {},
    page = DEFAULT_PAGE_NUMBER,
    size = DEFAULT_PAGE_SIZE,
    sortKey = '_id',
    sortOrder = 'asc',
  } = options;

  const sortObj = { [sortKey]: sortOrder.toLowerCase() };
  const skip = (+page - 1) * +size;
  const totalCount = await model.countDocuments(filter);
  const lastPage = Math.ceil(totalCount / +size);
  const hasNextPage = lastPage > +page;

  let docQuery = model.find(filter).sort(sortObj).skip(skip).limit(+size);
  if (options.populate) docQuery = docQuery.populate(options.populate);
  const docs = await docQuery.lean();

  const meta = {
    sortOrder,
    sortKey,
    totalCount,
    perPage: +size,
    totalPages: lastPage,
    page: +page,
    hasPrevPage: +page > 1,
    hasNextPage,
    prevPage: +page > 1 ? +page - 1 : null,
    nextPage: hasNextPage ? +page + 1 : null,
  };

  return { docs, meta };
};
