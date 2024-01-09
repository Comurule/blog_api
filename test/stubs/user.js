const { faker } = require('@faker-js/faker');

module.exports = (
  lastName = faker.person.lastName(),
  firstName = faker.person.firstName(),
  email = faker.internet.email({ allowSpecialCharacters: false }),
  password = faker.string.alphanumeric(8),
) => ({
  lastName,
  firstName,
  email,
  password,
});
