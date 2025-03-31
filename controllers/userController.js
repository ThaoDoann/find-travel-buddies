const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const UsersModel = require('../models/users.js');
const TripsModel = require('../models/trips.js');

const isAuthenticated = require('../middleware/auth.js');

var router = express.Router()

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure this directory exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to file name
    }
});
const upload = multer({ storage: storage });

// Displays the login page
router.get("/", isAuthenticated, async function (req, res) {

    // render the login page
    res.render("user-profile", req.TPL);
});

// View user profile
router.get('/:userId/profile', isAuthenticated, async (req, res) => {
    try {
        const requestedUserId = req.params.userId;
        const currentUserId = req.session.user.userId;
        
        // Get user info
        const user = await UsersModel.getUserById(requestedUserId);

        // Get public trips
        if (currentUserId !== requestedUserId) {
            trips = await TripsModel.getPublicTripsByUserId(requestedUserId);
        } else {
            trips = await TripsModel.getTripsByUserId(requestedUserId);
        }

        
        
        // Add additional trip info for each trip
        for (let trip of trips) {

            trip.isPlanned = trip.status === 'Planned';
            console.log("trip", trip);
            // if (currentUserId !== requestedUserId) {  // Only check requests for other users' trips
            //     const request = await TripsModel.getTripRequest(trip.tripId, currentUserId);
            //     if (request) {
            //         trip.alreadyRequested = true;
            //         trip.status = request.status;
            //         trip.requestId = request.requestId;
            //         trip.isPending = request.status === 'Pending';
            //         trip.isApproved = request.status === 'Approved';
            //         trip.isRejected = request.status === 'Rejected';
            //     }
            // }
        }

        // Add flag to indicate if this is the current user's profile
        user.isCurrentUser = currentUserId == requestedUserId;
        req.TPL.user = user;
        req.TPL.trips = trips;

        res.render('user-profile', req.TPL);
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).send('Error getting user profile');
    }
});

// Trip route - add new trip
router.get('/add-trip', isAuthenticated, async function (req, res) {

    const userId = req.session.user.userId;

    const trips = await TripsModel.getTripsByUserId(userId);
    req.TPL.trips = trips;


    res.render('add-trip', req.TPL);
});

// Update user avatar
router.post('/:userId/update-avatar', upload.single('avatar'), async (req, res) => {
    try {
        const userId = req.params.userId;
        const avatarPath = `/uploads/${req.file.filename}`; // Path to save in the database

        await UsersModel.updateUserAvatar(userId, avatarPath); 
        
        res.redirect(`/user/${trip.userId}/profile`);

    } catch (error) {
        console.error('Error updating avatar:', error);
        res.status(500).send('Error updating avatar');
    }
});

// Update user information
router.post('/:userId/update-info', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { userName, email, address, bio } = req.body;
        
        await UsersModel.updateUser(userId, userName, email, address, bio); // Update user info in the database
        res.redirect(`/user/${userId}/profile`); // Redirect to the user profile page
        
    } catch (error) {
        console.error('Error updating user info:', error);
        res.status(500).send('Error updating user info');
    }
});

function deleteOldAvatar(avatarPath) {
    if (avatarPath) {
        const fullPath = path.join('public', avatarPath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    }
}

module.exports = router;