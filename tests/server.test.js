const expect = require('expect');
const request = require('supertest');
var {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
	_id : new ObjectID(),
	text: 'first test todo'
}, {
	_id : new ObjectID(),
	text: 'second test todo'
}];

beforeEach((done) => {
	Todo.remove({}).then(() => {
		return Todo.insertMany(todos);
	}).then( () => {
		done();
	});
});

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