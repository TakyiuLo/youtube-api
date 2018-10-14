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
  // const url = `https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/youtube&access_type=online&include_granted_scopes=true&state=state_parameter_passthrough_value&redirect_uri=${req.headers.origin + '/oauthcallback'}&response_type=code&client_id=${OAUTH_YOUTUBEX_CLIENT_ID}`
  // send back url for consent
  res.status(200).json({ url })
})

// POST
router.post('/grantAccess', requireToken, (req, res) => {
  // console.log('Code is: ', req.body)
  // req.body.code = req.body && req.body.code.replace('%2', '/')
  // oauth2Client not working
  // const setCredentials = function ({ tokens }) {
  //   oauth2Client.setCredentials(tokens)
  //   // Below is for 'offline' token 
  //   // oauth2Client.on('tokens', (tokens) => {
  //   //   if (tokens.refresh_token) {
  //   //     // store the refresh_token in my database!
  //   //     console.log(tokens.refresh_token)
  //   //   }
  //   //   console.log(tokens.access_token)
  //   // })
  //   console.log('tokens', tokens)
  //   res.status(200).json({ message: 'Access Granted' })
  // }
  // try {
  //   oauth2Client.getToken(req.body.code)
  //     .then((res) => {
  //       oauth2Client.setCredentials(res.tokens)
  //     })
  //     .then(() => res.sendStatus(204))
  //     .catch(() => console.log('Error! ! ! ! !'))
  // } catch (e) {
  //   handle(e, res)
  // }
  // set credentials
  // oauth2Client.getToken(req.body.code)
  //   .then((value) => {
  //     console.log('value', value)

  //     // res.status(200).json({ message: 'Access Granted' })
  //   })
  //   .catch(err => handle(err, res))
  // 
  // const config = {
  //   url: 'https://www.googleapis.com/oauth2/v4/token',
  //   headers: {
  //     'Content-Type': 'application/x-www-form-urlencoded'
  //   },
  //   params: {
  //     code: code,
  //     client_id: OAUTH_YOUTUBEX_CLIENT_ID,
  //     client_secret: OAUTH_CLIENT_SECRET,
  //     redirect_uri: req.headers.origin + '/oauthcallback',
  //     grant_type: 'authorization_code'
  //   }
  // }
  // const config = {
  //   method: 'POST',
  //   url: `https://www.googleapis.com/oauth2/v4/token?
  //   code=${req.body.code}
  //   &client_id=${OAUTH_YOUTUBEX_CLIENT_ID}
  //   &client_secret=${OAUTH_CLIENT_SECRET}
  //   &redirect_uri=${req.headers.origin + '/oauthcallback'}
  //   &grant_type=authorization_code`,
  //   headers: {
  //     'Content-Type': 'application/x-www-form-urlencoded'
  //   }
  // }
  // console.log('console.url', config.url)
  // /** * MAKE SURE TO REPLACE SPACES * **/
  // config.url = config.url.replace(/(\s|\t|\n|\r|\r\n)/g, '')
  console.log('Code is: ', req.body.code)
  // Testing for development or production environemnt
  let basename = ''
  if (req.headers.origin !== 'http://localhost:7165') {
    basename = '/youtube-client'
  }
  const config = {
    method: 'POST',
    url: `https://www.googleapis.com/oauth2/v4/token?code=${req.body.code}&client_id=${OAUTH_YOUTUBEX_CLIENT_ID}&client_secret=${OAUTH_CLIENT_SECRET}&redirect_uri=${req.headers.origin + basename + '?redirect=oauthcallback'}&grant_type=authorization_code`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
  console.log('url', config.url)
  axios.request(config)
    .then((response) => {
      console.log('Token is sent back to user')
      res.status(200).json({ data: response.data })
    })
    .catch(() => res.status(400).json({ message: 'Unable to retreive TOKEN' }))
})

// INDEX
router.post('/playlist', requireToken, (req, res) => {
  Profile.find({owner: req.user._id})
    .then(profiles => {
      // `profiles` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      console.log('profiles[0].channelId: ', profiles[0].channelId)
      console.log('Youtube API Key: ', YOUTUBE_API_KEY)
      console.log('Token received is: ', req.body.token)
      const config = {
        method: 'GET',
        url: `https://www.googleapis.com/youtube/v3/playlists?part=snippet%2CcontentDetails&maxResults=50&mine=true&key=${YOUTUBE_API_KEY}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${req.body.token}`
        }
      }
      // return Promise.all([...profiles.map(profile => {
      //   axios.request(config)
      // })])
      // return fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet%2CcontentDetails&channelId=${profiles[0].channelId}&maxResults=25&key=${YOUTBUBE_API_KEY}`)
      // return fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet%2CcontentDetails&channelId=UC_x5XG1OV2P6uZZ5FSM9Ttw&maxResults=25&key=AIzaSyC538qBiNm3nwyQiHOh_JHXlyNfNVbaXJo`)
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
    .then(response => res.status(201).json({ data: response.data }))
    // if an error occurs, pass it to the handler
    .catch(() => {
      console.log('Fail to retreive playlist: ')
      res.status(400).json({ message: 'Unable to retreive playlist' })
    })
})

module.exports = router
