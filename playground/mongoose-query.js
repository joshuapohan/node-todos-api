var {mongoose} = require('./../db/mongoose');
var {Todo} = require('./../models/todo');
var {User} = require('./../models/user');
var {ObjectID} = require('mongodb');

var id = '5be060f45ad170117c594ae5'

if (!ObjectID.isValid(id)){
	console.log('ID not valid');
}

User.findById(id).then((user) => {
	if(!user){
		return console.log('ID not found');
	}
	console.log('User',user)
}).catch((e) => console.log('ID not valid'));

Todo.find({
	_id: id
})

Todo.findOne({
	_id: id
}).then( (todo) => {
	console.log('Todo', todo)
});
