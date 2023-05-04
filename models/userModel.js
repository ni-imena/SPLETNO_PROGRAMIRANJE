var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var userSchema = new Schema({
	'username': String,
	'password': String,
	'email': String,
	'photo_path': String,
	'token': String
});
userSchema.statics.authenticate = async function (username, password) {
	try {
		const user = await User.findOne({ username: username }).exec();
		if (!user) {
			const err = new Error("User not found.");
			err.status = 401;
			throw err;
		}
		const result = await bcrypt.compare(password, user.password);
		if (result === true) {
			return user;
		} else {
			throw new Error("Incorrect password.");
		}
	} catch (error) {
		throw error;
	}
}


var User = mongoose.model('user', userSchema);
module.exports = User;
