const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const auth = require('./auth.js');
const passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

require('./db');

const app = express();

app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('keyboard cat'));
app.use(session({ 
    resave: false,
    saveUninitialized: true,
    secret: 'secret',
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

const User = mongoose.model('User');

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username or password.' });
      }
    //   if (!user.validPassword(password)) {
    //     return done(null, false, { message: 'Incorrect password.' });
    //   }
      return done(null, user);
    });
  }
));
passport.serializeUser(function(user, done) {
    done(null, user.id);
});
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

app.get('/', (req, res) => {
    res.render('entrance');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login',
    passport.authenticate('local', { successRedirect: '/home',
                                    failureRedirect: '/login',
                                    })
);

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    auth.register(req.body.username, req.body.name, req.body.password, (message) => {
        // error callback
        res.render('register', message);
    }, () => {
        // success callback
        res.redirect('/login');
        // auth.startAuthenticatedSession(req, user, () => {
        //     res.redirect('/home');
        // });
    });
});

app.get('/home', (req, res) => {
    if (req.user) {
        axios('https://www.themealdb.com/api/json/v2/9973533/latest.php')
        .then( (response) => {
            // response.data.meals
            //console.log(response)
            res.render('home', {meals: response.data.meals});
        })
        .catch( (err) => {
            console.log(err);
        })
    }
    else {
        res.redirect('/login');
    }
});

app.get('/results', (req, res) => {
    if (req.user) {
        res.render('results', {ingredients: req.body.ingredients});
    }
    else {
        res.redirect('/login');
    }
})

app.get('/search', (req, res) => {
    if (req.user) {
        axios('https://www.themealdb.com/api/json/v2/9973533/randomselection.php')
        .then( (response) => {
            // response.data.meals
            res.render('search', {meals: response.data.meals});
        })
        .catch( (err) => {
            console.log(err);
        })
    }
    else {
        res.redirect('/login');
    }
})
app.post('/search', (req, res) => {
    if (req.user) {
        axios(`https://www.themealdb.com/api/json/v2/9973533/search.php?s=${req.body.meal}`)
        .then( (response) => {
            // response.data.meals
            res.cookie('search', req.body.meal);
            res.render('search', {meals: response.data.meals});
        })
        .catch( (err) => {
            console.log(err);
        })
    }
    else {
        res.redirect('/login');
    }
})

app.get('/account', (req, res) => {
    if (req.user) {
        res.render('account', {user: req.user, search: req.cookies.search});
    }
    else {
        res.redirect('/login');
    }
})

app.get('/contact', (req, res) => {
    if (req.user) {
        res.render('contact');
    }
    else {
        res.redirect('/login');
    }
})

app.listen(process.env.PORT || 3000);