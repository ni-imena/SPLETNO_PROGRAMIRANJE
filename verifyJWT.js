const jwt = require('jsonwebtoken');
require('dotenv').config();
var UserModel = require('./models/userModel.js');


const verifyJWT = async (req, res, next) => {
    var user = await UserModel.findById(req.session.userId);
    const token = req.body.token || req.query.token || req.headers["x-access-token"] || user.token;
    if (!token) {
        var err = new Error('The Token is Missing');
        err.status = 403;
        return next(err);
    }
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        req.user = decoded;
        req.session.userId = decoded.user;
    } catch (err) {
        var err = new Error('Invalid Token');
        err.status = 401;
        return next(err);
    }
    return next();
}

module.exports = verifyJWT


