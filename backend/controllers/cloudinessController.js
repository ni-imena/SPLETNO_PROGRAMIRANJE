var CloudinessModel = require('../models/cloudinessModel.js');

/**
 * cloudinessController.js
 *
 * @description :: Server-side logic for managing cloudinesss.
 */
module.exports = {

    /**
     * cloudinessController.list()
     */
    list: function (req, res) {
        CloudinessModel.find(function (err, cloudinesss) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting cloudiness.',
                    error: err
                });
            }

            return res.json(cloudinesss);
        });
    },

    /**
     * cloudinessController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        CloudinessModel.findOne({_id: id}, function (err, cloudiness) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting cloudiness.',
                    error: err
                });
            }

            if (!cloudiness) {
                return res.status(404).json({
                    message: 'No such cloudiness'
                });
            }

            return res.json(cloudiness);
        });
    },

    /**
     * cloudinessController.create()
     */
    create: function (req, res) {
        var cloudiness = new CloudinessModel({
			name : req.body.name,
			icon : req.body.icon
        });

        cloudiness.save(function (err, cloudiness) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating cloudiness',
                    error: err
                });
            }

            return res.status(201).json(cloudiness);
        });
    },

    /**
     * cloudinessController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        CloudinessModel.findOne({_id: id}, function (err, cloudiness) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting cloudiness',
                    error: err
                });
            }

            if (!cloudiness) {
                return res.status(404).json({
                    message: 'No such cloudiness'
                });
            }

            cloudiness.name = req.body.name ? req.body.name : cloudiness.name;
			cloudiness.icon = req.body.icon ? req.body.icon : cloudiness.icon;
			
            cloudiness.save(function (err, cloudiness) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating cloudiness.',
                        error: err
                    });
                }

                return res.json(cloudiness);
            });
        });
    },

    /**
     * cloudinessController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        CloudinessModel.findByIdAndRemove(id, function (err, cloudiness) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the cloudiness.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
