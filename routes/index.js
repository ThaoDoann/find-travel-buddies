const express = require('express');
const router = express.Router();
const TripController = require('../controllers/tripController');
const UserController = require('../controllers/userController');
const isAuthenticated = require('../middleware/auth');

// Trip routes
router.get('/trips', isAuthenticated, TripController.getTrips);
router.get('/trips/:id', isAuthenticated, TripController.getTripDetails);
router.post('/trips', isAuthenticated, TripController.createTrip);
router.post('/trips/requests/:requestId/status', isAuthenticated, TripController.updateTripRequestStatus);
router.post('/trips/:id/join', isAuthenticated, TripController.requestToJoinTrip);

// Search routes
router.get('/search', isAuthenticated, TripController.search);
router.get('/public-trips', isAuthenticated, TripController.getPublicTrips);

// User routes
router.get('/user/:id', isAuthenticated, UserController.getUserProfile);
router.post('/user/connect', isAuthenticated, UserController.createConnectionRequest);
router.post('/user/connections/:connectionId/status', isAuthenticated, UserController.updateConnectionStatus);
router.get('/connections', isAuthenticated, UserController.getUserConnections);
router.get('/pending-connections', isAuthenticated, UserController.getPendingConnectionRequests);
router.get('/user/search', isAuthenticated, UserController.searchUsers);
router.put('/profile', isAuthenticated, UserController.updateUserProfile);

module.exports = router; 