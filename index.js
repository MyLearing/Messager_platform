'use strict';

require('dotenv').config()

const 
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express().use(bodyParser.json());

    app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));


const config = require('./config.js');
const request = require('request');


app.post('/webhook', (req, res) => {
    let body = req.body;

    if(body.object === 'page') {
        body.entry.forEach(function(entry) {
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            let sender_psid = webhook_event.sender.id
            console.log('Sender PSID:' +sender_psid);

            if(webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message)
            } else if(webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
})


app.get('/webhook', (req, res) => {
    

    const  VERIFY_TOKEN = "xxx"

    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
})



function handleMessage (sender_psid, received_message) {
    console.log("xxx");
    let response;

    if (received_message.text) {

        response = {
                "text": `You sent the message: "${received_message.text}" Now send me an image!`
        }
    }

    callSendAPI(sender_psid, response);
}

function callSendAPI (sender_psid, response) {
    let request_body = {
        "recipient" : {
            "id": sender_psid
        },
        "message": response
    }
    console.log(config.PAGE_ACCESS_TOKEN);
    
    request({
        "uri" : "https://graph.facebook.com/v2.6/me/messages",
        "qs" : { "access_token": config.PAGE_ACCESS_TOKEN },
        "method" : "POST",
        "json" : request_body
    }, (err, res, body) =>  {
        if (!err) {
            console.log('message sent!');
        } else {
            console.error("Unable to send message:" + err);
        }
    })
}


// https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start