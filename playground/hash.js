const bcrypt = require('bcryptjs');

var password = '123abc';

// bcrypt.genSalt(10, (err, salt) => {
// 	bcrypt.hash(password, salt, (err, hash) => {
// 		console.log(hash);
// 	});
// });

var hashedPassword = '$2a$10$ab8aZO0CjcCbyz9vnepc2e7noQngkgOOnLjSP4CMCapKr/XbbKw0y';

bcrypt.compare(password, hashedPassword, (err, res) => {
	console.log(res);
});