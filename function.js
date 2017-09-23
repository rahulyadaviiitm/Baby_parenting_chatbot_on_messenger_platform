var User = require('./User');
module.exports = {
  registerUser: function (sender) {
  	User.find({ facebookId: sender }, function(err, user) {
     if (err) throw err;
     if(user.length==0){
      var newUser = User({
	  facebookId: sender,
	  currentNode: 1
	});
      //save the user
	newUser.save(function(err) {
	  if (err) throw err;
       console.log('First time User resigered!');
	});
}
else if(user.length>0){
user[0].currentNode=1;
user[0].save(function(err) {
      if (err) throw err;
  });
}
	});
  },
  updateUserName: function (sender,userName) {
	 User.find({ facebookId: sender }, function(err, user) {
     if (err) throw err;
      user[0].user_name = userName;
      user[0].currentNode=2;

  // save the user
     user[0].save(function(err) {
      if (err) throw err;
     console.log('User successfully updated user Name!');
  });
  // object of the user
   console.log(user);
       });
  },
  updateBabyName: function (sender,babyName) {
	 User.find({ facebookId: sender }, function(err, user) {
     if (err) throw err;
      user[0].baby_name = babyName;
      user[0].currentNode=3;

  // save the user
     user[0].save(function(err) {
      if (err) throw err;
     console.log('User successfully updated his Baby Name!');
  });
  // object of the user
   console.log(user);
       });
  },
  updateBabyAge: function (sender,babyAge) {
	 User.find({ facebookId: sender }, function(err, user) {
     if (err) throw err;
      user[0].baby_age = babyAge;
      user[0].currentNode=4;

  // save the user
     user[0].save(function(err) {
      if (err) throw err;
     console.log('User successfully updated baby Age!');
  });
  // object of the user
   console.log(user);
       });
  },
  resetUser: function (sender) {
	 User.find({ facebookId: sender }, function(err, user) {
     if (err) throw err;
     if(user.length>0){

      user[0].currentNode=1;

  // save the user
     user[0].save(function(err) {
      if (err) throw err;
     console.log('User successfully Reset!');
  });
 }
       });
  }
};