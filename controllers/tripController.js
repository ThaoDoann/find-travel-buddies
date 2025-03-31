const express = require('express');
const router = express.Router();
const session = require('express-session');

const TripModel = require('../models/trips');
const UsersModel = require('../models/users.js');

const isAuthenticated = require('../middleware/auth.js');


router.get("/", isAuthenticated, async function (req, res) {
    try {
        const userId = req.session.user.userId;
        const trips = await TripModel.getTripsByUserId(userId);
        const tripTypes = await TripModel.getAllTripTypes();
        const tripRequests = await TripModel.getUserTripRequests(userId);
        
        trips.forEach(trip => {
            // console.log("trips.status", trip.status);
            trip.isPlanned = trip.status === 'Planned';
            trip.isCompleted = trip.status === 'Completed';
            trip.isCanceled = trip.status === 'Canceled';
        });

        
        tripRequests.forEach(request => {
            console.log("request.status", request.status);
            request.isPending = request.status == 'Pending';
            request.isApproved = request.status == 'Approved';
            request.isRejected = request.status === 'Rejected';
        });
        req.TPL.trips = trips;
        req.TPL.tripTypes = tripTypes;
        req.TPL.tripRequests = tripRequests;
        
        res.render("trips", req.TPL);
    } catch (error) {
        console.error('Error getting trips:', error);
        res.status(500).send('Error getting trips');
    }
});



// Create a new trip
router.post('/create', isAuthenticated, async function(req, res) {
    try {
        const userId = req.session.user.userId;
        const { tripName, tripTypeId, startDate, endDate, location, budget, maxCompanions, description, isPublic } = req.body;
        
        await TripModel.addPlannedTrip(
            userId,
            tripName,
            tripTypeId,
            startDate,
            endDate,
            location,
            budget,
            description,
            maxCompanions,
            isPublic === 'on' ? 1 : 0
        );

        res.redirect('/trips');
    } catch (error) {
        console.error('Error creating trip:', error);
        res.status(500).send('Error creating trip');
    }
});



// Request joining a trip
router.get('/:tripId', isAuthenticated, async function(req, res) {
    try {
        const tripId = req.params.tripId;
        const userId = req.session.user.userId;
        const trip = await TripModel.getTripById(tripId);


        // Add permission flags
        trip.isOrganizer = trip.userId === userId;
        trip.hasRoomForCompanions = trip.companionsCount < trip.maxCompanions;


        // Only fetch requests if user is the organizer
        let tripRequests = [];
        if (trip.isOrganizer) {
            tripRequests = await TripModel.getTripRequestsInfo(tripId);
            
            tripRequests.forEach(request => {
                request.isPending = request.status === 'Pending';
                request.isApproved = request.status === 'Approved';
                request.isRejected = request.status === 'Rejected';
            });
        }

        req.TPL.trip = trip;
        req.TPL.tripRequests = tripRequests;
        
        res.render('manage-trip', req.TPL);
    } catch (error) {
        console.error('Error getting trip details:', error);
        res.status(500).send('Error getting trip details');
    }
});


// Action on a join request
router.post('/:tripId/:requestId/action', isAuthenticated, async function(req, res) {
    try {
        const { tripId, requestId } = req.params;
        const { action } = req.body;
        
        // First update the request status
        await TripModel.updateTripRequestStatus(requestId, action);
        
        // Then update the companions count separately
        await TripModel.updateCompanionsCount(tripId);
        
        res.redirect(`/trips/${tripId}`);
    } catch (error) {
        console.error('Error updating trip request status:', error);
        res.status(500).send('Error updating trip request status');
    }
});


// Update trip details
router.post('/:tripId/update', async function(req, res) {
    try {
        const tripId = req.params.tripId;
        const userId = req.session.user.userId;
        const { 
            tripName, 
            location, 
            startDate, 
            endDate, 
            budget, 
            maxCompanions, 
            description, 
            isPublic 
        } = req.body;

        // First verify that this user owns the trip
        const trip = await TripModel.getTripById(tripId);

        await TripModel.updateTrip(
            tripId,
            tripName,
            location,
            startDate,
            endDate,
            budget,
            maxCompanions,
            description,
            isPublic === 'on' ? 1 : 0
        );

        res.redirect(`/trips/${tripId}`);
    } catch (error) {
        console.error('Error updating trip:', error);
        res.status(500).send('Error updating trip');
    }
});


// Request to join a trip
router.post('/join', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.userId;
        const { tripId, message } = req.body;

        // Create trip request
        await TripModel.createTripRequest(userId, tripId, message);

        // Redirect back to the user's profile page
        res.redirect(`/user/${userId}/profile`);
    } catch (error) {
        console.error('Error requesting to join trip:', error);
        res.status(500).send('Error requesting to join trip');
    }
});


// Cancel trip request
router.post('/request/:requestId/cancel', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.userId;
        const requestId = req.params.requestId;

        await TripModel.cancelTripRequest(requestId, userId);
        
        // Redirect back to the previous page
        res.redirect('back');
    } catch (error) {
        console.error('Error canceling trip request:', error);
        res.status(500).send('Error canceling trip request');
    }
});


// In the route that handles trip details
router.get('/manage/:tripId', isAuthenticated, async (req, res) => {
    try {
        const tripId = req.params.tripId;
        const trip = await TripModel.getTripById(tripId);
        
        // Get trip requests with requester information including avatars
        const requests = await TripModel.getTripRequestsWithUsers(tripId);
        for (let request of requests) {
            const requester = await UsersModel.getUserById(request.userId);
            request.requester = requester;
            request.requestDate = request.requestDate; // Ensure request date is included
        }

        req.TPL.trip = trip;
        req.TPL.tripRequests = requests; // Pass requests to the template
        
        res.render('manage-trip', req.TPL);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error loading trip details');
    }
});




module.exports = router;