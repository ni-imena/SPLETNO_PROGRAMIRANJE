var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var commentSchema = new Schema({
	'text' : String,
	'date' : Date,
	'postedBy' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'user'
	},
	'parentPhoto' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'photo'
	}
});

module.exports = mongoose.model('comment', commentSchema);
