const { faker } = require('@faker-js/faker');

module.exports = (content = faker.lorem.paragraph(), title = faker.lorem.lines()) => ({
  title,
  content,
});
