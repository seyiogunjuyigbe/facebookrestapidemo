const { User } = require('../models');

module.exports = async function () {
  try {
    const existingTestUser = await User.findOne({ email: 'testuser@mail.com' });
    if (existingTestUser) {
      console.log('test user already created');
      return;
    }
    await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@mail.com',
      password: 'testPass',
      isVerified: true,
    });
    console.log('test user created sucessfully');
  } catch (error) {
    console.log(
      `An error occured whle creating the test user: ${error.message}`
    );
  }
};
