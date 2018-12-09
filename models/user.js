const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		trim: true,
		minlength: 1,
		unique: true,
		validate: {
			validator: validator.isEmail,
			message: '{VALUE} is not a valid email'
		}
	},
	password: {
		type: String,
		required: true,
		minlength: 6
	},
	tokens: [{
		access: {
			type:String,
			required: true
		},
		token: {
			type:String,
			required: true
		}
	}]
});

UserSchema.methods.toJSON = function(){
	var user = this;
	var userObj  = user.toObject();

	return _.pick(userObj,['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function(){
	var user = this;
	var access = 'auth';
	var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();
	var tokenObj = {
		access,
		token
	}

	console.log(tokenObj);
	user.tokens = user.tokens.concat([tokenObj]);
	return user.save().then(() => {
		console.log('Save successful');
		return token;
	}).catch((e) => {
		console.log(e);
	});
};

var User = mongoose.model('User', UserSchema);

module.exports = {
	User
};