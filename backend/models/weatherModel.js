var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var weatherSchema = new Schema({
	'cloudinessId' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'cloudiness'
	},
	'temparature' : Number,
	'humidity' : Number,
	'location' : String,
	'date' : Date
});


module.exports = mongoose.model('weather', weatherSchema);
