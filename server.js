var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()
var FuncB = require('./function');
var User = require('./User');
var mongodb = require('mongodb');
var Promise = require('promise');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/babyhealth';
app.set('port', (process.env.PORT || 3081))
var token = "EAAD37nUm9K0BAPxcZCmcNuXpam7JqPVz3GhNEfiD4MYHfwQ87EX4jOQjc7kFM8IXZBCnYxZBoe87DfE75CZCXb8UN0Nhv05ueK0q2eHUqyNfIU1ouAEoQEOyijaOmm9EXLPZCsRiNwPd8tuZBRiMddz99bFLgnm4mZCRZAv1qNUO1gZDZD"
// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
});

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'VERIFY_TOKEN') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
});

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))

});


app.post('/webhook/', function (req, res) {
    messaging_events = req.body.entry[0].messaging
    console.log(res);
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id;
        console.log("userID id is : " +sender);
        pageId = event.recipient.id;
        
        //console.log(event.message.attachments);
       if(event.message && event.message.attachments)
        {
            if(event.message.attachments[0].type ==='image')
            {
                 var imageUrl = event.message.attachments[0].payload.url;
                 sendImageMessage(sender,imageUrl);
            }
             else  if(event.message.attachments[0].type ==='location')
             {
                   // use to get the location coordinate and the image uploaded of map.     
             }

        }
        if (event.message && event.message.text) {
            text = event.message.text
            User.find({facebookId: sender }, function(err, users) {
              if (err) throw err;
              if(users.length>0){
              var position=users[0].currentNode;
                  //object of all the users
              console.log(position);
               switch(position){
                   case 1:
                   var nameOfUser=text;
                   console.log("Currently User enterd his name:"+nameOfUser);
                   FuncB.updateUserName(sender,nameOfUser);
                   // .then(function(){
                  sendTextMessage(sender,"Now Please Enter Your Baby's Name and wait for Response.");   
                            // });
                   break;
                   case 2:
                   var nameOfBaby=text;
                   console.log("Currently User enterd his Baby's name:"+nameOfBaby);
                   FuncB.updateBabyName(sender,nameOfBaby);
                   // .then(function(){
                sendTextMessage(sender,"It's Going Well!\nNow Please Enter Your Baby's Age and Wait for Response.");   
                       //     });
                   break;
                   case 3:
                   var ageOfBaby=text;
                   console.log("Currently User enterd his Baby's age:"+ageOfBaby);
                   FuncB.updateBabyAge(sender,ageOfBaby);
                   //.then(function(){
            sendTextMessage(sender,"Thanks For Sharing Your Details! \nNow You can ask question to us.Let's Check out this feature..");    
                     //       });
                   break;
                   case 4:
                   var userQuestion=text;
                   sendAnswertoUser(sender,userQuestion);
                break;
                default:
                console.log("Can't able to findout current Postition for this user :(");
                 }
               }
             });
            if(text==='Reset'){
              FuncB.resetUser(sender);
              sendTextMessage(sender,"Your Data Deleted.\nNow Enter Your Name and Plese Wailt for Response.")
             continue
            }
            if(text==='Hi'){
              //FuncB.resetUser(sender);
              sendTextMessage(sender,"Your Data Deleted.\nNow Enter Your Name and Plese Wailt for Response.")
             continue
            }
            if(text=='Register'){
              FuncB.registerUser(sender);
              sendTextMessage(sender,"Register SucccessFully!Now Enter Your Name and Plese Wailt for Response.");
            }
        }
        
        if (event.postback) {
            var postbackData = event.postback.payload;   // need to be changed when original format comes...
            console.log(postbackData);
                switch(postbackData){
                    case 'firstTime':
                    console.log("id of fb user :"+sender);
                        FuncB.registerUser(sender);
                        sendTextMessage(sender,"Hey Folks! Wolcome to my company AddoDoc.\nNow Please Enter Your Name and Wait for Response.");
                        break; 
                  case'reset':
                     FuncB.registerUser(sender);
                     sendTextMessage(sender,"Your Data Deleted.\nNow Enter Your Name and Plese Wait for Response.");
                     break;
                  case'aboutUs':
                      sendAboutusMessage(sender);
                      break;
                  case'askQuestion':
                    User.find({facebookId: sender }, function(err, users) {
                     if (err) throw err;
                    if(users.length>0){
                    var position=users[0].currentNode;
                   if(position<4)
                           {
                            sendTextMessage(sender,"Please Fill details according to previous message.")
                           }
               }
             });
                    }
           // console.log(event);
           // text = JSON.stringify(event.postback)
           // sendTextMessage(userID, "Postback received: "+text.substring(0, 200), token)
            continue
        }
    }
    res.end("200");
})
function sendTextMessage(sender, text) {
    messageData = {
        text:text
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
};
function sendAnswertoUser(Sender,text){
MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established to', url);
    var collection = db.collection('questions');
{
    var search_for_answer =  text;
    collection.find({$text: {$search: search_for_answer }}, {score: {$meta: "textScore"}}).sort({score:{$meta:"textScore"}}).toArray(function (err, result) {
      if (err) {
        console.log(err);
      } else if (result.length>0) {
        var questionFound="Most Relevant Match \n Question: "+result[0].question;
        var answerFound="Answer: "+result[0].answer;
        var fullmessage= questionFound+"\n \n"+answerFound;
        var subFullmessage = fullmessage.substr(0,315);
        var remainMessage=fullmessage.slice(315,615);
        //var ExtraMessage=fullmessage.substr(636,1500);
        function function1() {
              // stuff you want to happen right away
             sendTextMessage(sender,subFullmessage+"..");
             console.log('First message sent.');
             }
          function function2() {
             // all the stuff you want to happen after that pause
          var fullmessage= questionFound+"\n \n"+answerFound;
          var remainMessage=fullmessage.slice(315,615);
          sendTextMessage(sender,remainMessage);
          console.log('Remain message sending..');
         }
         function1();
         setTimeout(function2, 2000); 
        //sendRemainMessage(sender,remainMessage);
       // setTimeout(sendRemainMessage(sender,remainMessage),2000);              
        //console.log('Found:', result[0].answer);
      } else {
        //console.log('No document(s) found with defined "find" criteria!');
        sendTextMessage(sender,"Sorry! I could't Get your Query.  \n Try Again..");
      }
      //Close connection
      db.close();
    });
}
  }
});
};
function sendImageMessage(sender, url) {
    messageData = {
            "attachment":{
                  "type":"image",
                      "payload":{
                        "url": url    
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
};
function sendAboutusMessage(sender) {
    messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Babygogo",
                    "image_url": "https://lh3.googleusercontent.com/vlpSelfmteSscN9VbnN72IvlOMW5-at3qS74gmBWO-t96426ZJQ_olnKCNLnlD_TgmWA=w300",
                    "subtitle":"A must to have app for parents.",
                    "buttons": [
                    {
                        "type": "web_url",
                        "url": "http://babygogo.in/",
                        "title": "About App"
                    }]
                },
                {
                    "title": "Insightful articles for your baby’s health",
                    "subtitle": "right inside the app",
                    "image_url": "http://i0.wp.com/babygogo.in/wp-content/uploads/2016/04/questions-related-to-baby-health.png?w=679",
                    "buttons": [{
                        "type": "web_url",
                        "url": "http://www.addodoc.com/",
                        "title": "About Company"
                    }],
                }
                ]
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
};
function sendRemainMessage(sender, text) {
    messageData = {
        text:text
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
};


