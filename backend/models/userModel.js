var mongoose = require("mongoose");
var bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
var Schema = mongoose.Schema;
const { makeAccessToken, makeRefreshToken } = require("../config/jwtUtils.js");

var userSchema = new Schema({
  username: String,
  password: String,
  email: String,
  stravaId: String,
  admin: Boolean
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
        const token = makeAccessToken(user._id);
        makeRefreshToken(user._id);
        return callback(null, user, token);
      } else {
        return callback();
      }
    });
  });
};

var User = mongoose.model("user", userSchema);
module.exports = User;
