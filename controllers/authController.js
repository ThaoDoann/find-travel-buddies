const express = require('express');
var router = express.Router()
const session = require('express-session');
const bcrypt = require("bcrypt");

const UsersModel = require('../models/users.js');
const isAuthenticated = require('../middleware/auth.js');



// Displays the Login page
router.get("/login", async function (req, res) {

  // if we had an error during form submit, display it, clear it from session
  req.TPL.error = req.session.error;
  req.session.error = "";

  // render the login page
  res.render("login", req.TPL);
});

router.post("/login", async function (req, res) {
    try {
        const { email, password } = req.body;
        
        // Get user from database by email
        const user = await UsersModel.authenticateUser(email);

        if (user) {
            // Compare the provided password with the stored hash
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                req.session.user = user;  // Store user info in session
                
                // Redirect to user profile page
                res.redirect(`/user/${user.userId}/profile`);
            } else {
                // Password doesn't match
                req.TPL.error = "Invalid email or password";
                res.render("login", req.TPL);
            }
        } else {
            // User not found
            req.TPL.error = "User does not exist";
            res.render("login", req.TPL);
        }
    } catch (error) {
        console.error('Login error:', error);
        req.TPL.error = "An error occurred during login";
        res.render("login", req.TPL);
    }
});


// Displays the registration page
router.get("/register", (req, res) => {
  
  // if we had an error during form submit, display it, clear it from session
  req.TPL.error = req.session.login_error;
  req.session.error = "";

  // render the login page
  res.render("register", req.TPL);
});


// Handles user registration
router.post('/register', async (req, res) => {

    const { userName, email, password, address, bio } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword)

    // Check if the email already exists
    const existingUser = await UsersModel.getUserByEmail(email);
    if (existingUser) {
        req.TPL.error = "Email already exists. Please choose another one.";
        res.render('register', req.TPL);
        
    } else {
      // Insert new user into the database
      
      const result = await UsersModel.createUser(userName, email, hashedPassword, address, bio);
      
      if (result && result.changes > 0) {
          // If registration is successful, redirect to the user's homepage
            const userId = result.lastID;
            const user = await UsersModel.getUserById(userId);
            req.session.user = user;
            res.redirect(`/user/${userId}/profile`);
      } else {
          // If registration fails, re-render the login page with an error message
          req.TPL.error = "An error occur while trying to register";
          return res.redirect('register');
      }
    }
});



router.get('/logout', isAuthenticated, async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).send("Error logging out.");
    }
    res.redirect('/auth/login');
  });
});



module.exports = router;