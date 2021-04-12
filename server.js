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

// Routes:

app.get('/', homeRouteHandler);//home route
app.get('/search', searchHandler);//hello route
app.get('*', notFoundHandler); //error handler



// Routes handlers:

function homeRouteHandler(req, res) {
  res.render('pages/index');
}

function searchHandler (req,res){
  let booksArray = [];
//   let ulrChoice;
  //   console.log('Search');
  let bookName = req.query.book;
  let searchChoice = req.query.bookChoice;
  console.log('bookname?',bookName);
  let url = `https://www.googleapis.com/books/v1/volumes?q=+in${bookName}+${searchChoice}`;
//   let url2 = `https://www.googleapis.com/books/v1/volumes?q=${bookName}+inauthour`;
//   if (req.query.bookChoice === 'title'){ ulrChoice = url;}
//   else if(req.query.bookChoice === 'author') {ulrChoice = url2;}
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



  // res.render();
}

function notFoundHandler(req, res) {
  res.render('pages/error');
}

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

function Book (bookData){

  this.title = bookData.volumeInfo.title;
  this.author = bookData.volumeInfo.authors;
  this.date = bookData.volumeInfo.publishedDate;
  this.cover = bookData.volumeInfo.imageLinks.thumbnail;
  this.description = bookData.volumeInfo.description;

//   allBooks.push(this);
}

// Book.allBooks = [];


// client.connect()
//   .then(() => {
//     app.listen(PORT, () =>
//       console.log(`listening on ${PORT}`)
//     );
//   });

