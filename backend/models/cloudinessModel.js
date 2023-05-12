var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var cloudinessSchema = new Schema({
	'name' : String,
	'icon' : String
});

module.exports = mongoose.model('cloudiness', cloudinessSchema);
