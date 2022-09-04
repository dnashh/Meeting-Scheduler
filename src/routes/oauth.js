const express = require('express');
const nanoid = require('nanoid');
const { google } = require('googleapis');
const bigPromise = require('../utils/bigPromise');
const accountSchema = require('../schema/accountSchema');
const { generateOauthClient } = require('../config/functions');
const router = express.Router();

const SCOPES = ['https://www.googleapis.com/auth/calendar', "https://www.googleapis.com/auth/userinfo.profile"];

const oauth2Client = generateOauthClient()
router.get('/', bigPromise(async (req, res) => {

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        approval_prompt: "force", 
        scope: SCOPES
    });
    res.redirect(url)


}));


async function endedMeet  (req,res){
    var account=await accountSchema.findOne({uid:req.oidc.user.sid})
    console.log(account.refreshToken)
    oauth2Client.setCredentials({
        refresh_token:  account.refreshToken,
    });
    
  const calendar = google.calendar({version: 'v3', auth:oauth2Client});
calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date(new Date().setHours(0,0,0,0)).toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
}, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const events = res.data.items;
    console.log(events)
})
}

router.get('/update',(req,res)=>{
    
  endedMeet(req,res)
  res.json({'message':'good'})
})
router.get('/callback', async (req, res) => {
    const { code } = req.query
    oauth2Client.getToken(code, function (err, tokens) {
        if (!err) {
          oauth2Client.setCredentials({
            refresh_token:  tokens.refresh_token,
        });
            accountSchema.findOneAndUpdate({ uid: req.oidc.user.sid }, {
                uid: req.oidc.user.sid,
                refreshToken: tokens.refresh_token,
                schedule: nanoid(6),
                timezone: 'Asia/Kolkata',
                name: req.oidc.user.name,
                email: req.oidc.user.email
            }, { upsert: true }).then(() => {
                res.redirect('/dashboard');
            }).catch((err) => {
                console.log(err);
                res.redirect('/dashboard');
            });
        }
    });
});

module.exports = router;
