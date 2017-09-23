var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  facebookId:{ type: String,unique: true },
  currentNode:Number,
  user_name: String,
  baby_name:String,
  baby_age:String
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);
//connect with database
mongoose.connect('mongodb://localhost:27017/facebookBot');
// make this available to our users in our Node applications
module.exports = User;