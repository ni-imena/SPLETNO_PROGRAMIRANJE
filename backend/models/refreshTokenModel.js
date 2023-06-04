var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var refreshTokenSchema = new Schema({
    token: String,
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
    },
    createdAt: { type: Date, default: Date.now, expires: 172800 }
});

module.exports = mongoose.model("refreshToken", refreshTokenSchema);