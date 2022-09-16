# Meeting Scheduler v0.1.0

a simple meeting scheduler that generates a link for anyone to schedule a meet in your calendar.

---

## Third Party Providers

Here is an overview of the required third party integrations to make this project work in your local environment.

- [Auth0](https://auth0.com) - for Authentication inside the App.
- [Google Calendar API - OAuth 2.0](https://developers.google.com/calendar/api/guides/overview) - for Integration with Calendar in scheduling meetings.

## Getting Started

Create a ```.env``` file for the following variables.

- MONGODB_URL
- **Auth0 API Variables**
  - BASEURL
  - AUTH_SECRET
  - AUTH_CLIENT_ID
  - ISSUER_BASE_URL
- **Google Calendar API Variables**
  - OAUTH_TOKEN
  - OAUTH_SECRET
  - OAUTH_REDIRECT

To Run the project locally, first install the dependencies by

```bash
npm install
```

and then to start the project

```bash
npm start
```

To run in development mode with Auto Reload by Nodemon on save

```bash
npm run dev
```

Now the project is running locally at [http://localhost:9000](http://localhost:9000)

You can change the Port by adding an env variable **PORT** and setting the required port of your choice.

## Development Notes

### Pages and Functions

#### Page 1 - Landing Page

Objectives:

1. To show a cta button to Schedule meetings.
2. Features a Big Statement about Product and one Button that redirects users to their profile and meeting creation page.
3. Intermediate - Google OAuth for Admin and User.
4. No differentiation of Admin and User implicitly exists.

#### Page 2 - Profile Page

Objectives:

1. Displays the User Info. with Image Icon
2. Admin needs to have a username that is unique. (For Meetings with Public Access)
3. Admin can create a unique link for people to meet with him.
    - Charecters of Scheduler Links:
        1. Links can be Expired - Admin can do it manually and create a new link.
        2. Only one link can be active for a Admin at a particular time. 
4. Past and Upcoming events of users need to be displayed under his profile.
5. Admin can add time slots that he might be available

#### Page 3 - Schedule a Meeting with this.person

Objectives:

1. Ask basic details of the person who wants to organize - Name, Email, Organisation
2. Ask the Objective of the meeting - description.
3. Add members to the meeting -their emails. Meeting Admin is the Person who initiates the meeting, not the Admin. Though it can be changed.
