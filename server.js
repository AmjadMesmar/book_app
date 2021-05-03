/* eslint-disable camelcase */
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
const methodOverride = require('method-override');


const PORT = process.env.PORT || 3000;


// adding DATABASE URL for localhost:

const client = new pg.Client(process.env.DATABASE_URL);

// adding DATABASE URL for Heroku:

// const client = new pg.Client({ connectionString: process.env.DATABASE_URL,ssl: { rejectUnauthorized: false } });


const app = express();
app.set('view engine','ejs');
app.use(express.static('./public'));
app.use(cors());
app.use( express.urlencoded( {extended:true} ) ); // for POST method to work.
app.use (methodOverride('_method'));

// Routes:

app.get('/', homeRouteHandler);//home route
app.get('/search_book', searchPageHandler);
app.post('/add_book', addBookHandler);
app.post('/details/:bookID', showBookDetails);
app.put('/updateBook/:bookID',updateBookHandler);
app.post('/search', searchHandler);//hello route
app.delete('/deleteBook/:bookID',deleteBookHandler);
app.get('*', notFoundHandler); //error handler



// Routes handlers:

function homeRouteHandler(req, res) {
  let SQL = `SELECT * FROM books;`;
  client.query(SQL)
    .then (result=>{
      res.render('pages/index',{booksArr:result.rows});
      // res.send(result.rows);
    })
    .catch(error=>{
      res.send(error);
    });
}

function searchPageHandler (req,res){
  res.render('pages/searches/search-books');
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

function addBookHandler (req,res) {
  let bookImage = req.body.image;
  let bookTitle = req.body.title;
  let bookAuthor = req.body.author;
  let bookIsbn = req.body.isbn;
  let bookDate = req.body.publishDate;
  let bookDescription = req.body.description;

  let SQL = `SELECT * FROM books WHERE isbn=$1`;
  let bookCheck = [bookIsbn];
  client.query(SQL, bookCheck).then(result => {
    // console.log(result);
    if (result.rowCount) {
      // res.send(result.rows[0]);
      console.log('Book already added');
      res.render('pages/bookExist');
    }
    else {
      SQL = `INSERT INTO books (image_url,title,author,isbn,date,description) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *;`;
      let safeValues = [bookImage,bookTitle,bookAuthor,bookIsbn,bookDate,bookDescription];
      client.query(SQL,safeValues)
        .then(result=>{
          // res.send(result);
          console.log('New Book added');
          // res.send('new book added');
          res.render('pages/bookAdd');

        });
    }
  });
}

function showBookDetails(req,res) {
  let SQL = `SELECT * FROM books WHERE id=$1;`;
  let value = [req.params.bookID];
  // console.log('value',value);
  client.query(SQL,value)
    .then((result) => {
      // console.log('bookid',result);
      res.render('pages/details',{book:result.rows[0]});
    });
}

function updateBookHandler (req,res){
  console.log(req.params.bookID);
  let {image,title,author,isbn,publishDate,description} = req.body;
  let SQL = `UPDATE books SET image_url=$1,title=$2,author=$3,isbn=$4,date=$5,description=$6 WHERE id=$7;`;
  let safeValues = [image,title,author,isbn,publishDate,description,req.params.bookID];
  client.query(SQL,safeValues)
    .then(()=>{
      res.redirect(`/`);
    }).catch(error=>{
      res.send(error);
    });

}

function deleteBookHandler(req,res) {
  // confirm("Press a button!");
  let SQL = `DELETE FROM books WHERE id=$1;`;
  let value = [req.params.bookID];
  client.query(SQL,value)
    .then(res.redirect('/'));
}


function notFoundHandler(req, res) {
  res.render('pages/error');
}

// app.listen(PORT, () => {
//   console.log(`listening on port ${PORT}`);
// });

function Book (bookData){

  this.title = (bookData.volumeInfo.title) ? bookData.volumeInfo.title : 'Not avialable';
  this.author = (bookData.volumeInfo.authors) ? bookData.volumeInfo.authors.join(',') : 'Not avialable';
  this.isbn = (bookData.volumeInfo.industryIdentifiers[0].identifier) ? bookData.volumeInfo.industryIdentifiers[0].identifier : 'Not Available';
  this.date = (bookData.volumeInfo.publishedDate) ? bookData.volumeInfo.publishedDate : 'Not avialable';
  this.cover = (bookData.volumeInfo.imageLinks) ? bookData.volumeInfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
  this.description = (bookData.volumeInfo.description) ? bookData.volumeInfo.description : 'Not avialable';

}


client.connect()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`listening on ${PORT}`)
    );
  });

