var UserModel = require("../models/userModel.js");
var RunModel = require("../models/runModel.js");

module.exports = {
  list: function (req, res) {
    UserModel.find(function (err, users) {
      if (err) {
        return res.status(500).json({
          message: "Error when getting user.",
          error: err,
        });
      }

      return res.json(users);
    });
  },

  show: function (req, res) {
    var id = req.params.id;

    UserModel.findOne({ _id: id }, function (err, user) {
      if (err) {
        return res.status(500).json({
          message: "Error when getting user.",
          error: err,
        });
      }

      if (!user) {
        return res.status(404).json({
          message: "No such user",
        });
      }

      return res.json(user);
    });
  },

  create: function (req, res) {
    var user = new UserModel({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
    });

    user.save(function (err, user) {
      if (err) {
        return res.status(500).json({
          message: "Error when creating user",
          error: err,
        });
      }

      return res.status(201).json(user);
      //return res.redirect('/users/login');
    });
  },

  update: function (req, res) {
    var id = req.params.id;
    UserModel.findOne({ _id: id }, function (err, user) {
      if (err) {
        return res.status(500).json({
          message: "Error when getting user",
          error: err,
        });
      }

      if (!user) {
        return res.status(404).json({
          message: "No such user",
        });
      }
      user.username = req.body.username ? req.body.username : user.username;
      user.password = req.body.password ? req.body.password : user.password;
      user.email = req.body.email ? req.body.email : user.email;
      user.stravaId = req.body.stravaId ? req.body.stravaId : user.stravaId;

      user.save(function (err, user) {
        if (err) {
          return res.status(500).json({
            message: "Error when updating user.",
            error: err,
          });
        }

        return res.json(user);
      });
    });
  },

  remove: function (req, res) {
    var id = req.params.id;

    UserModel.findByIdAndRemove(id, function (err, user) {
      if (err) {
        return res.status(500).json({
          message: "Error when deleting the user.",
          error: err,
        });
      }

      return res.status(204).json();
    });
  },


  login: function (req, res, next) {
    UserModel.authenticate(
      req.body.username,
      req.body.password,
      function (err, user, token) {
        if (err || !user || !token) {
          var err = new Error("Wrong username or password");
          err.status = 401;
          return next(err);
        }
        req.session.userId = user._id;
        return res.json({ user: user, token: token });
      }
    );
  },

  profile: function (req, res, next) {
    UserModel.findById(req.session.userId).exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error("Not authorized, go back!");
          err.status = 400;
          return next(err);
        } else {
          // Get number of runs
          RunModel.countDocuments({ userId: user._id }, function (error, runCount) {
            if (error) {
              return next(error);
            } else {
              var responseData = {
                user: user,
                runCount: runCount,
                accessToken: req.newAccessToken
              };
              return res.json(responseData);
            }
          });
        }
      }
    });
  },

  runs: function (req, res, next) {
    var user = req.session.userId;
    RunModel.find({ userId: user }, function (err, runs) {
      if (err) {
        return next(err);
      }
      var responseData = {
        runs: runs,
        accessToken: req.newAccessToken
      };
      return res.json(responseData);
    });
  },

  logout: function (req, res, next) {
    if (req.session) {
      req.session.destroy(function (err) {
        if (err) {
          return next(err);
        } else {
          //return res.redirect('/');
          return res.status(201).json({});
        }
      });
    }
  },
};
