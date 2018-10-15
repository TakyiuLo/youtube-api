// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// using dotenv for configurations
const dotenv = require('dotenv')
dotenv.config()

// pull in Mongoose model for profiles
const Profile = require('../models/profile')

// using axios for requests
const axios = require('axios')
// using `qs` library
const qs = require('qs')

// we'll use this to intercept any errors that get thrown and send them
// back to the client with the appropriate status code
const handle = require('../../lib/error_handler')

// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `res.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

const { google } = require('googleapis')

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const OAUTH_YOUTUBEX_CLIENT_ID = process.env.OAUTH_YOUTUBEX_CLIENT_ID
const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET
var SCOPES = ['https://www.googleapis.com/auth/youtube']

console.log(process.env.YOUTUBE_API_KEY)
console.log(process.env.OAUTH_YOUTUBEX_CLIENT_ID)

let oauth2Client

// SHOW
// GET /permissionUrl
router.get('/permissionUrl', requireToken, (req, res) => {
  console.log('req', req.headers)

  let basename = ''

  console.log('req.headers.origin: ', req.headers.origin)

  // Testing for development or production environemnt
  if (req.headers.origin !== 'http://localhost:7165') {
    basename = '/youtube-client'
  }

  // let redirectUri = req.headers.origin + basename + '/oauthcallback'
  let redirectUri = req.headers.origin + basename + '?redirect=oauthcallback'
  console.log('redirectUri', redirectUri)
  oauth2Client = new google.auth.OAuth2(
    OAUTH_YOUTUBEX_CLIENT_ID,
    OAUTH_CLIENT_SECRET,
    redirectUri
  )

  const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
    // If you only need one scope you can pass it as a string
    scope: SCOPES
  })
  // send back url for consent
  res.status(200).json({ url })
})

// POST
router.post('/grantAccess', (req, res) => {
  console.log('Code is: ', req.body.code)
  // Testing for development or production environemnt
  let basename = ''
  if (req.headers.origin !== 'http://localhost:7165') {
    basename = '/youtube-client'
  }

  const config = {
    method: 'POST',
    url: 'https://www.googleapis.com/oauth2/v4/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    params: {
      code: req.body.code,
      client_id: OAUTH_YOUTUBEX_CLIENT_ID,
      client_secret: OAUTH_CLIENT_SECRET,
      redirect_uri: req.headers.origin + basename + '?redirect=oauthcallback',
      grant_type: 'authorization_code'
    },
    paramsSerializer: function (params) {
      return qs.stringify(params, { encode: false })
    }
  }
  console.log('url', config.url)
  axios(config)
    .then((response) => {
      console.log('Token is sent back to user')
      res.status(200).json({ token: response.data })
    })
    .catch((err) => {
      // delete err.response['headers']
      // delete err.response['request']
      console.log('err.response', err.response, err.response.data)
      res.status(err.response.status).json({
        message: err.response.data.error_description || err.response.statusText
      })
    })
})

// GET Playlist
router.post('/playlist', requireToken, (req, res) => {
  // didn't use get here because I wanted to pass data to here
  Profile.find({owner: req.user._id})
    .then(profiles => {
      // `profiles` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      console.log('Youtube API Key: ', YOUTUBE_API_KEY)
      console.log('Token received is: ', req.body.token)

      const config = {
        method: 'GET',
        url: 'https://www.googleapis.com/youtube/v3/playlists',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${req.body.token}`
        },
        params: {
          /* Make sure you don't have space between snippet and contentDetails */
          part: 'snippet,contentDetails',
          maxResults: 50,
          mine: true,
          key: YOUTUBE_API_KEY
        },
        paramsSerializer: function (params) {
          return qs.stringify(params, { encode: false })
        }
      }
      return axios.request(config)
    })
    // respond with status 200 and JSON of the profiles
    .then((response) => {
      console.log('response.body', response.data)
      const playlists = response.data.items
      const filteredPlaylists = []
      playlists.map((playlist) => {
        const tmpPlaylistItem = {}
        tmpPlaylistItem.id = playlist.id
        tmpPlaylistItem.title = playlist.snippet.title
        filteredPlaylists.push(tmpPlaylistItem)
      })
      console.log('filteredPlaylists: ', filteredPlaylists)
      response.data.filteredPlaylists = filteredPlaylists
      return response
    })
    .then(response => res.status(201).json({ playlist: response.data }))
    // if an error occurs, pass it to the handler
    .catch((err) => {
      // console.log('Fail to retreive playlist: ', err)
      res.status(err.response.status).json({ message: err.response.statusText })
    })
})

module.exports = router
