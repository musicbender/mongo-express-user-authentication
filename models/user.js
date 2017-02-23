const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

var UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  favoriteBook: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
});

//authernticate input against database documents
//this is a custom method we will call 'authenticate' that takes the user/password and a callback
// statics objects lets us add that method to the model so we can use it on other pages when we require the model
//this call back, when we make it, will either log the user in or give an error
UserSchema.statics.authenticate = function(email, password, callback) {
  User.findOne({ email: email })
    .exec(function (err, user) {
      if (err) {
        return callback(err);
      } else if (!user){
        var error = new Error('User not found');
        error.status = 401;
        return callback(error);
      }
      bcrypt.compare(password, user.password, function(err, result) {
        if (result === true) {
          return callback(null, user);
        } else {
          return callback();
        }
      });
    });
}


//hash password BEFORE saving to database
//this is a mongoose function called a pre-save hook
//takes two arguments
//first, the hook name. In this case 'save' which is a special mongoose keyword
//second, a callback that can take middleware

UserSchema.pre('save', function(next) {
  //this keyword refers to the user data that is to be written to mongo
  var user = this;
  //takes three arguments
    //1. the plain text password from user object
    //2. how many times to run the hash algarythm (the more times the more secure but slower)
    //3. callback after password is hashed
  bcrypt.hash(user.password, 10, function(err, hash) {
    //handle errors and send them through middleware
    if(err) { return next(err); }

    //override the password the user inputed with the hashed one
    user.password = hash;
    //fires the next middle ware int he middleware stack, which in this case mongoose saves data to mongo
    next();
  });
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
