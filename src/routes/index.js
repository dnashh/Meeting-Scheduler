const { localsName } = require('ejs');
const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');

const router = express.Router();

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: 'a long, randomly-generated string stored in env',
    baseURL: 'http://localhost:3000',
    clientID: 'rXlIFihpIg4QiZOOxMOPaiyDDs0xiSAP',
    issuerBaseURL: 'https://dev-l6t3wm6h.us.auth0.com',
};

router.use(auth(config));

router.get('/', (req, res) => {
    res.render('index', { user: req.oidc.user });
});

router.get('/dashboard',requiresAuth(), (req, res) => {
    res.render('dashboard', { user: req.oidc.user, upcoming: [], past: [], account: {} })   
});

router.use('/oauth', require('./oauth'));

module.exports = router;