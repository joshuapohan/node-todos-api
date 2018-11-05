//const MongoClient = require('mongodb').MongoClient;

const {MongoClient, ObjectID} = require('mongodb'); //equal to const MongoClient = require('mongodb').MongoClient;

// var obj = new ObjectID();
// console.log(obj);

MongoClient.connect('mongodb://localhost:27017/test', (err, db) => {
	if(err){
		return	console.log(err);
	}
	// db.collection('Todos').insertOne({
	// 	user: 'Tom',
	// 	task: 'Pay rent',
	// 	completed: false
	// }, (err, result) => {
	// 	if(err){
	// 		return console.log(err);
	// 	}
	// 	console.log(JSON.stringify(result.ops, undefined, 2)); //result.ops returns array of documents inserted
	// 	console.log(result.ops[0]._id.getTimestamp());
	// });
	// db.collection('Todos').insertOne({
	// 	user: 'Tim',
	// 	task: 'Pay rent',
	// 	completed: false
	// }, (err, result) => {
	// 	if(err){
	// 		return console.log(err);
	// 	}
	// 	console.log(JSON.stringify(result.ops, undefined, 2)); //result.ops returns array of documents inserted
	// 	console.log(result.ops[0]._id.getTimestamp());
	// });
	// db.collection('Todos').insertOne({
	// 	user: 'Sarah',
	// 	task: 'Eat',
	// 	completed: false
	// }, (err, result) => {
	// 	if(err){
	// 		return console.log(err);
	// 	}
	// 	console.log(JSON.stringify(result.ops, undefined, 2)); //result.ops returns array of documents inserted
	// 	console.log(result.ops[0]._id.getTimestamp());
	// });
	//deleteOne and deleteMany also available
	// db.collection('Todos').findOneAndDelete({user:'Sarah'}).then((result)=>{
	// 	console.log(result);
	// });

	db.collection('Todos').find({_id: new ObjectID('5bd7133f7b7b1608c4966438')}).count().then( (count) => {
		console.log('Todos');
		console.log('found : ' + count);
	}, (err) => {
		console.log(err);
	});

	db.collection('Todos').findOneAndDelete({_id: new ObjectID('5bd7133f7b7b1608c4966438')}).then((result)=>{
		console.log(result);
	});

	db.collection('Todos').find({_id: new ObjectID('5bd7133f7b7b1608c4966438')}).count().then( (count) => {
		console.log('Todos');
		console.log('found : ' + count);
	}, (err) => {
		console.log(err);
	});

	// db.collection('Todos').find().toArray().then((docs) => {
	// 	console.log('Todos');
	// 	console.log(JSON.stringify(docs, undefined, 2));
	// }, (err) => {
	// 	console.log(err);
	// });
	// db.collection('Todos').find({completed: true}).toArray().then( (docs) => {
	// 	console.log('Todos');
	// 	console.log(JSON.stringify(docs, undefined, 2));
	// }, (err) => {
	// 	console.log(err);
	// });
	console.log('Connected to MongoDB server');
	db.close();
});
