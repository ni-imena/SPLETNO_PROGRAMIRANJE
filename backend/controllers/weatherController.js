var WeatherModel = require('../models/weatherModel.js');

/**
 * weatherController.js
 *
 * @description :: Server-side logic for managing weathers.
 */
module.exports = {

    list: function (req, res) {
        WeatherModel.find(function (err, weathers) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting weather.',
                    error: err
                });
            }

            return res.json(weathers);
        });
    },

    show: function (req, res) {
        var id = req.params.id;

        WeatherModel.findOne({ _id: id }, function (err, weather) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting weather.',
                    error: err
                });
            }

            if (!weather) {
                return res.status(404).json({
                    message: 'No such weather'
                });
            }

            return res.json(weather);
        });
    },

    create: function (req, res) {
/*
        WeatherModel.findOneAndRemove({ location: req.body.location }, (err, loc) => {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting location',
                    error: err
                });
            } 
        })*/

        var weather = new WeatherModel({
            cloudiness: req.body.cloudiness,
            temperature: req.body.temperature,
            humidity: req.body.humidity,
            location: req.body.location,
            date: Date.now()
        });

        weather.save(function (err, weather) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating weather',
                    error: err
                });
            }

            return res.status(201).json(weather);
        });
    },

    update: function (req, res) {
        var id = req.params.id;

        WeatherModel.findOne({ _id: id }, function (err, weather) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting weather',
                    error: err
                });
            }

            if (!weather) {
                return res.status(404).json({
                    message: 'No such weather'
                });
            }

            weather.cloudinessId = req.body.cloudinessId ? req.body.cloudinessId : weather.cloudinessId;
            weather.temparature = req.body.temparature ? req.body.temparature : weather.temparature;
            weather.humidity = req.body.humidity ? req.body.humidity : weather.humidity;
            weather.location = req.body.location ? req.body.location : weather.location;
            weather.date = req.body.date ? req.body.date : weather.date;

            weather.save(function (err, weather) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating weather.',
                        error: err
                    });
                }

                return res.json(weather);
            });
        });
    },

    remove: function (req, res) {
        var id = req.params.id;

        WeatherModel.findByIdAndRemove(id, function (err, weather) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the weather.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
