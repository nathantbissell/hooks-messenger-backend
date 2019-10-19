const express = require('express')
const cors = require('cors')
const monk = require('monk')
const port = 5000
const rateLimit = require('express-rate-limit')

const app = express()
const db = monk('localhost/twitter', {
  useUnifiedTopology: true
})

const limiter = rateLimit({
  windowMs: 60 * 1000, // 60 seconds
  max: 100 // limit each IP to 100 requests per windowMs
})

const isValid = tweet => {
  return tweet.name && tweet.content
    ? tweet.name.tostring().trim && tweet.content.toString().trim()
    : false
}

const tweets = db.get('tweets')
app.use(cors())
app.use(express.json())
app.use(limiter)

app.get('/', (req, res) => {
  res.json({
    message: 'Successful connection'
  })
})

app.get('/tweets', (req, res) => {
  tweets.find().then(tweets => {
    res.json(tweets)
  })
})

const createTweet = (req, res) => {
  if (isValid) {
    const tweet = {
      name: req.body.name,
      content: req.body.content,
      created: new Date()
    }
    tweets.insert(tweet).then(createdTweet => res.json(createdTweet))
  } else {
    res.status(422)
    res.json({
      message: 'Name and Content Required!'
    })
  }
}

app.post('/tweets', createTweet)

app.listen(port, () => console.log(`Listening on http://localhost:${port}!`))
