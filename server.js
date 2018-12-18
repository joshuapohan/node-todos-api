const _ = require('lodash');

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {ObjectID} = require('mongodb');
var {authenticate} = require('./middleware/authenticate');

var app = express();

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
	var todo = new Todo({
		text: req.body.text,
		_creator: req.user._id
	});

	todo.save().then((result) => {
		res.send(result);
	}, (e) => {
		res.status(400).send(e);
	});
});

app.get('/todos', authenticate, (req, res) => {
	Todo.find({_creator: req.user._id}).then((todos) => {
		res.send({
			todos,
			code: 'OK'
		});
	}, (err) => {
		res.status(200).send(e);
	});
});

app.get('/todos/:id', authenticate, (req, res) => {
	var id = req.params.id;

	//validate id using is valid
	if(!ObjectID.isValid(id)){
		return res.status(404).send({});
	}

	Todo.findOne({_id: id, _creator: req.user._id}).then((todo) => {
		if(!todo){
			return res.status(404).send('Todo not found');
		}
		if(todo._creator.toHexString() === req.user._id.toHexString()){
			res.status(200).send({todo});			
		}else{
			res.status(401).send({message: 'Unauthorized access'})
		}
	}).catch((err) => {
		res.status(400).send();
	});

	// Todo.findById(id).then((todo) => {
	// 	if(!todo){
	// 		return res.status(404).send('Todo not found');
	// 	}
	// 	if(todo._creator.toHexString() === req.user._id.toHexString()){
	// 		res.status(200).send({todo});			
	// 	}else{
	// 		res.status(401).send({message: 'Unauthorized access'})
	// 	}
	// }).catch((err) => {
	// 	res.status(400).send();
	// });
});

app.delete('/todos/:id', authenticate, (req,res) => {
	var id = req.params.id;

	if(!ObjectID.isValid(id)){
		return res.status(404).send({});
	}

	Todo.findOneAndRemove({_id: id, _creator: req.user._id}).then((todo) => {
		if(!todo){
			return res.status(404).send('Todo not found');
		}
		res.status(200).send({ todo, message: 'Todo removed'});
	}).catch((err) => {
		res.status(400).send();
	});

	// Todo.findByIdAndRemove(id).then((todo) => {
	// 	if(!todo){
	// 		return res.status(404).send('Todo not found');
	// 	}
	// 	res.status(200).send({ todo, message: 'Todo removed'});
	// }).catch((err) => {
	// 	res.status(400).send();
	// });
});

app.patch('/todos/:id', authenticate, (req, res) => {
	var id = req.params.id;
	var body = _.pick(req.body, ['text', 'completed']);

	var id = req.params.id;

	if(!ObjectID.isValid(id)){
		return res.status(404).send({});
	}

	if(_.isBoolean(body.completed) && body.completed){
		body.completedAt = new Date().getTime();
	}
	else{
		body.completed = false;
		body.completedAt = null;
	}

	Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((todo) => {
		if(todo){
			res.status(200).send({todo});
		}
		else{
			res.status(404).send();
		}
	}).catch((e) => {
		res.status(400).send();
	});

	// Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
	// 	if(todo){
	// 		res.status(200).send({todo});
	// 	}
	// 	else{
	// 		res.status(404).send();
	// 	}
	// }).catch((e) => {
	// 	res.status(400).send();
	// });
});

app.post('/users', (req, res) => {
	var user = new User(_.pick(req.body, ['email', 'password']));

	user.save().then(() => {
		return user.generateAuthToken();
	}).then((token) => {
		res.header('x-auth', token).send(user);
	}).catch((e) => {
		res.status(400).send(e);
	});
});

app.get('/users/me', authenticate,  (req, res) => {
	res.send(req.user);
});

app.post('/users/login', (req, res) => {
	var login = _.pick(req.body, ['email', 'password']);

	// User.findOne({email: login.email}).then((user) =>{
	// 	if(user){
	// 		bcrypt.compare(login.password, user.password, (err, result) => {
	// 			if(result){
	// 				res.status(200).send(user);
	// 			}
	// 			else{
	// 				res.status(401).send({message: "Invalid user or password"});
	// 			}
	// 		});
	// 	} else{
	// 		res.status(404).send({message: "User not found"});
	// 	}
	// });
	User.findByCredential(login).then((user) =>{
		return user.generateAuthToken().then((token) => {
			res.header('x-auth', token).status(200).send(user);
		});
	}).catch((e) => {
		res.status(400).send({message:"Invalid user or password"});
	});
});

app.delete('/users/me/token', authenticate, (req, res) => {
	req.user.removeToken(req.token).then(() => {
		res.status(200).send();
	}).catch((e) => {
		res.status(400).send({message:"Token not deleted"});
	});
});

app.listen(3000, () => {
	console.log('Server started on port 3000');
});

module.exports = {
	app
};

// var user = new User({
// 	email: 'joshtest@example.com'
// });

// user.save().then((result) => {
// 	console.log('User saved', result);
// }, (err) => {
// 	console.log(err);
// });