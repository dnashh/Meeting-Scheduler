require('dotenv').config();
const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const { nextWeek, addMinutes, createMeet, deleteMeet } = require('../config/functions');
const accountSchema = require('../schema/accountSchema');
const eventSchema = require('../schema/eventSchema');

const router = express.Router();

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH_SECRET,
    baseURL: process.env.BASEURL,
    clientID: process.env.AUTH_CLIENT_ID,
    issuerBaseURL: process.env.ISSUER_BASE_URL,
};

router.use(auth(config));

router.get('/', (req, res) => {
    res.render('index', { user: req.oidc.user });
});

router.get('/dashboard',requiresAuth(), async (req, res) => {
    const account = await accountSchema.findOne({ uid: req.oidc.user.sid }) || {}
    const upcoming = await eventSchema.find({$or: [{created_by: req.oidc.user.email}, {scheduled_by: req.oidc.user.email}]}).where('start').gt(Date.now())
    console.log(account);
    res.render('dashboard', { user: req.oidc.user, upcoming, account })   
});

router.get('/account', requiresAuth(), async (req, res) => {
    const account = await accountSchema.findOne({ uid: req.oidc.user.sid }) || {}
    res.render('account', { account, user: req.oidc.user })
});

router.get('/schedule/:schedule', async (req, res) => {
    const { schedule } = req.params;
    const meet = await accountSchema.findOne({ schedule });
    const dates = nextWeek(meet.repeat);
    res.render('schedule', { meet, user: req.oidc.user || {}, dates });
});

router.post('/schedule/:schedule', async (req, res) => {
    const data = req.body;
    const { schedule } = req.params;
    const meet = await accountSchema.findOne({ schedule });
    data.start = addMinutes(data.date+"T"+data.time,0);
    data.end = addMinutes(data.date+"T"+data.time, data.duration);
    await createMeet({
        refreshToken: meet.refreshToken,
        title: data.title,
        start: data.start,
        end: data.end,
        scheduled_by: data.email,
        scheduler: data.name,
        duration: data.duration
    })
    res.render('success', { user: req.oidc.user });
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

router.post('/delete-event/:id', requiresAuth() ,async (req, res) => {

    const { refreshToken } = await accountSchema.findOne({ email: req.oidc.user.email });
    await deleteMeet({
        refreshToken: refreshToken,
        eventId: req.params.id
    });
    await eventSchema.deleteOne({ uid: req.params.id })
    res.redirect('/dashboard');
})

router.use('/oauth', require('./oauth'));

module.exports = router;