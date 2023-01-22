const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{
  "username": "pepe99",
  "password":  "1211"
}];

const isValid = (username)=>{
  return (username != "") && (users.find(user => user.username === username) != undefined); 
}

const authenticatedUser = (username, password)=> {
  return users.find(user => user.username === username).password === password;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;

  if (!isValid(username)) {
      return res.status(401).json({message: "User not exists, you must sign in."});
  }

  const password = req.body.password;
  if (!authenticatedUser(username, password)) {
      return res.status(401).json({message: "Incorrect password."});
  }

  let accessToken = jwt.sign({
      data: password
  }, 'access', { expiresIn: 60 * 60 });

  req.session.authorization = { accessToken,username }

  return res.status(200).json({token: accessToken});
});

// Add a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
	//Write your code here
	const isbn = req.params.isbn
	const review = req.body.review
	const username = req.session.authorization.username
	if (books[isbn]) {
		let book = books[isbn]
		book.reviews[username] = review
		return res.status(200).send('Review successfully posted')
	} else {
		return res.status(401).json({message: `ISBN ${isbn} not found`})
	}
})
regd_users.delete('/auth/delete/review/:isbn', (req, res) => {
	//Write your code here
	const isbn = req.params.isbn
	const review = req.body.review
	const username = req.session.authorization.username
	if (books[isbn]) {
		let book = books[isbn]
		book.reviews.splice(book.reviews.indexOf(req.params.review),1);
		return res.status(200).send('Review successfully deleted')
	} else {
		return res.status(401).json({message: `ISBN ${isbn} not found`})
	}
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
