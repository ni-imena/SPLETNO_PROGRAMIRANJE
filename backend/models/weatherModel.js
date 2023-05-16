var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var weatherSchema = new Schema({
  cloudiness: String,
  temperature: Number,
  humidity: Number,
  location: String,
  date: Date,
});

module.exports = mongoose.model("weather", weatherSchema);
