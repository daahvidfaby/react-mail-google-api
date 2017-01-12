var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');

var app = new express();
app.use(bodyParser.json());


app.set('views', './views');
app.set('view engine', 'pug');


app.get('/', function(req, res){
  db.query('SELECT * FROM posts', function(err, response){
    res.render('index', {'posts': JSON.stringify(response)});
    res.end;
  });
    
});

app.get('/posts', function(req, res){
  db.query('SELECT * FROM posts', function(err, response){
    res.json(JSON.stringify(response));
    res.end();
  });   
});

app.get('/posts/:id', function(req, res){
  db.query('SELECT * FROM posts WHERE id = ?', parseInt(req.params.id, 10), function(err, response){
    res.json(JSON.stringify(response));
    res.end();
  });
});

app.post('/posts', function(req, res){
  var data = req.body;
  db.query('INSERT INTO posts (title, content, date) values(?, ?, NOW())', [data.title, data.content],
      function(err, response){
          res.json(JSON.stringify(response.insertId));
          res.end();
      }
  );  
});

app.put('/posts', function(req, res){
  var data = req.body;
  db.query('UPDATE posts SET title = ?, content = ? WHERE id = ?', [data.title, data.content, data.id],
      function(err, response){
          res.json(JSON.stringify(response.insertId));
          res.end();
      }
  );    
});

app.delete('/posts', function(req, res){
  console.log('new post action');
  res.send('post created');
  res.end;  
});

var db = mysql.createPool({
    connectionLimit: 10,
    host:'base.iha.unistra.fr',
    user:'faby',
    password:'dav8216',
    database:'faby_api_rest'
});

app.listen(44444);