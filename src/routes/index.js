const { localsName } = require('ejs');
const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const res = require('express/lib/response');
const accountSchema = require('../schema/accountSchema');

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

router.get('/dashboard',requiresAuth(), async (req, res) => {
    const account = await accountSchema.findOne({ uid: req.oidc.user.sid }) || {}
    res.render('dashboard', { user: req.oidc.user, upcoming: [], past: [], account })   
});

router.get('/account', requiresAuth(), async (req, res) => {
    const account = await accountSchema.findOne({ uid: req.oidc.user.sid }) || {}
    res.render('account', { account, user: req.oidc.user })
});

router.get('/schedule/:schedule', async (req, res) => {
    const { schedule } = req.params;
    const meet = await accountSchema.findOne({ schedule });

    res.render('schedule', { meet, user: req.oidc.user || {}, meeting: {} });
});

router.post('/account/', requiresAuth(), async (req, res) => {
    const resp = await accountSchema.findOneAndUpdate({ uid: req.oidc.user.sid }, {
        timezone: req.body.timezone,
        timeslots: {
            start: req.body.start,
            end: req.body.end,
        },
        repeat: req.body.repeat
    })
    res.redirect('/dashboard')
});

router.use('/oauth', require('./oauth'));

module.exports = router;