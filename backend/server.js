const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mockDb = require('./utils/mock-db');
const axios = require('axios')
const sentiment = require('sentiment-analysis');

const Nylas = require('nylas');
const { WebhookTriggers } = require('nylas/lib/models/webhook');
const { Scope } = require('nylas/lib/models/connect');
const { openWebhookTunnel } = require('nylas/lib/services/tunnel');

dotenv.config();

const app = express();

// Enable CORS
app.use(cors());

// The port the express app will run on
const port = 9000;

// Initialize the Nylas SDK using the client credentials
Nylas.config({
  clientId: process.env.NYLAS_CLIENT_ID,
  clientSecret: process.env.NYLAS_CLIENT_SECRET,
  apiServer: process.env.NYLAS_API_SERVER,
});

// Before we start our backend, we should register our frontend
// as a redirect URI to ensure the auth completes
const CLIENT_URI =
  process.env.CLIENT_URI || `http://localhost:${process.env.PORT || 3000}`;
Nylas.application({
  redirectUris: [CLIENT_URI],
}).then((applicationDetails) => {
  console.log(
    'Application registered. Application Details: ',
    JSON.stringify(applicationDetails)
  );
});

// Start the Nylas webhook
openWebhookTunnel({
  // Handle when a new message is created (sent)
  onMessage: function handleEvent(delta) {
    switch (delta.type) {
      case WebhookTriggers.AccountConnected:
        console.log(
          'Webhook trigger received, account connected. Details: ',
          JSON.stringify(delta.objectData, undefined, 2)
        );
        break;
    }
  },
}).then((webhookDetails) => {
  console.log('Webhook tunnel registered. Webhook ID: ' + webhookDetails.id);
});

// '/nylas/generate-auth-url': This route builds the URL for
// authenticating users to your Nylas application via Hosted Authentication
app.post('/nylas/generate-auth-url', express.json(), async (req, res) => {
  const { body } = req;

  const authUrl = Nylas.urlForAuthentication({
    loginHint: body.email_address,
    redirectURI: (CLIENT_URI || '') + body.success_url,
    scopes: [Scope.Calendar],
  });

  return res.send(authUrl);
});

// '/nylas/exchange-mailbox-token': This route exchanges an authorization
// code for an access token
// and sends the details of the authenticated user to the client
app.post('/nylas/exchange-mailbox-token', express.json(), async (req, res) => {
  const body = req.body;

  const { accessToken, emailAddress } = await Nylas.exchangeCodeForToken(
    body.token
  );

  // Normally store the access token in the DB
  console.log('Access Token was generated for: ' + emailAddress);

  // Replace this mock code with your actual database operations
  const user = await mockDb.createOrUpdateUser(emailAddress, {
    accessToken,
    emailAddress,
  });

  // Return an authorization object to the user
  return res.json({
    id: user.id,
    emailAddress: user.emailAddress,
    accessToken: user.accessToken, // This is only for demo purposes - do not send access tokens to the client in production
  });
});

// get calendar events
app.get('/nylas/get-calendar-events/:token', express.json(), async (req, res) => {
  const token = req.params.token;
  const response = await axios.get("https://api.nylas.com/events", { headers: { authorization: `Bearer ${token}` } })
  let array = response.data
  let newArray = array.filter(function (el) {
    return el.when.start_time!=null 
})

console.log(newArray)

  return res.send({data: newArray, code: 200});
});


// get calendar events
app.post("/nylas/sort-events", express.json(), async (req, res) => {
  const body = req.body;
  const choices = {
    low: [
      "Coffee meet with Jim",
      "Daily Standup meet",
      "Going to grocery store",
      "Long drive to nevada",
      "watching favourite TV show on TV",
      "meeting regarding bug fixes",
    ],
    high: [
      "Business plan discussion with Alex",
      "Production release meet",
      "Going for daughter's school admission",
      "University internship report submission",
      "going to favourite artist's music concert",
      "Professional photoshoot for business magazine",
    ],
  };

  const highPriorityTasks = choices.high;
  const lowPriorityTasks = choices.low;

  highPriorityTasks.forEach((el) => {
    manager.addDocument("en", el, "high");
  });

  lowPriorityTasks.forEach((el) => {
    manager.addDocument("en", el, "low");
  });

  await manager.train();
  manager.save();
  const response1 = await manager.process("en", "Play mobile game");
  const response2 = await manager.process("en", "study for an hour");
  console.log(response1.classifications, response2.classifications);

  return res.send({ data: "newArray", code: 200 });
});

// Start listening on port 9000
app.listen(port, () => console.log("App listening on port " + port));
