var SetRunModel = require('../models/setRunModel.js');

module.exports = {

    list: function (req, res) {
        SetRunModel.find(function (err, setRunss) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting setRuns.',
                    error: err
                });
            }

            return res.json(setRunss);
        });
    },

    show: function (req, res) {
        var id = req.params.id;

        SetRunModel.findOne({_id: id}, function (err, setRuns) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting setRuns.',
                    error: err
                });
            }

            if (!setRuns) {
                return res.status(404).json({
                    message: 'No such setRuns'
                });
            }

            return res.json(setRuns);
        });
    },

    create: function (req, res) {
        const center = [46.285502, 15.300966500000001];
        var setRuns = new SetRunModel({
			name : req.body.name,
            distance: 1000,
            location: {
                coordinates: center
              }
        });

        setRuns.save(function (err, setRuns) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating setRuns',
                    error: err
                });
            }

            return res.status(201).json(setRuns);
        });
    },

    update: function (req, res) {
        var id = req.params.id;

        SetRunModel.findOne({_id: id}, function (err, setRuns) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting setRuns',
                    error: err
                });
            }

            if (!setRuns) {
                return res.status(404).json({
                    message: 'No such setRuns'
                });
            }

            setRuns.name = req.body.name ? req.body.name : setRuns.name;
			setRuns.stream = req.body.stream ? req.body.stream : setRuns.stream;
			setRuns.location = req.body.location ? req.body.location : setRuns.location;
			
            setRuns.save(function (err, setRuns) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating setRuns.',
                        error: err
                    });
                }

                return res.json(setRuns);
            });
        });
    },

    remove: function (req, res) {
        var id = req.params.id;

        SetRunModel.findByIdAndRemove(id, function (err, setRuns) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the setRuns.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
