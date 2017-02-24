var express = require('express');
var router = express.Router();
var User = require('../models/user');
var mid = require('../middleware');

// GET /
router.get('/', function(req, res, next) {
  return res.render('index', { title: 'Home' });
});

// GET /profile

router.get('/profile', mid.requiresLogin, function(req, res, next) {
  User.findById(req.session.userId)
    .exec(function(err, user) {
      if(err) {
        return next(err);
      } else {
        return res.render('profile', {
          title: 'Profile',
          name: user.name,
          favorite: user.favoriteBook
        })
      }
    });
})

// GET /login
router.get('/login', mid.loggedOut, function(req, res, next) {
  return res.render('login', { title: 'Log In' })
});

// POST /login
router.post('/login', function(req, res, next) {
  if (req.body.email && req.body.password) {

    User.authenticate(req.body.email, req.body.password, function(err, user) {
      if(err || !user) {
        var error = new Error('Wrong email for password');
        error.status = 401;
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  } else {
    var err = new Error('Email and password required, geez...');
    err.status = 401;
    return next(err);
  }
});


// GET /logout
router.get('/logout', function(req, res, next) {
  if (req.session) {
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

// GET /about
router.get('/about', function(req, res, next) {
  return res.render('about', { title: 'About' });
});

// GET /contact
router.get('/contact', function(req, res, next) {
  return res.render('contact', { title: 'Contact' });
});

router.get('/register', mid.loggedOut, function(req, res, next) {
  return res.render('register', { title: 'Sign Up' });
});

router.post('/register', function(req, res, next) {
  //all forms filled out?
  if (req.body.email &&
    req.body.name &&
    req.body.favoriteBook &&
    req.body.password &&
    req.body.confirmPassword) {

      //do passwords match?
      if (req.body.password !== req.body.confirmPassword) {
        var err = new Error('Passwords do not match, whaaaat...');
        err.status = 400;
        return next(err);
      }

      //create object with data the user gave us from the form
      const userData = {
        email: req.body.email,
        name: req.body.name,
        favoriteBook: req.body.favoriteBook,
        password: req.body.password
      };

      //send new document to mongo
      User.create(userData, function(err, user) {
        if (err) {
          return (next(err));
        } else {
          req.session.userId = user._id;
          return res.redirect('/profile');
        }
      })


    } else {
      //nope, not all forms filled out
      var err = new Error('All fields required, you dumb dumb');
      err.status = 400;
      return next(err);
    }
});

module.exports = router;
