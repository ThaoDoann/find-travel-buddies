const express = require('express');
var router = express.Router()
const session = require('express-session');

const TripModel = require('../models/trips');
const UsersModel = require('../models/users.js');

const isAuthenticated = require('../middleware/auth.js');


// Displays the login page
router.get("/", isAuthenticated, async function (req, res) {

  const userId = req.session.user.userId;
  const trips = await TripModel.getTripsByUserId(userId);
  const tripTypes = await TripModel.getAllTripTypes();

  trips.forEach(trip => {
    trip.isPlanned = trip.status === 'Planned';
    trip.isCompleted = trip.status === 'Completed';
    trip.isCanceled = trip.status === 'Canceled';
  });

  
  req.TPL.trips = trips;
  req.TPL.tripTypes = tripTypes;

  // render the trips page
  res.render("trips", req.TPL);
});



// Create a new trip
router.post('/create', isAuthenticated, async function(req, res) {

  const userId = req.session.user.userId;

  const {tripName, tripTypeId, startDate, endDate, location, budget, description } = req.body;

  const result = await TripModel.addPlannedTrip(userId, tripName, tripTypeId, startDate, endDate, location, budget, description);
  
  if (result.changes > 0){
    res.render("trips", req.TPL);
  }
});



// Request joining a trip
router.get('/:tripId', isAuthenticated, async function(req, res) {

  // Extract tripId from the route parameters
  const { tripId } = req.params;

  // Retrieve the trip details from your database
  const trip = await TripModel.getTripById(tripId); // Implement this function to fetch trip data
  

  const tripRequests = await TripModel.getTripRequestsInfo(tripId);

  tripRequests.forEach(request => {
    request.isPending = request.status === 'Pending';
    request.isApproved = request.status === 'Approved';
    request.isRejected = request.status === 'Rejected';
  });

  console.log(tripRequests)


  // Add hasRoomForCompanions flag to trip object
  trip.hasRoomForCompanions = trip.companionsCount < trip.maxCompanions;
  
  req.TPL.trip = trip;
  req.TPL.tripRequests = tripRequests;

  // Render the trip details view and pass the trip data
  res.render('trip-details', req.TPL);
});


// Request joining a trip
router.post('/:tripId/:requestId/action', isAuthenticated, async function(req, res) {
  const { tripId, requestId } = req.params;
  const { action } = req.body; //Status


  await TripModel.updateTripRequestStatus(requestId, action);

  // Redirect back to the trip details page
  res.redirect(`/trips/${tripId}`);
});


module.exports = router;