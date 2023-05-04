var UserModel = require('../models/userModel.js');
const jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
require('dotenv').config();


module.exports = {

    list: function (req, res) {
        UserModel.find(function (err, users) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user.',
                    error: err
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
                    message: 'Error when getting user.',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }

            return res.json(user);
        });
    },

    create: async function (req, res, next) {
        var oldUser = await UserModel.findOne({ username: req.body.username });

        if (oldUser) {
            var err = new Error("Username is already Taken");
            err.status = 409;
            return next(err);
        }

        var password = await bcrypt.hash(req.body.password, 10);

        const user = await UserModel.create({
            username: req.body.username,
            password: password,
            email: req.body.email,
            photo_path: "",
        });

        var accessToken = jwt.sign({ "user": user._id }, process.env.TOKEN_KEY, { expiresIn: '30m' });
        user.token = accessToken;
        await user.save();

        res.redirect('/users/login');
    },

    update: function (req, res) {
        var id = req.params.id;

        UserModel.findOne({ _id: id }, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }

            user.username = req.body.username ? req.body.username : user.username;
            user.password = req.body.password ? req.body.password : user.password;
            user.email = req.body.email ? req.body.email : user.email;

            user.save(function (err, user) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating user.',
                        error: err
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
                    message: 'Error when deleting the user.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    },

    showRegister: function (req, res) {
        res.render('user/register');
    },

    showLogin: function (req, res) {
        res.render('user/login');
    },

    login: async function (req, res, next) {


        const user = await UserModel.findOne({ username: req.body.username });


        if (user && (await bcrypt.compare(req.body.password, user.password))) {
            const token = jwt.sign({ "user": user._id }, process.env.TOKEN_KEY, { expiresIn: '30m' });

            user.token = token;
            await user.save();

            req.session.userId = user._id;

            res.redirect('/users/profile');
        }else{
            var err = new Error("User \"" + req.body.username + "\" Not Found");
            err.status = 404;
            return next(err);
        }

        /*
        UserModel.authenticate(req.body.username, req.body.password, function (err, user) {
            if (err || !user) {
                var err = new Error('Wrong username or password');
                err.status = 401;
                return next(err);
            }
            // JWT
            const refreshToken = jwt.sign({ "user": user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
            const token = jwt.sign({ "user": user._id }, process.env.TOKEN_KEY, { expiresIn: '30m' });

            req.session.userId = user._id;
            req.session.refreshToken = refreshToken;

            user.token = token;
            user.save(function (err, user) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when creating user',
                        error: err
                    });
                }

                res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
                //res.json({accessToken})
                res.redirect('/users/profile');
            });
        });*/
    },

    profile: async function (req, res, next) {
        try {
            const user = await UserModel.findById(req.session.userId).exec();
            if (!user) {
                var err = new Error('Not authorized, go back!');
                err.status = 400;
                return next(err);
            } else {
                return res.render('user/profile', user);
            }
        } catch (error) {
            return next(error);
        }
    },
    

    logout: function (req, res, next) {
        if (req.session) {
            req.session.destroy(function (err) {
                if (err) {
                    return next(err);
                } else {
                    return res.redirect('/users/login');
                }
            });
        }
    },

    updatePhoto: function (req, res) {
        return res.render('user/publish');
    },

    updatePfp: function (req, res) {
        UserModel.findOneAndUpdate({ _id: req.session.userId }, { photo_path: "/images/" + req.file.filename }, { new: true }, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user.',
                    error: err
                });
            }
            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }
            return res.render('user/profile', user);
        })
    }
};
