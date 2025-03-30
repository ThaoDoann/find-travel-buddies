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

router.post('/login', async function (req, res) {
  const { email, password } = req.body;

  const user = await UsersModel.getUserByEmail(email);

  if (user == null) { //TODO
    req.session.error = "The user doesn't exist. Please register.";
    return res.redirect("/auth/login");
  }
  else {
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      req.session.error = "Invalid credentials. Please try again";
      return res.redirect("/auth/login");
    }

    req.session.user = user;
    res.redirect("/user/profile");
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

          const user = await UsersModel.getUserById(result.lastID);
          req.session.user = user;
          res.redirect('/user/profile');
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