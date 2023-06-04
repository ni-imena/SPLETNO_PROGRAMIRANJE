const jwt = require('jsonwebtoken');
var RefreshTokenModel = require("../models/refreshTokenModel.js");

const accessSecretKey = 'your_secret_key';
const refreshSecretKey = 'your_secret_key';

function verifyToken(req, res, next) {
    const token = req.headers.authorization;
    const userId = req.session.userId;

    //console.log(token);
    if (!token) {
        return res.status(401).json({ message: 'No token provided.' });
    }

    jwt.verify(token, accessSecretKey, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                getRefreshToken(userId, function (err, rToken) {
                    if (err) { return res.status(401).json({ message: 'Token expired.' }); }
                    else if (rToken) {
                        jwt.verify(rToken, refreshSecretKey, (err, decoded) => {
                            if (err) { return res.status(402).json({ message: 'Token expired.' }); }
                            const newAccessToken = makeAccessToken(userId)
                            req.user = decoded;
                            req.newAccessToken = newAccessToken;
                            next();
                        })
                    }
                    else { return res.status(403).json({ message: 'Token expired.' }); }
                });
            }
            else { return res.status(404).json({ message: err }); }
        }
        else {
            req.user = decoded;
            next();
        }
    });
}

function getRefreshToken(userId, callback) {
    RefreshTokenModel.findOne({ userId: userId }, function (err, refreshToken) {
        if (err) {
            console.error('Error finding RefreshToken/Expired:', err);
            callback(err, null); // Pass the error to the callback
        } else if (refreshToken) {
            rToken = refreshToken.token;
            callback(null, rToken); // Pass the refresh token to the callback
        } else {
            callback(null, null); // No refresh token found
        }
    });
}

function makeAccessToken(userId) {
    const payload = {
        userId: userId,
    };
    const options = {
        expiresIn: '15m'
    };
    return jwt.sign(payload, accessSecretKey, options);
}

function makeRefreshToken(userId) {
    RefreshTokenModel.findOneAndRemove({ userId: userId }, function (err, refreshToken) {
        if (err) {
            return res.status(500).json({
                message: "Error when deleting the token.",
                error: err,
            });
        }
    });

    const payload = {
        userId: userId,
    };
    const rToken = jwt.sign(payload, refreshSecretKey);
    var refreshToken = new RefreshTokenModel({
        token: rToken,
        userId: userId,
    });


    refreshToken.save(function (err) {
        if (err) {
            console.error('Error saving RefreshToken:', err);
        }
    });

}

module.exports = {
    verifyToken: verifyToken,
    makeAccessToken: makeAccessToken,
    makeRefreshToken: makeRefreshToken
};



