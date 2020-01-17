const geolib = require('geolib');
const userService = require('../services/userService');
const { userServiceError } = require('../responses/errors');
const constants = require('../constants');

module.exports = {

  async getAllUsers(req, res, next) {
    let response;
    let londonUsers;

    // Fetch all users from bpdts API
    try {
      response = await userService.fetchAllUsers();
    } catch (err) {
      const error = new Error(JSON.stringify(userServiceError));
      error.status = err.statusCode;
      return next(error);
    }

    const users = JSON.parse(response);

    /* Iterate through each user in the list and check whether their coordinates are within
       fifty miles of London. If they are, add them to the array.
    */
    const withinLondon = [];
    for (let i = 0; i < users.length; i += 1) {
      const userCoordinates = {
        latitude: users[i].latitude,
        longitude: users[i].longitude,
      };
      const distance = geolib.getDistance(constants.LONDON.COORDINATES, userCoordinates);
      if (distance < constants.FIFTY_MILES_IN_METRES) {
        withinLondon.push(users[i]);
      }
    }
    // Fetch all users from the bpdts API who are listed as living in London.
    try {
      londonUsers = await userService.fetchUsersByCity(constants.LONDON.NAME);
    } catch (err) {
      const error = new Error(JSON.stringify(userServiceError));
      error.status = err.statusCode;
      return next(error);
    }
    if (!londonUsers.length) {
      console.warn('No users found listed as living in London');
      return res.send(withinLondon);
    }

    const allLondonUsers = withinLondon.concat(londonUsers);
    return res.send(allLondonUsers);
  },
};
