var UserModel = require("../models/userModel.js");
var RunModel = require("../models/runModel.js");

module.exports = {
  list: function (req, res) {
    UserModel.find(function (err, users) {
      if (err) { return res.status(500).json({ message: "Error when getting user.", error: err }); }

      var responseData = {
        users: users,
        accessToken: req.newAccessToken
      };
      return res.json(responseData);
    }
    )
  },

  show: function (req, res) {
    var id = req.params.id;

    UserModel.findOne({ _id: id }, function (err, user) {
      if (err) { return res.status(500).json({ message: "Error when getting user.", error: err, }); }

      if (!user) { return res.status(404).json({ message: "No such user", }); }

      return res.json(user);
    });
  },

  create: function (req, res) {
    if (req.body.password !== req.body.repeatPassword) { return res.status(500).json({ message: "Passwords do not match" }); }
    UserModel.findOne({ username: req.body.username }, function (err, existingUser) {
      if (err) { return res.status(500).json({ message: "Error when finding user", error: err, }); }

      if (existingUser) { return res.status(409).json({ message: "Username is already taken", }); }

      UserModel.findOne({ email: req.body.email }, function (err, existingEmail) {
        if (err) { return res.status(500).json({ message: "Error when finding user", error: err, }); }
        if (existingEmail) { return res.status(409).json({ message: "Account with that Email already exists", }); }

        var user = new UserModel({
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
          admin: false
        });

        user.save(function (err, savedUser) {
          if (err) { return res.status(500).json({ message: "Error when creating user", error: err, }); }

          return res.status(201).json(savedUser);
        });
      })
    });
  },

  update: function (req, res) {
    var id = req.params.id;

    UserModel.findOne({ _id: id }, function (err, user) {
      if (err) { return res.status(500).json({ message: "Error when getting user", error: err, }); }

      if (!user) { return res.status(404).json({ message: "No such user", }); }

      user.username = req.body.username;// ? req.body.username : user.username;
      user.password = req.body.password;// ? req.body.password : user.password;
      user.email = req.body.email;// ? req.body.email : user.email;
      user.stravaId = req.body.stravaId;// ? req.body.stravaId : user.stravaId;
      user.admin = (req.body.admin === user.admin) ? user.admin : req.body.admin;

      user.save(function (err, user) {
        if (err) { return res.status(500).json({ message: "Error when updating user.", error: err, }); }

        var responseData = {
          user: user,
          accessToken: req.newAccessToken
        };
        return res.json(responseData);

        //return res.json(user);
      });
    });
  },

  remove: function (req, res) {
    var id = req.params.id;

    UserModel.findByIdAndRemove(id, function (err, user) {
      if (err) { return res.status(500).json({ message: "Error when deleting the user.", error: err, }); }
      var responseData = {
        accessToken: req.newAccessToken
      };
      return res.json(responseData);

      //return res.status(204).json();
    });
  },

  login: function (req, res, next) {
    UserModel.authenticate(
      req.body.username,
      req.body.password,
      function (err, user, token) {
        if (err || !user || !token) { var err = new Error("Wrong username or password"); err.status = 401; return next(err); }
        req.session.userId = user._id;
        return res.json({ user: user, token: token });
      }
    );
  },

  profile: function (req, res, next) {
    UserModel.findById(req.session.userId).exec(function (error, user) {
      if (error) { return next(error); }
      else {
        if (user === null) { var err = new Error("Not authorized, go back!"); err.status = 400; return next(err); }
        else {
          RunModel.countDocuments({ userId: user._id }, function (error, runCount) {
            if (error) { return next(error); }
            else {
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
      if (err) { return next(err); }
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
        if (err) { return next(err); }
        else { return res.status(201).json({}); }
      });
    }
  },

  assignRuns: function (req, res) {
    const userId = req.params.id;

    UserModel.findOne({ _id: userId }, (err, user) => {
      if (err || !user) { return res.status(404).json({ message: 'User not found' }); }

      const stravaId = parseInt(user.stravaId);

      RunModel.updateMany({ 'activity.athlete.id': stravaId }, { userId: userId }, (err) => {
        if (err) { return res.status(500).json({ message: 'Failed to update runs' }); }
        var responseData = {
          accessToken: req.newAccessToken
        };
        return res.json(responseData);
      })
    });
  },

  setStravaId: function (req, res) {
    var id = req.params.id;

    UserModel.findOne({ _id: id }, function (err, user) {
      if (err) { return res.status(500).json({ message: "Error when getting user", error: err, }); }
      if (!user) { return res.status(404).json({ message: "No such user", }); }

      user.stravaId = req.body.stravaId ? req.body.stravaId : user.stravaId;

      user.save(function (err, user) {
        if (err) { return res.status(500).json({ message: "Error when updating user.", error: err, }); }

        var responseData = {
          user: user,
          accessToken: req.newAccessToken
        };
        return res.json(responseData);
      });
    });
  }
};