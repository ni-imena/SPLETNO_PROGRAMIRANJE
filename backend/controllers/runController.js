var RunModel = require('../models/runModel.js');

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
                    message: 'Error when getting run.',
                    error: err
                });
            }

            return res.json(runs);
        });
    },

    /**
     * runController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        RunModel.findOne({ _id: id }, function (err, run) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting run.',
                    error: err
                });
            }

            if (!run) {
                return res.status(404).json({
                    message: 'No such run'
                });
            }

            return res.json(run);
        });
    },

    /**
     * runController.create()
     */
    create: function (req, res) {

        try {
            var activity = JSON.parse(req.body.activity);
            var stream = JSON.parse(req.body.stream);
        } catch (err) {
            return res.status(400).json({
                message: 'Invalid JSON in activity field'
            });
        }

        //find a user with the stravaId === req.body.stravaUserId
        //and get his _id, and thats going to be the userId for a run then.

        //if the user doesn't exist, then return the message that says they need to authorize strava on their profile

        var run = new RunModel({
            userId: req.body.userId,
            activity: activity,
            stream: stream
        });

        run.save(function (err, run) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating run',
                    error: err
                });
            }

            return res.status(201).json(run);
        });
    },


    /**
     * runController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        RunModel.findOne({ _id: id }, function (err, run) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting run',
                    error: err
                });
            }

            if (!run) {
                return res.status(404).json({
                    message: 'No such run'
                });
            }

            run.userId = req.body.userId ? req.body.userId : run.userId;
            run.activityId = req.body.activityId ? req.body.activityId : run.activityId;
            run.activity = req.body.activity ? req.body.activity : run.activity;
            run.stream = req.body.stream ? req.body.stream : run.stream;

            run.save(function (err, run) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating run.',
                        error: err
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
                    message: 'Error when deleting the run.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
