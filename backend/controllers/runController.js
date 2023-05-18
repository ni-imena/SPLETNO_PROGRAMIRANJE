var RunModel = require("../models/runModel.js");
var UserModel = require("../models/userModel.js");

/**
 * runController.js
 *
 * @description :: Server-side logic for managing runs.
 */
module.exports = {
  /**
   * runController.list()
   */
  list: function (req, res) {
    RunModel.find(function (err, runs) {
      if (err) {
        return res.status(500).json({
          message: "Error when getting run.",
          error: err,
        });
      }

      return res.json(runs);
    });
  },

  show: function (req, res) {
    var id = req.params.id;
    RunModel.findOne({ _id: id }, function (err, run) {
      if (err) {
        return res.status(500).json({
          message: "Error when getting run.",
          error: err,
        });
      }

      if (!run) {
        return res.status(404).json({
          message: "No such run",
        });
      }
      console.log("test");
      return res.json(run);
    });
  },

  create: function (req, res) {
    try {
      var activityJson = JSON.parse(req.body.activity);
      var streamJson = JSON.parse(req.body.stream);
    } catch (err) {
      return res.status(400).json({
        message: "Invalid JSON in activity field",
      });
    }

    RunModel.find({ "activity.id": activityJson.id }, (err, activity) => {
      if (err) {
        return res.status(500).json({
          message: "Error when getting activity",
          error: err,
        });
      } else if (activity.length === 0) {
        UserModel.findOne({ stravaId: req.body.stravaUserId }, (err, user) => {
          if (err) {
            return res.status(500).json({
              message: "Error when getting user",
              error: err,
            });
          } else if (!user) {
            return res.status(404).json({
              message: "Error when finding a user",
              error: err,
            });
          } else {
            const run = new RunModel({
              userId: user._id,
              activity: activityJson,
              stream: streamJson,
            });
            run.save(function (err, run) {
              if (err) {
                return res.status(500).json({
                  message: "Error when creating run",
                  error: err,
                });
              }

              return res.status(201).json(run);
            });
          }
        });
      } else {
        return res.status(200).json(activity);
      }
    });
  },

  update: function (req, res) {
    var id = req.params.id;

    RunModel.findOne({ _id: id }, function (err, run) {
      if (err) {
        return res.status(500).json({
          message: "Error when getting run",
          error: err,
        });
      }

      if (!run) {
        return res.status(404).json({
          message: "No such run",
        });
      }

      run.userId = req.body.userId ? req.body.userId : run.userId;
      run.activityId = req.body.activityId
        ? req.body.activityId
        : run.activityId;
      run.activity = req.body.activity ? req.body.activity : run.activity;
      run.stream = req.body.stream ? req.body.stream : run.stream;

      run.save(function (err, run) {
        if (err) {
          return res.status(500).json({
            message: "Error when updating run.",
            error: err,
          });
        }

        return res.json(run);
      });
    });
  },

  /**
   * runController.remove()
   */
  remove: function (req, res) {
    var id = req.params.id;

    RunModel.findByIdAndRemove(id, function (err, run) {
      if (err) {
        return res.status(500).json({
          message: "Error when deleting the run.",
          error: err,
        });
      }

      return res.status(204).json();
    });
  },
};
