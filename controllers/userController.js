const express = require('express');
const session = require('express-session');
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


// Show user profile page
router.get('/profile', isAuthenticated, async (req, res) => {

    const userId = req.session.user.userId;

    const user = await UsersModel.getUserById(userId);
    const trips = await TripsModel.getTripsByUserId(userId);

    req.TPL.user = user;
    req.TPL.trips = trips;

    res.render('profile', req.TPL);
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
router.get('/add-trip', isAuthenticated, async function (req, res)  {

    const userId = req.session.user.userId;

    const trips = await TripsModel.getTripsByUserId(userId);
    req.TPL.trips = trips;


    res.render('add-trip', req.TPL);
});


module.exports = router;