var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var setRunSchema = new Schema({
	name: String,
	distance: Number,
	structure: Object,
	stream: Object,
	location: {
		coordinates: [Number],
		type: { type: String, default: "Point" }
	},
});

module.exports = mongoose.model('setRun', setRunSchema);
