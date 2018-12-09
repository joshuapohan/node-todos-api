const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');


var data = {
	id: 1
}

var token = jwt.sign(data, '123abc');
console.log(token);

var decoded = jwt.verify(token, '123abc');
console.log(decoded);

// var message = "I am user number 3";
// var hash = SHA256(message).toString();

// console.log('Mesage : ' + message);
// console.log('Mesage : ' + hash);

// var data = {
// 	id: 1
// }

// var token = {
// 	data,
// 	hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// }

// var resultHash = SHA256(JSON.stringify(token.data) + 'somecret').toString(); 

// if(resultHash === token.hash){
// 	console.log('Same hash, data valid');
// }
// else{
// 	console.log('Wrong hash');
// }