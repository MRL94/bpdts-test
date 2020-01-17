const request = require('request-promise');

module.exports = {

  /**
   * @description Retrieves a list of all users from the bpdts API
   * @returns {array} List of users
   */
  async fetchAllUsers() {
    const options = {
      uri: 'https://bpdts-test-app.herokuapp.com/users',
    };
    return request(options);
  },

  /**
   * @description Retrieves a list of users from the bpdts API who are defined as living in London
   * @returns {array} List of London-based users
   */
  async fetchUsersByCity(city) {
    const options = {
      uri: `https://bpdts-test-app.herokuapp.com/city/${city}/users`,
    };
    const response = await request(options);
    return JSON.parse(response);
  },

};
