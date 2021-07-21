const express      = require('express'),
      MongoClient  = require('mongodb').MongoClient,
      ObjectId     = require('mongodb').ObjectId, // !!!
      createError  = require('http-errors'),
      path         = require('path'),
      jsonparser   = express.json(),
      port         = '3002',
      dbUrl        = 'mongodb://localhost:27017/',
      mongoClient  = new MongoClient(dbUrl);

const app          = express();

////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ connect to db ↓↓↓ */
  let dbClient;
  // варіант на колбеках
  mongoClient.connect(function(err, client) {
    if (err) return console.log(err);
    dbClient = client;
    app.locals.collection = client.db("meng").collection("users"); // !!!
    app.listen(3002, function(){
      console.log('server listen on port ' + port)
    });
  });

  // варіант на промісах
  // async function mongoMain(){
  //   await mongoClient.connect();
  //   dbClient = mongoClient;
  //   app.locals.collection = mongoClient.db("meng").collection("users"); // !!!
  //   app.listen(3002, function(){
  //     console.log('server listen on port ' + port)
  //   });
  // }
  // mongoMain()
  //   .catch(console.error)
/* ↑↑↑ /connect to db ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////

// view engine setup
app.set('views', path.join(__dirname, 'templates/'));
app.set('view engine', 'pug');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ work with requests ↓↓↓ */
  // get all users on startup
  app.get('/api/users', function(req,res){
    const collection = req.app.locals.collection; // !!!
    collection.find({}).toArray( function(err,users){

      if (err) return console.log(err);
      res.send(JSON.stringify(users));
    });

    // let result = collection.find({}).toArray();
    // result.then(
    //   function onResult(users){
    //     res.send(JSON.stringify(users));
    //   },
    //   function onError(error){
    //     console.log("error", error);
    //   }
    // );
  });

  // delete user
  app.delete('/api/users/:id', function(req,res){
    const id         = new ObjectId(req.params.id), // !!!
          collection = req.app.locals.collection;

    collection.findOneAndDelete({_id:id}, function(err,result){
      if(err) return console.log(err);

      let user = result.value;
      res.send( JSON.stringify(user) );
    });
  });

  // get one user
  app.get('/api/users/:id', function(req,res){
    const id        = new ObjectId(req.params.id),
         collection = req.app.locals.collection;
    collection.findOne({_id: id},function(err,user){
      if(err) return console.log(err);
      res.send( JSON.stringify(user) );
    });
  });

  // add new user
  app.post('/api/users', jsonparser, function(req,res){
    if (!req.body) {
      res.status(400).send();
      return;
    }
    const user       = req.body,
          collection = req.app.locals.collection;

    collection.insertOne(user, function(err, result){
      if(err) return console.log(err);
      res.send(JSON.stringify(user));
    });
  });

  // change user
  app.put('/api/users/:id', jsonparser, function(req,res){
    if (!req.body) {
      res.status(400).send();
      return;
    }

    const user       = req.body,
          id         = new ObjectId(user.id),
          name       = user.name,
          age        = user.age,
          collection = req.app.locals.collection;

    collection.updateOne(
      {_id: id},
      {$set: {name: name, age: age} },
      function(err,result){
        if (err) throw err;
        res.send(JSON.stringify(user));
      }
    );
  });
/* ↑↑↑ /work with requests ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

// listen for program interruption (ctrl-c)
process.on("SIGINT", () => {
  dbClient.close();
  process.exit();
});