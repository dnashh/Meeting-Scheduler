const express = require('express');
const nanoid = require('nanoid');
const session = require('express-session');
const { google } = require('googleapis');
const bigPromise = require('../utils/bigPromise');
const accountSchema = require('../schema/accountSchema');
const router = express.Router();

const SCOPES = ['https://www.googleapis.com/auth/calendar', "https://www.googleapis.com/auth/userinfo.profile"];

const oauth2Client = new google.auth.OAuth2(
    "607553710493-p50a8tji9e9chd5avm3eruqi02v4vhp0.apps.googleusercontent.com",
    "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",
    "http://localhost:3000/oauth/callback/"
);
router.get('/', bigPromise(async (req, res) => {

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        approval_prompt: "force", 
        scope: SCOPES
    });
    res.redirect(url)


}));

function updateMeet(calendar, body) {
    calendar.events.delete({
        calendarId: 'primary',
        eventId: "tp2gikvufs5gqsrs7l3prevqmk"
    }, (err, _res) => {
        if (err) {
            console.log('The API returned an error: ' + err)
            reject(err)
            return
        }
        console.log('Delete event id: ' + err)
    })
}

function createMeet(calendar, body) {
    const id = nanoid()
    var event = {
        "summary": body.title,
        "start": {
            "dateTime": body.start,
            "timeZone": "Asia/Kolkata"
        },
        "end": {
            "dateTime": body.end,
            "timeZone": "Asia/Kolkata"
        },

        "attendees": body.attendees,
        "conferenceData": {
            "createRequest": {
                "requestId": id.toString(),
                "conferenceSolutionKey": { "type": "hangoutsMeet" }
            }
        },

        "reminders": {
            'useDefault': true,
        },
    }

    calendar.events.insert({
        auth: oauth2Client,
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendNotifications: true,
    }, function (err, event) {
        if (err) {
            console.log('There was an error contacting the Calendar service: ' + err);
            return;
        }
        console.log('Event created: %s', event.data.htmlLink);
        console.log(event)
        console.log(event.data)
    });
}


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


// oauth2Client.setCredentials({
//     refresh_token: tokens.refresh_token,
// });
// const calendar = google.calendar({ version: "v3", auth: oauth2Client });  // Modified

            // var attendees=  [
            //     {'email': 'sit20cs069@sairamtap.edu.in'},
            //     {'email': 'sit20cs003@sairamtap.edu.in'},
            //   ]
            // body={
            //     'title':"This is a test meet so ignore",
            //     'start':"2022-09-04T10:00:00-07:00",
            //     'end':"2022-09-04T17:00:00-07:00",
            //     'attendees': attendees

            // }
          //createMeet(calendar,body)
          //updateMeet(calendar,'')