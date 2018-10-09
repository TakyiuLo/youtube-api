// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for profiles
const Profile = require('../models/profile')

// using dotenv for configurations
const dotenv = require('dotenv')
dotenv.config()

// we'll use this to intercept any errors that get thrown and send them
// back to the client with the appropriate status code
const handle = require('../../lib/error_handler')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404

// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `res.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

console.log(process.env.YOUTBUBE_API_KEY)
console.log(process.env.OAUTH_YOUTUBEX_CLIENT_ID)
const youtubeAPIkey = 'AIzaSyCSF8SnzxmLgor11z8dtzaPLmXt1l5WX-k'
const oauthYoutubeXClientId = '764661359543-n2qabfr1fail5ug7r3n5jsje47s4o51b.apps.googleusercontent.com'
const oauthClientSecret = '3fVBJ5Sr_Rfe9xN4-t9jNsi2'
const userId = 'RheFIY3RUxYiJXlwyklbZQ'
const channelId = 'UCRheFIY3RUxYiJXlwyklbZQ'
const scopes = 'https://www.googleapis.com/auth/youtube.readonly'

// SHOW
// GET /profiles/5a7db6c74d55bc51bdf39793
router.get('/channels/:id', requireToken, (req, res) => {
  // req.params.id will be set based on the `:id` in the route
  Profile.findById(req.params.id)
    .then(handle404)
    .then((profile) => {
      const channelId = profile.channelId
      const YOUTBUBE_API_KEY = process.env.YOUTBUBE_API_KEY
      const OAUTH_YOUTUBEX_CLIENT_ID = process.env.OAUTH_YOUTUBEX_CLIENT_ID

      

      return profile
    })
    // if `findById` is succesful, respond with 200 and "profile" JSON
    .then(profile => res.status(200).json({ messsage: 'Get playlist successful' }))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

module.exports = router
