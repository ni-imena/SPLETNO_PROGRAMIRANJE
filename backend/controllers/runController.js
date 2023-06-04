var RunModel = require("../models/runModel.js");
var UserModel = require("../models/userModel.js");

module.exports = {

  list: function (req, res) {
    RunModel.find(function (err, runs) {
      if (err) { return res.status(500).json({ message: "Error when getting runs.", error: err, }); }
      return res.json(runs);
    });
  },

  show: function (req, res) {
    var id = req.params.id;
    const userId = req.user.userId;
    RunModel.findOne({ _id: id, userId: userId }, function (err, run) {
      if (err) { return res.status(500).json({ message: "Error when getting run.", error: err, }); }
      if (!run) { return res.status(404).json({ message: "No such run", }); }

      var responseData = {
        run: run,
        accessToken: req.newAccessToken
      };
      return res.json(responseData);
      //return res.json(run);
    });
  },

  create: function (req, res) {
    try {
      var activityJson = JSON.parse(req.body.activity);
      var streamJson = JSON.parse(req.body.stream);
    } catch (err) { return res.status(400).json({ message: "Invalid JSON in activity or stream fields", }); }

    RunModel.find({ "activity.id": activityJson.id }, (err, activity) => {
      if (err) { return res.status(500).json({ message: "Error when getting activity", error: err, }); }
      else if (activity.length === 0) {
        UserModel.findOne({ stravaId: req.body.stravaUserId }, (err, user) => {
          if (err) { return res.status(500).json({ message: "Error when getting user", error: err, }); }
          else if (!user) { return res.status(404).json({ message: "Error when finding a user", error: err, }); }
          else {
            const lats = streamJson.latlng.data.map((point) => point[0]);
            const lngs = streamJson.latlng.data.map((point) => point[1]);
            const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
            const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2;
            const center = [centerLat, centerLng];
            const run = new RunModel({
              userId: user._id,
              activity: activityJson,
              stream: streamJson,
              location: {
                coordinates: center
              }
            });
            run.save(function (err, run) {
              if (err) { return res.status(500).json({ message: "Error when creating run", error: err, }); }
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
      if (err) { return res.status(500).json({ message: "Error when getting run", error: err, }); }
      if (!run) { return res.status(404).json({ message: "No such run", }); }

      run.userId = req.body.userId ? req.body.userId : run.userId;
      run.activityId = req.body.activityId
        ? req.body.activityId
        : run.activityId;
      run.activity = req.body.activity ? req.body.activity : run.activity;
      run.stream = req.body.stream ? req.body.stream : run.stream;

      run.save(function (err, run) {
        if (err) { return res.status(500).json({ message: "Error when updating run.", error: err, }); }
        return res.json(run);
      });
    });
  },

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

  nearbyRuns: function (req, res) {
    const id = req.params.id;
    const userId = req.user.userId;
    RunModel.findOne({ _id: id }, function (err, run) {
      if (err) { return res.status(500).json({ message: "Error when getting run.", error: err, }); }
      if (!run) { return res.status(404).json({ message: "No such run", }); }
      const coords = run.location.coordinates
      RunModel.find({
        _id: { $ne: id }, userId: userId, location: {
          $near: {
            $geometry: { type: "Point", coordinates: coords, },
            $maxDistance: 1000,
          },
        },
      }, function (err, runs) {
        if (err) { return res.status(500).json({ message: "Error when getting runs.", error: err }); }

        const runsWithDistance = runs.map((run) => {
          const distance = getDistance(coords[0], coords[1], run.location.coordinates[0], run.location.coordinates[1]);
          return { ...run.toObject(), distance };
        });
        var responseData = {
          runs: runsWithDistance,
          accessToken: req.newAccessToken
        };
        return res.json(responseData);

        //return res.json({ runs: runsWithDistance });
      });
    })
  },
};

const getDistance = (lat1, lng1, lat2, lng2) => {
  if (lat1 === lat2 && lng1 === lng2) {
    return 0;
  }

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
    Math.cos(deg2rad(lat2)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};