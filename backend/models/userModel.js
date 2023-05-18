var mongoose = require("mongoose");
var bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
var Schema = mongoose.Schema;


var userSchema = new Schema({
  username: String,
  password: String,
  email: String,
  stravaId: String,
});

userSchema.pre("save", function (next) {
  var user = this;

  if (this.isNew) {
    bcrypt.hash(user.password, 10, function (err, hash) {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  } else {
    next();
  }
});

userSchema.statics.authenticate = function (username, password, callback) {
  User.findOne({ username: username }).exec(function (err, user) {
    if (err) {
      return callback(err);
    } else if (!user) {
      var err = new Error("User not found.");
      err.status = 401;
      return callback(err);
    }
    bcrypt.compare(password, user.password, function (err, result) {
      if (result === true) {
        //console.log("correct password");
        const payload = {
          userId: user._id,
          username: user.username
        };
        //console.log(`UserId: ${user._id}`);
        //console.log(`Username: ${user.username}`);
        const secretKey = 'your_secret_key';
        const options = {
          expiresIn: '10s'
        };
        const token = jwt.sign(payload, secretKey, options);
        //console.log(`Token: ${token}`);
        return callback(null, user, token);
      } else {
        return callback();
      }
    });
  });
};

var User = mongoose.model("user", userSchema);
module.exports = User;
