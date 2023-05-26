var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var runSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  activity: Object,
  stream: Object,
  location: {
    coordinates: [Number],
    type: { type: String, default: "Point" }
  },
});

module.exports = mongoose.model("run", runSchema);
