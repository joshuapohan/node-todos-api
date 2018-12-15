const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');

const {todos, populateTodos, users, populateUsers} = require('./seed');

// const todos = [{
// 	_id : new ObjectID(),
// 	text: 'first test todo'
// }, {
// 	_id : new ObjectID(),
// 	text: 'second test todo',
// 	completed: true,
// 	completedAt: 333
// }];

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
	it('should create a new todo', (done) => {
		var text = 'Test todo text';
		
		request(app)
			.post('/todos')
			.send({text})
			.expect(200)
			.expect( (res) => {
				expect(res.body.text).toBe(text);
			})
			.end( (err, res) => {
				if(err) {
					return done(err);
				}
				Todo.find({text}).then((todos) => {
					expect(todos.length).toBe(1);
					expect(todos[0].text).toBe(text);
					done();
				}).catch((err) => done(err));
			})
	});

	it('shoud not create todo with invalid body data', (done) => {

		var text = {};

		request(app)
			.post('/todos')
			.send({text})
			.expect(400)
			.end( (err, res) => {
				if(err) {
					return done(err);
				}
				Todo.find({}).then((todos) => {
					expect(todos.length).toBe(2);
					done();
				}).catch((err) => done(err));
			})
	});
});

describe('GET /todos' , () => {
	it('should get all todos' , (done) => {
		request(app)
			.get('/todos')
			.expect(200)
			.expect( (res) => {
				expect(res.body.todos.length).toBe(2);
			})
			.end(done);
	});
});

describe('GET /todos:id' , () => {

	it('should return 404 for invalid id', (done) => {
		request(app)
			.get('/todos/12345')
			.expect(404)
			.end(done);
	});

	it('should return 404 for not found', (done) => {
		var testId = new ObjectID();

		request(app)
			.get('/todos/' + testId.toHexString())
			.expect(404)
			.end(done);
	});

	it('should return todo doc', (done) => {
		request(app)
			.get('/todos/' + todos[0]._id.toHexString())
			.expect(200)
			.expect( (res) => {
				expect(res.body.todo.text).toBe(todos[0].text);
			})
			.end(done);
	});
})

describe('DELETE /todos:id' , () => {

	it('should return 404  if todo not found', (done) => {

		var testId = new ObjectID();

		request(app)
			.delete('/todos/' + testId)
			.expect(404)
			.end(done);
	});

	it('shoud return 404 if objectID is invalid', (done) => {
		request(app)
			.delete('/todos/12345')
			.expect(404)
			.end(done);
	});

	it('should remove a todo', (done) => {
		var hexId = todos[1]._id.toHexString();

		request(app)
			.delete('/todos/' + hexId)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo._id).toBe(hexId);
			})
			.end((err, res) => {
				if(err){
					return done(err)
				}
				Todo.findById(hexId).then((todo) => {
					expect(todo).toNotExist();
					done();
				}).catch((e) => done(e));
			});
	});
})

describe('PATCH /todos/:id', () => {

	it('shoud update the todo', (done) => {
		var hexId = todos[0]._id.toHexString();
		var newText = 'updated todo';

		request(app)
			.patch('/todos/' + hexId)
			.send({text: newText, completed: true})
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(newText);
				expect(res.body.todo.completed).toBe(true);
				expect(res.body.todo.completedAt).toBeA('number');
			})
			.end((err, res) => {
				if(err){
					return done(err)
				}
				Todo.findById(hexId).then((todo) => {
					expect(todo.text).toBe(newText);
					expect(todo.completed).toBe(true);
					expect(todo.completedAt).toBeA('number');
					done();
				}).catch((e) => done(e));
			});
	});

	it('should clear the completedAt', (done) => {
		var hexId = todos[1]._id.toHexString();
		var newText = 'updated todo 2';

		request(app)
			.patch('/todos/' + hexId)
			.send({text: newText, completed: false})
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(newText);
				expect(res.body.todo.completed).toBe(false);
				expect(res.body.todo.completedAt).toNotExist();
			})
			.end((err, res) => {
				if(err){
					return done(err)
				}
				Todo.findById(hexId).then((todo) => {
					expect(todo.text).toBe(newText);
					expect(todo.completed).toBe(false);
					expect(todo.completedAt).toNotExist();
					done();
				}).catch((e) => done(e));
			});
	});

});

describe('GET /users/me', () => {
	it('should return user if authenticated', (done) => {
		request(app)
			.get('/users/me')
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect((res) => {
				expect(res.body._id).toBe(users[0]._id.toHexString());
				expect(res.body.email).toBe(users[0].email);
			}).end(done);
	});

	it('should return 401 if not authenticated', (done) => {
		request(app)
			.get('/users/me')
			.expect(401)
			.expect((res) => {
				expect(res.body).toEqual({})
			})
			.end(done);
	});
});

describe('POST /users' , () => {
	it('should create a user', (done) => {
		var email = 'example@example.com';
		var password = '123acb';

		request(app)
			.post('/users')
			.send({email, password})
			.expect(200)
			.expect((res) => {
				expect(res.header['x-auth']).toExist();
				expect(res.body._id).toExist();
				expect(res.body.email).toBe(email);
			})
			.end((err) => {
				User.findOne({email}).then((user) =>{
					expect(user).toExist();
					expect(user.password).toNotBe(password);
					done();
				});
			});
	});

	it('should return validation errors if request invalid', (done) => {
		var email = 'testcom';
		var password = 'test123';

		request(app)
			.post('/users')
			.send({email, password})
			.expect(400)
			.expect((res) => {
				expect(res.header['x-auth']).toNotExist();
				expect(res.body.errors).toExist();
				expect(res.body.errors.email).toExist();
				expect(res.body.errors.email.message).toEqual(email + " is not a valid email");				
			})
			.end(done);

		// request(app)
		// 	.post('/users')
		// 	.send({email})
		// 	.expect(400)
		// 	.expect((res) => {
		// 		expect(res.header['x-auth']).toNotExist();
		// 		expect(res.body.errors).toExist();
		// 	})
		// 	.end(done);
	});

	it('should not create user if email in use', (done) => {
		var email = users[0].email;
		var password = 'test123';

		request(app)
			.post('/users')
			.send({email, password})
			.expect(400)
			.end(done);
	});
});