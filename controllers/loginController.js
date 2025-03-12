const express = require('express');
var router = express.Router()
const session = require('express-session');


const UsersModel = require('../models/users.js');

// Displays the login page
router.get("/", async function (req, res) {

  // if we had an error during form submit, display it, clear it from session
  req.TPL.error = req.session.error;
  req.session.error = "";

  // render the login page
  res.render("login", req.TPL);
});


router.post('/', async function (req, res) {
  const { email, password } = req.body;

  const user = await UsersModel.authenticateUser(email, password);

  if (user.length > 0) {
      // If authentication is successful, redirect to the user's homepage
      req.session.user = user[0];
      res.redirect('/home');
  } else {
      // If authentication fails, re-render the login page with an error message
      req.TPL.error = "Invalid credentials. Please try again.";
      res.render('login', req.TPL);
  }
});


module.exports = router;