var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {ObjectID} = require('mongodb');

var app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
	var todo = new Todo({
		text: req.body.text
	});

	todo.save().then((result) => {
		res.send(result);
	}, (e) => {
		res.status(400).send(e);
	});
});

app.get('/todos', (req, res) => {
	Todo.find().then((todos) => {
		res.send({
			todos,
			code: 'OK'
		});
	}, (err) => {
		res.status(200).send(e);
	});
});

app.get('/todos/:id', (req, res) => {
	var id = req.params.id;

	//validate id using is valid
	if(!ObjectID.isValid(id)){
		return res.status(404).send({});
	}

	Todo.findById(id).then((todo) => {
		if(!todo){
			return res.status(404).send('Todo not found');
		}
		res.status(200).send({todo});
	}).catch((err) => {
		res.status(400).send();
	});

});

app.delete('/todos/:id', (req,res) => {
	var id = req.params.id;

	if(!ObjectID.isValid(id)){
		return res.status(404).send({});
	}
	Todo.findByIdAndRemove(id).then((todo) => {
		if(!todo){
			return res.status(404).send('Todo not found');
		}
		res.status(200).send({ todo, message: 'Todo removed'});
	}).catch((err) => {
		res.status(400).send();
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