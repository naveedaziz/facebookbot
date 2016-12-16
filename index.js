var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var http = require('http')
var app = express()
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(':memory:');
 
db.serialize(function() {
  db.run("CREATE TABLE users (sender TEXT,recipient TEXT,cart TEXT,product_selected TEXT,store_id TEXT,dated TEXT)");
 
  var stmt = db.run("INSERT INTO users (sender, recipient, cart) VALUES ('1', '2', '3')");
 
  db.each("SELECT rowid AS id, sender FROM users", function(err, row) {
      console.log(row.id + ": " + row.sender);
  });
});
 
db.close();

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
		console.log(event)
		db.each("SELECT rowid AS id, sender FROM users", function(err, row) {
		  console.log(row.id + ": " + row.sender);
	  });
		if (event.postback) {
			var urlMaps  = event.postback;
			var text = JSON.stringify(event.postback);			
			var collectionUrl = urlMaps.payload.split(':');
			console.log('=========Nidodba==========');
			console.log(collectionUrl);
			if(collectionUrl[0] == 'product'){
				sendGenericMessageProductDetail(sender,collectionUrl[1])
				continue
			}else if(collectionUrl[0] == 'collection'){
				sendGenericMessageProduct(sender,collectionUrl[1])
				continue
			}
			
		}
		if (event.postback) {
			var urlMaps  = event.postback;
			var text = JSON.stringify(event.postback);			
			var collectionUrl = urlMaps.payload.split(':');
			console.log('=========Nidodba==========');
			console.log(collectionUrl);
			if(collectionUrl[0] == 'product'){
				sendGenericMessageProductDetail(sender,collectionUrl[1])
				continue
			}else if(collectionUrl[0] == 'collection'){
				sendGenericMessageProduct(sender,collectionUrl[1])
				continue
			}
			
		}
		if (event.message && event.message.text) {
			var text = event.message.text
			if (text === 'Generic') {
				sendGenericMessage(sender)
				continue
			}
			sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
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
		url: 'https://fishry-beta.azure-mobile.net/api/collection_request?store_id=619708C1-32D9-45CC-A9D7-51E23D5EB4FA',
		method: 'GET'
	}, function(error, response, body) {
		if(body){
			if(typeof(body) != 'object'){
				body = JSON.parse(body);
			}
			var cols = [];
			for(var bd in body){
					if(body[bd] && body[bd].collectionName){
						cols.push({
										"title": body[bd].collectionName,
										"subtitle": body[bd].collectionName,
										"image_url": "http://messengerdemo.parseapp.com/img/rift.png",
										"buttons": [{
											"type": "postback",
											"title": body[bd].collectionName,
											"payload": "collection:"+body[bd].id,
										}],
									});
					}
			}
			var messageData = {
						"attachment": {
							"type": "template",
							"payload": {
								"template_type": "generic",
								"elements": cols
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
		}
						
	})
	
}
function sendGenericMessageProduct(sender,ids) {
	
	
	var requested = {};
		requested.collection_id = [ids];
		requested.storeID = '619708C1-32D9-45CC-A9D7-51E23D5EB4FA';
	console.log(requested);
	request({
		url: 'https://fishry-beta.azure-mobile.net/api/collection_request',
		method: 'POST',
		form: requested,
	}, function(error, response, body) {
		if(body){
			if(typeof(body) != 'object'){
				body = JSON.parse(body);
			}
			var cols = [];
			for(var bd in body){
					if(body[bd] && body[bd].productName){
						if(body[bd].productImage){
							if(typeof(body[bd].productImage) != 'object'){
								body[bd].productImage = JSON.parse(body[bd].productImage);
							}
						}
						cols.push({
										"title": body[bd].productName,
										"subtitle": "PKR: "+body[bd].productPrice,
										"image_url": "https://az866755.vo.msecnd.net/product/"+body[bd].productImage[0].Image,
										"buttons": [{
											"type": "postback",
											"title": body[bd].productName,
											"payload": "product:"+body[bd].productUrl
										}],
									});
					}
			}
			
			var messageData = {
						"attachment": {
							"type": "template",
							"payload": {
								"template_type": "generic",
								"elements": cols
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
		}
						
	})
	
}
function sendGenericMessageProductDetail(sender,ids) {
	var requested = {};
		requested.product_url = ids;
		requested.storeID = '619708C1-32D9-45CC-A9D7-51E23D5EB4FA';
	console.log(requested);
	request({
		url: 'https://fishry-beta.azure-mobile.net/api/collection_request',
		method: 'POST',
		form: requested,
	}, function(error, response, body) {
		if(body){
			if(typeof(body) != 'object'){
				body = JSON.parse(body);
			}
			var cols = [];
			/*for(var bd in body){
					if(body[bd] && body[bd].productName){
						if(body[bd].productImage){
							if(typeof(body[bd].productImage) != 'object'){
								body[bd].productImage = JSON.parse(body[bd].productImage);
							}
						}
						cols.push({
										"title": body[bd].productName,
										"subtitle": "PKR: "+body[bd].productPrice,
										"image_url": "https://az866755.vo.msecnd.net/product/"+body[bd].productImage[0].Image,
										"buttons": [{
											"type": "postback",
											"title": body[bd].productName,
											"payload": "product:"+body[bd].id
										}],
									});
					}
			}*/
			
			var messageData = {
								"text":"Pick a color:",
								"quick_replies":[
								  {
									"content_type":"text",
									"title":"Red",
									"payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED"
								  },
								  {
									"content_type":"text",
									"title":"Green",
									"payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
								  }
								]
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
		}
						
	})
	
}

// spin spin sugar
http.createServer(app).listen(app.get('port'), function(){
 console.log("Express server listening on port " + app.get('port'));
});
