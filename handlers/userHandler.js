const geolib = require('geolib');
const userService = require('../services/userService');
const { userServiceError } = require('../responses/errors');

module.exports = {

  async getAllUsers(req, res, next) {
    // Define constants for api calls and comparisons
    const LONDON_COORDINATES = {
      latitude: 51.5074,
      longitude: 0.1278,
    };
    const FIFTY_MILES_IN_METRES = 80467;
    let userList;
    let londonUsers;

    // Fetch all users from bpdts API
    try {
      userList = await userService.fetchAllUsers();
    } catch (err) {
      const error = new Error(JSON.stringify(userServiceError));
      error.status = err.statusCode;
      return next(error);
    }

    const jsonResult = JSON.parse(userList);

    /* Iterate through each user in the list and check whether their coordinates are within
       fifty miles of London. If they are, add them to the array.
    */
    const withinLondon = [];
    for (let i = 0; i < jsonResult.length; i += 1) {
      const userCoordinates = {
        latitude: jsonResult[i].latitude,
        longitude: jsonResult[i].longitude,
      };
      const distance = geolib.getDistance(LONDON_COORDINATES, userCoordinates);
      if (distance < FIFTY_MILES_IN_METRES) {
        withinLondon.push(jsonResult[i]);
      }
    }
    // Fetch all users from the bpdts API who are listed as living in London.
    try {
      londonUsers = await userService.fetchLondonUsers();
    } catch (err) {
      const error = new Error(JSON.stringify(userServiceError));
      error.status = err.statusCode;
      return next(error);
    }

    const allLondonUsers = withinLondon.concat(JSON.parse(londonUsers));

    return res.send(allLondonUsers);
  },
};
