const express = require('express');
const router = express.Router();
const UsersModel = require('../models/users.js');

// Displays the registration page
router.get("/", (req, res) => {

    // if we had an error during form submit, display it, clear it from session
    req.TPL.error = req.session.login_error;
    req.session.error = "";

    // render the login page
    res.render("register", req.TPL);
});

// Handles user registration
router.post('/', async (req, res) => {
    console.log(req.body)

    const { name, email, password, bio } = req.body;
    
    // Check if the email already exists
    const existingUser = await UsersModel.getUserByEmail(email);
    if (existingUser) {
        req.TPL.error = "Email already exists. Please choose another one.";
        return res.redirect('/register');
    }

    // Insert new user into the database
    const user = await UsersModel.createUser(name, email, password, bio);

    if (user.length > 0) {
        // If registration is successful, redirect to the user's homepage
        req.session.user = user[0];
        res.redirect('/home');
    } else {
        // If registration fails, re-render the login page with an error message
        req.TPL.error = "En error occur";
        res.render('register', req.TPL);
    }

});

module.exports = router;
