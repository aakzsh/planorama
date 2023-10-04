const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mockDb = require("./utils/mock-db");
const axios = require("axios");
const sentiment = require("sentiment-analysis");

const Nylas = require("nylas");
const { WebhookTriggers } = require("nylas/lib/models/webhook");
const { Scope } = require("nylas/lib/models/connect");
const { openWebhookTunnel } = require("nylas/lib/services/tunnel");
const { NlpManager } = require("node-nlp");

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
    "Application registered. Application Details: ",
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
          "Webhook trigger received, account connected. Details: ",
          JSON.stringify(delta.objectData, undefined, 2)
        );
        break;
    }
  },
}).then((webhookDetails) => {
  console.log("Webhook tunnel registered. Webhook ID: " + webhookDetails.id);
});

// '/nylas/generate-auth-url': This route builds the URL for
// authenticating users to your Nylas application via Hosted Authentication
app.post("/nylas/generate-auth-url", express.json(), async (req, res) => {
  const { body } = req;
  const authUrl = Nylas.urlForAuthentication({
    loginHint: body.email_address,
    redirectURI: (CLIENT_URI || "") + body.success_url,
    scopes: [Scope.Calendar],
  });
  return res.send(authUrl);
});

// '/nylas/exchange-mailbox-token': This route exchanges an authorization
// code for an access token
// and sends the details of the authenticated user to the client
app.post("/nylas/exchange-mailbox-token", express.json(), async (req, res) => {
  const body = req.body;
  const { accessToken, emailAddress } = await Nylas.exchangeCodeForToken(
    body.token
  );
  // Normally store the access token in the DB
  console.log("Access Token was generated for: " + emailAddress);
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
app.get(
  "/nylas/get-calendar-events/:token",
  express.json(),
  async (req, res) => {
    const token = req.params.token;
    const response = await axios.get("https://api.nylas.com/events", {
      headers: { authorization: `Bearer ${token}` },
    });
    let array = response.data;
    let newArray = array.filter(function (el) {
      return el.when.start_time != null;
    });
    return res.send({ data: newArray, code: 200 });
  }
);

// add new event in calendar
app.post("/nylas/add-event/", express.json(), async (req, res) => {
  const body = req.body;
  const token = body.token;
  const newReqBody = {
    title: body.title,
    calendar_id: body.calendar_id,
    when: {
      start_time: body.when.start_time,
      end_time: body.when.end_time,
    },
    participants: [],
  };
  const cal_res = await axios.post(
    "https://api.nylas.com/calendars",
    { name: "new cal", desc: "new desc" },
    { headers: { authorization: `Bearer ${token}` } }
  );
  const cal_id = cal_res.data.id;
  newReqBody.calendar_id = cal_id;
  const response = await axios.post(
    "https://api.nylas.com/events",
    newReqBody,
    { headers: { authorization: `Bearer ${token}` } }
  );
  let responsedata = response.data;
  console.log(responsedata);
  return res.send({ data: responsedata, code: 200 });
});

// bubble sort for sorting conflicting events in ascending order of priority
function bubbleSort(array) {
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      if (array[j].score > array[j + 1].score) {
        [array[j].score, array[j + 1].score] = [
          array[j + 1].score,
          array[j].score,
        ];
        [array[j].event, array[j + 1].event] = [
          array[j + 1].event,
          array[j].event,
        ];
      }
    }
  }
  let new_arr = [];
  for (let i = 0; i < array.length; i++) {
    new_arr.push(array[i].event);
  }
  return new_arr;
}

// app route for sorting events
app.post("/nylas/sort-events", express.json(), async (req, res) => {
  const manager = new NlpManager({ languages: ["en"], forceNER: true });
  const body = req.body;
  const events = body.events;
  const low = body.low;
  const high = body.high;
  const highPriorityTasks = high;
  const lowPriorityTasks = low;
  highPriorityTasks.forEach((el) => {
    manager.addDocument("en", el, "high");
  });
  lowPriorityTasks.forEach((el) => {
    manager.addDocument("en", el, "low");
  });
  await manager.train();
  manager.save();
  let new_arr = [];
  for (let i = 0; i < events.length; i++) {
    let resp = await manager.process("en", events[i].title);
    let scores = resp.classifications;
    let s = 0;
    for (let x = 0; x < scores.length; x++) {
      if (scores[x].intent === "high") {
        s += Number(scores[x].score);
      } else {
        s -= Number(scores[x].score);
      }
    }
    new_arr.push({ event: events[i], score: s });
  }
  const final_sorted = bubbleSort(new_arr);
  return res.send({ data: final_sorted, code: 200 });
});

// delete bulk events with IDs
app.post("/nylas/delete-events", express.json(), async (req, res) => {
  const events = req.body.events;
  const token = req.body.token;
  for (let i = 0; i < events.length; i++) {
    for (let j = 0; j < events[i].length; j++) {
      const resp = await axios.delete(
        "https://api.nylas.com/events/" + events[i][j].id,

        { headers: { authorization: `Bearer ${token}` } }
      );
    }
  }
  return res.send({ data: "deleted", code: 200 });
});

// send email
app.post("/nylas/send-emails", express.json(), async (req, res) => {
  // in progress
  return res.send({ data: "final_sorted", code: 200 });
});

// Start listening on port 9000
app.listen(port, () => console.log("App listening on port " + port));
