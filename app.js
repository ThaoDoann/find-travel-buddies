const express = require('express');
const mustacheExpress = require('mustache-express');
const session = require('express-session');
require('dotenv').config();
const multer = require('multer');

const authRoutes = require("./controllers/authController");
const userRoutes = require("./controllers/userController");
const tripRoutes = require("./controllers/tripController");

const app = express();
const PORT = 3000;

// Set up Mustache as the templating engine
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

// Middleware
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true })); 
app.use(express.static('public'));
app.use(session({
    secret: 'keyboard cat', 
    resave: false, 
    saveUninitialized: false
}))

// Create a middleware to populate an initial template array
app.use(function (req, res, next) {

    // reset the template obect to a blank object on each request
    req.TPL = {};

    // If session exists, user is logged in
    req.TPL.user = req.session.user || null;
    req.TPL.google_api_key = process.env.GOOGLE_MAPS_API_KEY;

    next();
});

const upload = multer({
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/trips", tripRoutes);

// Home Route - redirect to /home by default
app.get("/", function (req, res) {
    if (req.session.user) {
        // If user is logged in, redirect to their profile
        res.redirect(`/user/${req.session.user.userId}/profile`);
    } else {
        // If not logged in, redirect to login
        res.redirect("/auth/login");
    }
});

// Catch-all router case
app.get(/^(.+)$/, function (req, res) {
    res.sendFile(__dirname + req.params[0]);
});




app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
