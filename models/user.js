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

  bcrypt.hash(user.password, 10, function(err, hash) {
    if(err) { return next(err); }

    //override the password the user inputed with the hashed one
    user.password = hash;
    //fires the next middle ware int he middleware stack, which in this case mongoose saves data to mongo
    next();
  });
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
