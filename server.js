/* eslint-disable quotes */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
'use strict';

require('dotenv').config(); //DOTENV (read our enviroment variable)

// Application Dependencies

const express = require('express');
const pg = require('pg'); // install pg package:  npm i pg
const cors = require('cors'); //CORS = Cross Origin Resource Sharing
const superagent = require('superagent'); // client-side HTTP request library.

const PORT = process.env.PORT || 3000;


// adding DATABASE URL for localhost:
// const client = new pg.Client(process.env.DATABASE_URL);

// clients.connect(); // Activate the client   //better use the connect function at the end of the code.

// adding DATABASE URL for Heroku:
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL,
//      ssl: { rejectUnauthorized: false } });


const app = express();
app.set('view engine','ejs');
app.use(express.static('./public'));
app.use(cors());
app.use( express.urlencoded( {extended:true} ) ); // for POST method to work.

// Routes:

app.get('/', homeRouteHandler);//home route
app.post('/search', searchHandler);//hello route
app.get('*', notFoundHandler); //error handler



// Routes handlers:

function homeRouteHandler(req, res) {
  res.render('pages/index');
}

function searchHandler (req,res){
  let booksArray = [];
  let bookName = req.body.book; // req.query for GET method , req.body for POST method
  let searchChoice = req.body.bookChoice;
  console.log('bookname?',bookName);
  console.log('bookname choice?',searchChoice);
  let url = `https://www.googleapis.com/books/v1/volumes?q=+${searchChoice}:${bookName}`;
  superagent.get(url)
    .then(booksData=>{
      let bData = booksData.body.items;
      bData.forEach (val => {
        let newBook = new Book (val);
        booksArray.push(newBook);
      });
      // res.send(bData);
      res.render('pages/searches/show',{booksArr:booksArray});
    });
}


function notFoundHandler(req, res) {
  res.render('pages/error');
}

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

function Book (bookData){

  this.title = (bookData.volumeInfo.title) ? bookData.volumeInfo.title : 'Not avialable';
  this.author = (bookData.volumeInfo.authors) ? bookData.volumeInfo.authors.join(',') : 'Not avialable';
  this.date = (bookData.volumeInfo.publishedDate) ? bookData.volumeInfo.publishedDate : 'Not avialable';
  this.cover = (bookData.volumeInfo.imageLinks) ? bookData.volumeInfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
  this.description = (bookData.volumeInfo.description) ? bookData.volumeInfo.description : 'Not avialable';

}


// client.connect()
//   .then(() => {
//     app.listen(PORT, () =>
//       console.log(`listening on ${PORT}`)
//     );
//   });

