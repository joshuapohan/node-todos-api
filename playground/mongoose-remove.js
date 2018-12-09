var {mongoose} = require('./../db/mongoose');
var {Todo} = require('./../models/todo');
var {User} = require('./../models/user');
var {ObjectID} = require('mongodb');

Todo.remove({}).then((result) => {
	console.log(result);
});

//Todo.findOneAndRemove
//Todo.findByIdAndRemove