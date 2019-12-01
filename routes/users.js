const userHandler = require('../handlers/userHandler');

module.exports = (router) => {
  router.get('/users', userHandler.getAllUsers);
};
