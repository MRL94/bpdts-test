const geolib = require('geolib');
const userService = require('../services/userService');
const ERRORS = require('../responses/errors');

module.exports = {

  async getAllUsers(req, res) {
    // Define constants for api calls and comparisons
    const LONDON_COORDINATES = {
      latitude: 51.5074,
      longitude: 0.1278,
    };
    const FIFTY_MILES_IN_METRES = 80467;

    // Fetch all users from bpdts API
    const userList = await userService.fetchAllUsers().catch((err) => {
      throw new Error(ERRORS.userService, err);
    });

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
    const londonUsers = await userService.fetchLondonUsers();

    const allLondonUsers = withinLondon.concat(JSON.parse(londonUsers));

    return res.send(allLondonUsers);
  },
};
