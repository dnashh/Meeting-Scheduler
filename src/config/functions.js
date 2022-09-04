const dayjs = require('dayjs');
const { google } = require('googleapis');
const nanoid = require('nanoid');
const eventSchema = require('../schema/eventSchema');

const oauth2Client = new google.auth.OAuth2(
    "607553710493-p50a8tji9e9chd5avm3eruqi02v4vhp0.apps.googleusercontent.com",
    "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",
    "http://localhost:3000/oauth/callback/"
);

const nextWeek = (repeat) => {
    const offerings = []
    for (var i = 0; i < 7; i++) {
        const timenow = dayjs().add(i, 'day');
        if (repeat.includes(timenow.day())) {
            offerings.push({
                date: timenow.format("YYYY-MM-DD"),
                text: timenow.toString().substring(0, 11)
            });
        }
    }
    console.log(offerings);
    return offerings
}

const addMinutes = (time, mins) => {
    return dayjs(time).add(mins, 'minutes').$d;
}

const deleteMeet = async(data) => {
    oauth2Client.setCredentials({
        refresh_token: data.refreshToken,
    });
    console.log(data)
    const calendar = google.calendar({version: 'v3', auth:oauth2Client});
    calendar.events.delete({
        calendarId: 'primary',
        eventId: data.eventId
    }, (err, _res) => {
        if (err) {
            console.log('The API returned an error: ' + err)
            return
        }
        console.log('Delete event id: ' + err)
    })
}

const createMeet = async (data) => {
    oauth2Client.setCredentials({
        refresh_token: data.refreshToken,
    });
    const id = nanoid()
    var event = {
        "summary": data.title,
        "start": {
            "dateTime": data.start,
            "timeZone": "Asia/Kolkata"
        },
        "end": {
            "dateTime": data.end,
            "timeZone": "Asia/Kolkata"
        },

        "attendees": [
            { "email" : data.scheduled_by }
        ],
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
    const calendar = google.calendar({version: 'v3', auth:oauth2Client});
    calendar.events.insert({
        auth: oauth2Client,
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendNotifications: true,
    }, (err, event) => {
        if (err) { return err }
        eventSchema.create({
            uid: event.data.id,
            created: event.data.created,
            updated: event.data.updated,
            summary: event.data.summary,
            url: event.data.hangoutLink,
            created_by: event.data.creator.email,
            start: new Date(event.data.start.dateTime),
            end: new Date(event.data.end.dateTime),
            scheduled_by: data.scheduled_by,
            scheduler: data.scheduler,
            duration: data.duration
        }); 
    });
}

    module.exports = {
        nextWeek,
        addMinutes,
        createMeet,
        deleteMeet
    }