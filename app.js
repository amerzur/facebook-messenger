/*
 * Starter Project for Messenger Platform Quick Start Tutorial
 *
 * Remix this as the starting point for following the Messenger Platform
 * quick start tutorial.
 *
 * https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start/
 *
 */

"use strict";

// Imports dependencies and set up http server
const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  app = express().use(body_parser.json()), // creates express http server
  PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));
getStarted();
// Accepts POST requests at /webhook endpoint
app.post("/webhook", (req, res) => {
  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === "page") {
    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {
      // Get the webhook event. entry.messaging is an array, but
      // will only ever contain one event, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log("Sender PSID: " + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    });

    // Return a '200 OK' response to all events
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Accepts GET requests at the /webhook endpoint
app.get("/webhook", (req, res) => {
  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = "amer";
  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

// Handles messages events
function handleMessage(sender_psid, received_message) {
  let response = [];

  // Check if the message contains text
  if (received_message.text) {
    // Create the payload for a basic text message
    response[0] = {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: " اهلا وسهلا بك ما الذي تود ان تفعله? 🎉",
          buttons: [
            {
              type: "postback",
              title: "السفر الى المانيا🇩🇪",
              payload: "travel"
            },
            {
              type: "postback",
              title: "التحدث مع الادمن🦸🏼‍♂️!",
              payload: "yes"
            }
          ]
        }
      }
    };
  }

  // Sends the response message
  callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
  let response = [];

  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === "yes" || payload === "travel-other") {
    response.push({ text: "شكرا سيكون الادمن معك خلال لحظات!" });
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
  } else if (payload === "travel") {
    response.push({
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: " الغرض من السفر ?",
          buttons: [
            {
              type: "postback",
              title: "الدراسه بكالوريوس وماجستير",
              payload: "travel-study"
            },
            {
              type: "postback",
              title: "الزياره اوالسياحه",
              payload: "travel-visit"
            },
            {
              type: "postback",
              title: "العمل او بحث عن عمل",
              payload: "travel-work"
            }
          ]
        }
      }
    });
     // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
  } else if (payload == "travel-study") {
    response.push({
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "موقع مفيد للمنح الجامعية ",
          buttons: [
            {
              type: "web_url",
              url: "https://www.daad.de/en/",
              title: "daad.de",
              webview_height_ratio: "full"
            }
          ]
        }
      }
    });
    response.push({
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "وهذا موقع في تقيمات طلاب",
          buttons: [
            {
              type: "web_url",
              url: "https://www.studycheck.de/",
              title: "studycheck.de",
              webview_height_ratio: "full"
            }
          ]
        }
      }
    });
    response.push({
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text:
            "وهذا موقع في نسبة نجاح طلاب في كل تخصص في كل جامعة وتقيمات طلاب وعدد طلاب في تخصص ومعلومات كثير ممكن ساعدك باختيار جامعة",
          buttons: [
            {
              type: "web_url",
              url: "https://ranking.zeit.de/che/en/",
              title: "ranking.zeit.de",
              webview_height_ratio: "full"
            }
          ]
        }
      }
    });
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
  } else if (payload == "travel-work") {
    response.push({
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "شروط الفيزا الطويله في هذا الرابط",
          buttons: [
            {
              type: "web_url",
              url:
                "https://amman.diplo.de/jo-ar/service/05-VisaEinreise/-/1350904",
              title: "amman.diplo.de",
              webview_height_ratio: "full"
            }
          ]
        }
      }
    });

    response.push({
      text:
        "https://www.facebook.com/jordanier.in.Deutschland/posts/2289200004666207 اشهر مواقع التوظيف تجدها في هذا المنشور"
    });
    response.push({
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "مزيد من المعلومات ؟ يمكنك الاتصال على السفاره الالمانيه",
          buttons: [
            {
              type: "phone_number",
              title: "Call embassy",
              payload: "+96265901170"
            }
          ]
        }
      }
    });
  } else if (payload == "travel-visit") {
    response.push({
      text:
        "https://visa.vfsglobal.com/jor/en/deu/apply-visa vfs global فيزا سياحه من خلال"
    });
    response.push({
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "مزيد من المعلومات ؟ يمكنك الاتصال على المكتب",
          buttons: [
            {
              type: "phone_number",
              title: "Call VFS",
              payload: "+96264003777"
            }
          ]
        }
      }
    });
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
  } else if (payload == "start") {
    sendGetStarted(sender_psid);
  }
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, responses) {
  // Construct the message body
  for (var i = 0, len = responses.length; i < len; i++) {
    var response = responses[i];
    let request_body = {
      recipient: {
        id: sender_psid
      },
      message: response
    };
    // Send the HTTP request to the Messenger Platform
    request(
      {
        uri: "https://graph.facebook.com/v2.6/me/messages",
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: "POST",
        json: request_body
      },
      (err, res, body) => {
        if (!err) {
          console.log("message sent!");
        } else {
          console.error("Unable to send message:" + err);
        }
      }
    );
  }
}
// Sends response messages via the Send API

function getStarted() {
  // Construct the message body

  let request_body = {
    payload: "start"
  };
  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v2.6/me/messenger_profile",
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
      method: "POST",
      json: request_body
    },
    (err, res, body) => {
      if (!err) {
        console.log("message sent!");
      } else {
        console.error("Unable to send message:" + err);
      }
    }
  );
}
function sendGetStarted(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text:
            "Welcome to the Bot Hotel, I can help with any of the three requests below.",
          buttons: [
            {
              type: "postback",
              title: "Check in",
              payload: "check_in"
            },
            {
              type: "postback",
              title: "Room Service",
              payload: "room_service"
            },
            {
              type: "phone_number",
              title: "Call Reception",
              payload: "+16505551234"
            }
          ]
        }
      }
    }
  };
  callSendAPI(messageData);
}
