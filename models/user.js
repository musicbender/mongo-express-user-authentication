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

//hash password BEFORE saving to database
//this is a mongoose function called a pre-save hook
//takes two arguments
//first, the hook name. In this case 'save' which is a special mongoose keyword
//second, a callback that can take middleware

UserSchema.pre('save', function(next) {
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
