var mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
var Schema = mongoose.Schema;

var refreshTokenSchema = new Schema({
    token: String,
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
    },
    createdAt: { type: Date, default: Date.now, expires: 1209600 }
});

module.exports = mongoose.model("refreshToken", refreshTokenSchema);