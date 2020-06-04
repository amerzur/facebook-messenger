/*
 * bot for Jordanier in deutschland page , to ask FAQ questions
 *
 *
 * https://www.facebook.com/pg/jordanier.in.Deutschland
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


function genQuickReply(text, quickReplies) {
  let response = {
    text: text,
    quick_replies: []
  };

  for (let quickReply of quickReplies) {
    response["quick_replies"].push({
      content_type: "text",
      title: quickReply["title"],
      payload: quickReply["payload"]
    });
  }

  return response;
}
function genRating() {
  let response = genQuickReply("شكرا لتواصلك معنا كيف تقيم المحادثة ؟ 😊", [
    {
      title: "\uD83D\uDE00",
      payload: "CSAT_GOOD"
    },
    {
      title: "\uD83D\uDE42",
      payload: "CSAT_AVERAGE"
    },
    {
      title: "💩",
      payload: "CSAT_BAD"
    }
  ]);

  // This is triggered 4 sec
  //response.delay = "4000";

  return response;
}
function thankYou(target) {
  var pattern = [
    "شكرا",
    "ما قصرت",
    "danke",
    "يعطيك العافيه",
    "dankeschöne",
    "thank",
    "تشكرات"
  ];
   var value=0;
  pattern.forEach(function(word) {
    value = value + (target.indexOf(word.toLowerCase())>-1);
  });
  return value > 0;
}
function handleMessage(sender_psid, received_message) {
  if (received_message.text) {
    if (thankYou(received_message.text)) {
      var response = [genRating()];

      callSendAPI(sender_psid, response);
    }
  }
}
// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
  let response = [];

  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === "admin" || payload === "travel-other") {
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
  } else if (payload === "inside") {
    response.push({
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "نوع المساعدة ؟ حرك يمين او شمال ",
              buttons: [
                {
                  type: "postback",
                  title: "Steuererklärung 💵🤑",
                  payload: "inside-tax"
                },
                {
                  type: "postback",
                  title: "التجنيس وتنازل عن الجنسيه 🛂🇩🇪",
                  payload: "inside-Naturalization"
                },
                {
                  type: "postback",
                  title: "تحويل رخصه السواقه 🚕",
                  payload: "inside-drive"
                }
              ]
            },
            {
              title: "نوع المساعدة ؟ حرك يمين او شمال ",
              buttons: [
                {
                  type: "postback",
                  title: "لم الشمل 👨‍👩‍👧",
                  payload: "inside-family"
                },
                {
                  type: "postback",
                  title: "تامين صحي🚑",
                  payload: "inside-insurance"
                },
                {
                  type: "postback",
                  title: " 😡 يغص بالك ولا واحد !",
                  payload: "admin"
                }
              ]
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
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
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
    response.push({
      text:
        "https://www.facebook.com/jordanier.in.Deutschland/posts/2273025006283707 لا تنسي قبل ما تروح استرجاع الضريبه من المطار😁"
    });
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
  } else if (payload == "inside-tax") {
    response.push({
      text:
        "https://www.facebook.com/jordanier.in.Deutschland/posts/2462249834027889  Steuererklärung بالتفصيل"
    });

    response.push({
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text:
            "اذا كنت تبعث فلوس لاهلك دايما نزل الفورم بفيدك Unterhaltserklärung",
          buttons: [
            {
              type: "web_url",
              url:
                "https://www.isar-ev.com/unterhaltserklaerungen.html?file=files%2FPDF%2FUnterhaltsbescheinigungen%2FUnterhaltserkl%C3%A4rung%20arabisch-deutsch.pdf&fbclid=IwAR0wLIZfKCj-x0lcMxZNH2ekD9vc28P1u66CT8KukSWQiFu_Ht1mbctqZHM",
              title: "Download",
              webview_height_ratio: "full"
            }
          ]
        }
      }
    });
    response.push({
      text:
        "طبعا لازم تعبي هاي الاوراق و تختمها من المختار او من البلديه او من المتصرف و خلي ابوك و امك يوقعو عليها .. و الافضل انه تكون الاصليه مش صوره"
    });
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
  } else if (payload == "inside-Naturalization") {
    response.push({
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "موقع بسيط فيه شروط الحصول على الجنسيه الالمانيه",
          buttons: [
            {
              type: "web_url",
              url: "https://handbookgermany.de/ar/rights-laws/citizenship.html",
              title: "handbookgermany",
              webview_height_ratio: "full"
            }
          ]
        }
      }
    });
    response.push({
      text:
        "للاسف حاليا ما في طريقة للاحتفاظ بالجنسيه الاردنيه مثل ما هو موضح في المنشور https://www.facebook.com/jordanier.in.Deutschland/posts/2607692706150267"
    });
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
  } else if (payload == "inside-drive") {
    response.push({
      text:
        "https://www.facebook.com/jordanier.in.Deutschland/posts/2560683830851155 اسئلة السواقه النظري عربي"
    });
    response.push({
      text:
        "https://www.facebook.com/jordanier.in.Deutschland/posts/2355460928040114 للي بدهم يطلعوا رخصة سواقة المانية"
    });
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
  } else if (payload == "inside-family") {
    response.push({
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "إرشادات لم الشمل للزوج/ة المقيم/ة في ألمانيا",
          buttons: [
            {
              type: "web_url",
              url:
                "https://amman.diplo.de/blob/1785346/78d3a4b27d17e138252a7a02adbbd9b5/merkblatt-nachzug-zum-ehegatten-data.pdf",
              title: "amman.diplo.de",
              webview_height_ratio: "full"
            }
          ]
        }
      }
    });
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
  } else if (payload == "inside-insurance") {
    response.push({
      text:
        "https://www.facebook.com/jordanier.in.Deutschland/posts/2585000691752802 افضل تامين صحي حكومي"
    });
    response.push({
      text:
        "https://www.facebook.com/jordanier.in.Deutschland/posts/2275106892742185 ارخص تأمين صحي لطالب ممكن يشترك فيه"
    });
    response.push({
      text:
        "https://www.facebook.com/jordanier.in.Deutschland/posts/2368995006686706 تامين ضد الغير"
    });
    response.push({
      text:
        "https://www.facebook.com/jordanier.in.Deutschland/posts/2365126140406926 تامين الاسنان"
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
function getUserCallback(res) {
  var user_name = res.first_name;
  console.log("user_name:" + user_name);
  var response = [];
  response[0] = {
    attachment: {
      type: "template",
      payload: {
        template_type: "button",
        text: `اهلا وسهلا ${user_name}! ما الذي تود ان تفعله? 🎉`,
        buttons: [
          {
            type: "postback",
            title: "السفر الى المانيا✈️🇩🇪",
            payload: "travel"
          },
          {
            type: "postback",
            title: "مساعده في المانيا🤷🏼‍♂️",
            payload: "inside"
          },
          {
            type: "postback",
            title: "التحدث مع الادمن🧑🏾‍💻",
            payload: "admin"
          }
        ]
      }
    }
  };

  callSendAPI(res.id, response);
}
function sendGetStarted(recipientId) {
  getUserName(recipientId, getUserCallback);
}
function getUserName(psid) {
  var usersPublicProfile = "https://graph.facebook.com/v2.6/" + psid;
  return request(
    {
      url: usersPublicProfile,
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
      method: "GET",
      json: true // parse
    },
    function(error, response, body) {
      if (!error) {
        console.log("inside getUserName " + body.first_name);
        getUserCallback(body);
      } else {
        return "error";
      }
    }
  );
}
