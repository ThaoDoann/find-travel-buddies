const express = require('express');
var router = express.Router()
const session = require('express-session');
const bcrypt = require("bcrypt");

require('dotenv').config();

const UsersModel = require('../models/users.js');

//{ google_api_key: process.env.GOOGLE_MAPS_API_KEY }

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
  if (!user || !user.password || user.password !== password) {
    req.session.error = "Invalid credentials.";
    return res.redirect("/auth/login");
  }
  req.session.user = user;
  res.redirect("/search");
});


// Displays the registration page
router.get("/register", (req, res) => {
  console.log(process.env.GOOGLE_MAPS_API_KEY)

  req.TPL.google_api_key = process.env.GOOGLE_MAPS_API_KEY;
  // if we had an error during form submit, display it, clear it from session
  req.TPL.error = req.session.login_error;
  req.session.error = "";

  // render the login page
  res.render("register", req.TPL);
});


// Handles user registration
router.post('/register', async (req, res) => {
    console.log(req.body)

    const { name, email, password, address, bio } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if the email already exists
    const existingUser = await UsersModel.getUserByEmail(email);
    if (existingUser) {
      console.log("aleady exist")
        req.TPL.error = "Email already exists. Please choose another one.";
        //return res.redirect('/auth/register');
        res.render('register', req.TPL);
        
    } else {
      // Insert new user into the database
      const result = await UsersModel.createUser(name, email, hashedPassword, address, bio);
      if (result && result.changes > 0) {
          // If registration is successful, redirect to the user's homepage

          const user = await UsersModel.getUserById(result.lastID);
          req.session.user = user[0];
          res.redirect('/home');
      } else {
          // If registration fails, re-render the login page with an error message
          req.TPL.error = "An error occur while trying to register";
          // res.render('/auth/register', req.TPL);
          return res.redirect('register');
      }
    }
});



router.get('/logout', (req, res) => {
  req.logout(() => {
      res.redirect('/login');
  });
});



module.exports = router;