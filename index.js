'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

// index
app.get('/', function (req, res) {
	res.send('hello world i am a secret bot')
})

// for facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
})

// to post data
app.post('/webhook/', function (req, res) {
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
			let text = event.message.text
			if (text === 'Generic') {
				sendGenericMessage(sender)
				continue
			}
			sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
		}
		if (event.postback) {
			let text = JSON.stringify(event.postback)
			sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
			continue
		}
	}
	res.sendStatus(200)
})


// recommended to inject access tokens as environmental variables, e.g.
// const token = process.env.PAGE_ACCESS_TOKEN
const token = "EAAFCmaQoR2IBACjahU8XZC0epp0fv5RFGZBZAZBXQhdO8CweUmZANPmYTpaUJBRr7RAqe68e8iEAGUjlrTc4v7ZBhQSprZAueEZC6fIJ8ZAG0P7pOZB45iP6Esydi515L42TVpegIWHiCEBIUmTTzjSZAkKSQlH61vZA6CL7MOTJKh0dZCgZDZD"

function sendTextMessage(sender, text) {
	let messageData = { text:text }
	
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

function sendGenericMessage(sender) {
	request({
		url: 'http://fishry-beta.azure-mobile.net/api/collection_request?store_id=619708C1-32D9-45CC-A9D7-51E23D5EB4FA',
		method: 'POST',
	}, function(error, response, body) {
		if(typeof(body) != 'object'){
			var datas = JSON.parse(body);
		}else{
			var datas = body;
		}
		var collections  = [];
		for(var dts in data){
			collections.push({
							"title": data[dts].collectionName,
							"subtitle": data[dts].collectionName,
							"image_url": "http://messengerdemo.parseapp.com/img/rift.png",
							"buttons": [{
								"type": "web_url",
								"url": "https://www.messenger.com",
								"title": data[dts].collectionName
							}, {
								"type": "postback",
								"title": "Postback",
								"payload": data[dts].collectionName,
							}],
						});
		}
				let messageData = {
				"attachment": {
					"type": "template",
					"payload": {
						"template_type": "generic",
						"elements": [collections]
					}
				}
			}
			request({
				url: 'https://graph.facebook.com/v2.6/me/messages',
				qs: {access_token:token},
				method: 'POST',
				json: {
					recipient: {id:sender},
					message: messageData,
				}
			}, function(error, response, body) {
				if (error) {
					console.log('Error sending messages: ', error)
				} else if (response.body.error) {
					console.log('Error: ', response.body.error)
				}
			})
	})
	
}

// spin spin sugar
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})
