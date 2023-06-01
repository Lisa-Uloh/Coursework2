const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs')
const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/images', express.static(path.join(__dirname, 'images')));

// MongoDB Connection
const mongoURL = 'mongodb+srv://lisaedidiong:Lisa%402023@cluster0.cc6idnu.mongodb.net/test';
const dbName = 'course_work_2';
let db; // Initialize db variable

// Connect to MongoDB
MongoClient.connect(mongoURL, { useUnifiedTopology: true }, function (err, client) {
    if (err) {
        console.error('Error connecting to MongoDB:', err);
    }

    db = client.db("course_work_2"); // Assign db instance
});

// Middleware - Logger
app.use(function (req, res, next){
  console.log(`${req.method} ${req.url}`);
  next();
});

// Middleware - Static File
app.use((req, res, next) => {
  const imagePath = path.join(__dirname, 'images', req.url);
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    next()
    
  }
});

app.param('collectionName', function (req, res, next, collectionName){
    req.collection = db.collection(collectionName)
    return next()
})



//retrieve all the objects from the collection
app.get('/collection/:collectionName',(req, res, next) =>{
    req.collection.find({}).toArray((e, results) =>{
        if (e) return next(e)
        res.send(results)
    })
})

app.get('searchLessons/collection/:collectionName',(req, res, next) =>{
    req.collection.find({}).toArray((e, results) =>{
        if (e) return next(e)
        res.send(results)
    })
})

//Addig post
app.post('/collection/:collectionName', (req, res, next) =>{
    req.collection.insert(req.body, (e, results) =>{
        if(e) return next(e)
        res.send(results.ops)
    })
})

//return with object id

app.get('/collection/:collectionName/:id', (req,res, next) => {
    req.collection.findOne({ _id: new ObjectID(req.params.id)}, (e, result) => {
        if(e) return next(e)
        res.send(result)
    })
})

//update an object
app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.update({
        _id: new ObjectID(req.params.id)
    },
    {
        $set: req.body
    },
    {
        safe: true, multi:false
    },
    (e, result) => {
        if(e) return next(e)
        res.send((result.result.n === 1) ? {msg: 'success'} : {msg: 'error'})
    })
})

//Delete
app.delete('/collection/:collectionName/:id', (req, res, next) =>{
    req.collection.deleteOne(
        {_id: ObjectID(req.params.id)},(e, result)=>
        {
            if (e) return next(e)
            res.send((result.result.n === 1) ? 
            {msg: 'success'} : {msg: 'error'}
            )
        }
    )
})

// app.listen(3000,()=>{
//     console.log(`listening on http://localhost:${3000}`)
// })
app.listen(port, function () {
    console.log(`Server running on port ${port}`);
});