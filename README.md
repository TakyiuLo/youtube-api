# YoutubeX
This is the backend and API repo for project YoutubeX.

# Planning
- check 1 user can crud channel id
- uncheck 2 users can receive their private playlist

# Process
It took me about 3 days to understand OAuth and get back a token. So everytime
I got stuck, I take a break or do a quick research, then I come back to it with a
fresh scent of mind. I guess that's why Google Accounts are quite secure.

# Problem Solving Strategies
The biggest problem I had was with using OAuth. I read Youtube API docs,
Google API docs, watch video tutorials, using Google search, using Stack Overflow,
project issue queue, and it doesn't seem like it's an easy thing to do at all.
But for small step I took, I basically kept testing, trying, and grinding to go through each small problem. And finally, I was able to get a token from OAuth.
It was tedious. But in the end, I manage to have a success with it.

# Technologies used
- Express
- MongoDB
- Mongoose
- Heroku
- Google APIs
- Youtube API

# Wireframe:
[Imgur](https://i.imgur.com/uruqTvm.png)

# User Stories
Version One:
- User are able to do CRUD on `/sign-up`, `/sign-in`, `change-password`, 
`sign-out`
- A signed in user can do CRUD on `profile`
- A signed in user can do request to these hidden routes:
- `/permissionUrl`, `/grantAccess`, `/playlist`

# Document Diagram
[Imgur](https://i.imgur.com/N2bvOte.png)

# Profiles
| Verb   | URI Pattern            | Controller#Action |
|--------|------------------------|-------------------|
Profile
| GET    | `/profiles`            | `profile#index`   |
| POST   | `/profiles`            | `profile#create`  |
| PATCH  | `//profiles/:id'`      | `profile#update`  |
| DELETE | `//profiles/:id'`      | `profile#delete`  |

# Future Planning
Version Two:
- Add OAuth refresh token route
- Add more route for management on the playlist

# References
- [Frontend Github](https://github.com/TakyiuLo/youtube-client)
- [Frontend Deploy Site](https://takyiulo.github.io/youtube-client/)
- [Backend Github](https://github.com/TakyiuLo/youtube-api)
- [Backend Deploy Site](https://sheltered-fortress-64728.herokuapp.com/)
