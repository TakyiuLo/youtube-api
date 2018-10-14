#!/bin/sh

API="https://www.googleapis.com/oauth2/v4/token?"

REDIRECT_URI="&redirect_uri=http://localhost:7165/?redirect=oauthcallback"
GRANT_TYPE="&grant_type=authorization_code"

curl "${API}${CODE}${CLIENT_ID}${CLIENT_SECRET}${REDIRECT_URI}${GRANT_TYPE}" \
  --include \
  --request POST \
  --header "Content-Type: application/x-www-form-urlencoded"

echo
