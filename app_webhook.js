require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const util = require('util')
const createMeeting = require('./createMeeting')
const handleAbadonedCall = require('./handleAbandonedCall')

const app = express()
const port = process.env.PORT || 8080

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.status(200)
  res.send(`Webhook Sample Node.js successfully running. Set this URL with the /webhook path as your apps Event notification endpoint URL. https://github.com/zoom/webhook-sample-node.js`)
})

app.post('/emergency', (req, res) => {

  var response
  console.log(util.inspect(req.body, {showHidden: false, depth: null, colors: true}))
  
  const message = `v0:${req.headers['x-zm-request-timestamp']}:${JSON.stringify(req.body)}`
  const hashForVerify = crypto.createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET_TOKEN).update(message).digest('hex')
  const signature = `v0=${hashForVerify}`

  if (req.headers['x-zm-signature'] === signature) {

    if(req.body.event === 'endpoint.url_validation') {
      const hashForValidate = crypto.createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET_TOKEN).update(req.body.payload.plainToken).digest('hex')
      response = {
        message: {
          plainToken: req.body.payload.plainToken,
          encryptedToken: hashForValidate
        },
        status: 200
      }
      console.log(response.message)
      res.status(response.status)
      res.json(response.message)
    } else {
      response = { message: 'Authorized request to Webhook Sample Node.js.', status: 200 }
      console.log(response.message)
      res.status(response.status)
      res.json(response)

      createMeeting()
    }
  } else {
    response = { message: 'Unauthorized request to Webhook Sample Node.js.', status: 401 }
    console.log(response.message)
    res.status(response.status)
    res.json(response)
  }
})

app.listen(port, () => console.log(`Node.js App listening on port ${port}!`))