const express = require('express');
const multer = require('multer');
const UsersModel = require('../models/users.js');
const TripsModel = require('../models/trips.js');

const isAuthenticated = require('../middleware/auth.js');


var router = express.Router()


// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });




// Displays the login page
router.get("/", isAuthenticated, async function (req, res) {

    // render the login page
    res.render("profile", req.TPL);
});


// View user profile
router.get('/profile/:userId', isAuthenticated, async (req, res) => {
    try {
        const currentUserId = req.session.user.userId;
        const userId = req.params.userId;
        
        // Get user info
        const user = await UsersModel.getUserById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Get public trips with additional info
        const publicTrips = await TripsModel.getPublicTripsByUserId(userId);
        
        // Add additional trip info for each trip
        for (let trip of publicTrips) {
            trip.isPlanned = trip.status === 'Planned';
            if (currentUserId !== userId) {  // Only check requests for other users' trips
                const request = await TripsModel.getTripRequest(trip.tripId, currentUserId);
                if (request) {
                    trip.alreadyRequested = true;
                    trip.status = request.status;
                    trip.requestId = request.requestId;
                    trip.isPending = request.status === 'Pending';
                    trip.isApproved = request.status === 'Approved';
                    trip.isRejected = request.status === 'Rejected';
                }
            }
        }

        req.TPL.user = user;
        req.TPL.publicTrips = publicTrips;
        
        res.render('user-profile', req.TPL);
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).send('Error getting user profile');
    }
});



// Current user's profile
router.get("/profile", isAuthenticated, async function (req, res) {
    try {
        const userId = req.session.user.userId;
        const user = await UsersModel.getUserById(userId);
        const trips = await TripsModel.getTripsByUserId(userId);

        req.TPL.user = user;
        req.TPL.trips = trips;

        res.render('profile', req.TPL);
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).send('Error getting profile');
    }
});



// Update user profile 
router.post('/save-profile', isAuthenticated, upload.single('avatar'), async (req, res) => {
    const userId = req.session.user.userId;

    const { name, email, address, bio } = req.body;
    let avatarBuffer = null;

    // If there's an avatar file, handle it as a blob (in memory)
    if (req.file) {
        avatarBuffer = req.file.buffer;  // Blob object in memory
    }

    // Update user profile here
    const updatedUser = await UsersModel.updateUser(userId, name, email, address, bio, avatarBuffer);
    res.json({ avatarUrl: `/uploads/${userId}.png` });  // Return the URL to the avatar

    req.session.user.avatar = updatedUser.avatar;

    req.TPL.user = updatedUser;

    // req.TPL ={ user, trips };
    res.render('profile', req.TPL);
});


// Trip route - add new trip
router.get('/add-trip', isAuthenticated, async function (req, res) {

    const userId = req.session.user.userId;

    const trips = await TripsModel.getTripsByUserId(userId);
    req.TPL.trips = trips;


    res.render('add-trip', req.TPL);
});


// // Get user profile
// async function getUserProfile(req, res) {
//     try {
//         const userId = req.params.id;
//         const user = await UsersModel.getUserByIdWithConnection(userId, req.session.userId);
//         const publicTrips = await TripsModel.getPublicTripsByUserId(userId);

//         if (!user) {
//             return res.status(404).send('User not found');
//         }

//         res.render('user-profile', {
//             user,
//             publicTrips,
//             showBio: true,
//             showActions: true
//         });
//     } catch (error) {
//         console.error('Error getting user profile:', error);
//         res.status(500).send('Error getting user profile');
//     }
// }

// // Create connection request
// async function createConnectionRequest(req, res) {
//     try {
//         const { recipientId } = req.body;
//         await UsersModel.createConnectionRequest(req.session.userId, recipientId);
//         res.json({ success: true });
//     } catch (error) {
//         console.error('Error creating connection request:', error);
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// // Update connection status
// async function updateConnectionStatus(req, res) {
//     try {
//         const { connectionId, status } = req.body;
//         await UsersModel.updateConnectionStatus(connectionId, status);
//         res.json({ success: true });
//     } catch (error) {
//         console.error('Error updating connection status:', error);
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// // Get user's connections
// async function getUserConnections(req, res) {
//     try {
//         const connections = await UsersModel.getUserConnections(req.session.userId);
//         res.render('connections', { connections });
//     } catch (error) {
//         console.error('Error getting user connections:', error);
//         res.status(500).send('Error getting user connections');
//     }
// }

// // Get pending connection requests
// async function getPendingConnectionRequests(req, res) {
//     try {
//         const pendingRequests = await UsersModel.getPendingConnectionRequests(req.session.userId);
//         res.render('pending-connections', { pendingRequests });
//     } catch (error) {
//         console.error('Error getting pending connection requests:', error);
//         res.status(500).send('Error getting pending connection requests');
//     }
// }

// // Search users
// async function searchUsers(req, res) {
//     try {
//         const { query } = req.query;
//         const users = await UsersModel.searchUsers(query);
//         res.render('search', { users, searchQuery: query });
//     } catch (error) {
//         console.error('Error searching users:', error);
//         res.status(500).send('Error searching users');
//     }
// }

// // Update user profile
// async function updateUserProfile(req, res) {
//     try {
//         const { userName, email, address, bio } = req.body;
//         const avatarBuffer = req.file ? req.file.buffer : null;

//         await UsersModel.updateUser(
//             req.session.userId,
//             userName,
//             email,
//             req.body.password,
//             address,
//             bio,
//             avatarBuffer
//         );

//         res.redirect('/profile');
//     } catch (error) {
//         console.error('Error updating user profile:', error);
//         res.status(500).send('Error updating user profile');
//     }
// }

// module.exports = {
//     getUserProfile,
//     createConnectionRequest,
//     updateConnectionStatus,
//     getUserConnections,
//     getPendingConnectionRequests,
//     searchUsers,
//     updateUserProfile
// };

module.exports = router;