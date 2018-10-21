// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
// const passport = require('passport')

// using dotenv for configurations
const dotenv = require('dotenv')
dotenv.config()

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
// const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

// GET /search
router.get('/search', (req, res) => {
  console.log('Search request query: ', req.query)
  const config = {
    method: 'GET',
    url: 'https://www.googleapis.com/youtube/v3/search',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    params: {
      /* Make sure you don't have space between snippet and contentDetails */
      part: 'snippet',
      safeSearch: 'none',
      maxResults: 12,
      q: req.query.q.replace(' ', '+'),
      type: 'video',
      key: YOUTUBE_API_KEY
    },
    paramsSerializer: function (params) {
      return qs.stringify(params, { encode: true })
    }
  }

  axios(config)
    .then(response => {
      console.log(response.data)
      res.status(200).json({ result: response.data })
    })
    .catch((err) => {
      console.log(err)
      res.status(400).json({ message: 'fail to search' })
    })
})

module.exports = router
