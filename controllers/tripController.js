const express = require('express');
const router = express.Router();
const session = require('express-session');

const TripModel = require('../models/trips');
const UsersModel = require('../models/users.js');

const isAuthenticated = require('../middleware/auth.js');


// Displays the login page
router.get("/", isAuthenticated, async function (req, res) {
    try {
        const userId = req.session.user.userId;
        const trips = await TripModel.getTripsByUserId(userId);
        const tripTypes = await TripModel.getAllTripTypes();
        const sentRequests = await TripModel.getUserTripRequests(userId);
        
        trips.forEach(trip => {
            trip.isPlanned = trip.status === 'Planned';
            trip.isCompleted = trip.status === 'Completed';
            trip.isCanceled = trip.status === 'Canceled';
        });
        
        sentRequests.forEach(request => {
            request.isPending = request.status === 'Pending';
            request.isApproved = request.status === 'Approved';
            request.isRejected = request.status === 'Rejected';
        });
        console.log(sentRequests);

        req.TPL.trips = trips;
        req.TPL.tripTypes = tripTypes;
        req.TPL.sentRequests = sentRequests;
        
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
        
        if (!trip) {
            return res.status(404).send('Trip not found');
        }

        // Add permission flags
        trip.isOwner = trip.userId === userId;
        trip.hasRoomForCompanions = trip.companionsCount < trip.maxCompanions;

        // Get user's request status for this trip if they're not the owner
        if (!trip.isOwner) {
            const userRequest = await TripModel.getTripRequest(tripId, userId);
            if (userRequest) {
                trip.userRequestStatus = userRequest.status;
                trip.isPending = userRequest.status === 'Pending';
                trip.isApproved = userRequest.status === 'Approved';
                trip.isRejected = userRequest.status === 'Rejected';
            }
        }

        // Only fetch requests if user is the owner
        let tripRequests = [];
        if (trip.isOwner) {
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
        if (!trip || trip.userId !== userId) {
            return res.status(403).send('Unauthorized');
        }

        // Check if maxCompanions is not less than current companions count
        if (parseInt(maxCompanions) < trip.companionsCount) {
            return res.status(400).send('Max companions cannot be less than current companions count');
        }

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

        // Check if trip exists and has room
        const trip = await TripModel.getTripById(tripId);
        if (!trip) {
            return res.status(404).send('Trip not found');
        }

        if (trip.companionsCount >= trip.maxCompanions) {
            return res.status(400).send('Trip is full');
        }

        // Check if user already has a request for this trip
        const existingRequest = await TripModel.getTripRequest(tripId, userId);
        if (existingRequest) {
            return res.status(400).send('You have already requested to join this trip');
        }

        // Create trip request
        await TripModel.createTripRequest(userId, tripId, message);

        // Redirect back to the user's profile page
        res.redirect(`/user/profile/${trip.userId}`);
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




module.exports = router;