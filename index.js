var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var http = require('http')
var app = express()

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
	 var messaging_events = req.body.entry[0].messaging
	for (var i = 0; i < messaging_events.length; i++) {
		var event = req.body.entry[0].messaging[i]
		var sender = event.sender.id
		if (event.message && event.message.text) {
			var text = event.message.text
			if (text === 'Generic') {
				sendGenericMessage(sender)
				continue
			}
			sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
		}
		if (event.postback) {
			var text = JSON.stringify(event.postback)
			sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
			continue
		}
	}
	res.sendStatus(200)
})


// recommended to inject access tokens as environmental variables, e.g.
// var token = process.env.PAGE_ACCESS_TOKEN
var token = "EAAFCmaQoR2IBACjahU8XZC0epp0fv5RFGZBZAZBXQhdO8CweUmZANPmYTpaUJBRr7RAqe68e8iEAGUjlrTc4v7ZBhQSprZAueEZC6fIJ8ZAG0P7pOZB45iP6Esydi515L42TVpegIWHiCEBIUmTTzjSZAkKSQlH61vZA6CL7MOTJKh0dZCgZDZD"

function sendTextMessage(sender, text) {
	var messageData = { text:text }
	
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
		method: 'GET',
	}, function(error, response, body) {
	   	var messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": [{
					"title": "First card",
					"subtitle": "Element #1 of an hscroll",
					"image_url": "http://messengerdemo.parseapp.com/img/rift.png",
					"buttons": [{
						"type": "web_url",
						"url": "https://www.messenger.com",
						"title": "web url"
					}, {
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for first element in a generic bubble",
					}],
				}, {
					"title": "Second card",
					"subtitle": "Element #2 of an hscroll",
					"image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
					"buttons": [{
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for second element in a generic bubble",
					}],
				}]
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
http.createServer(app).listen(app.get('port'), function(){
 console.log("Express server listening on port " + app.get('port'));
});
