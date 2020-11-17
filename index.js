const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g75lc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('rents'));
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
    res.send("Apartment Hunt Server is working!")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const rentsCollection = client.db("apartmentHunt").collection("rents");
    const bookingsCollection = client.db("apartmentHunt").collection("bookings");

    app.post('/addHouse', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const price = req.body.price;
        const location = req.body.location;
        const bedroom = req.body.bedroom;
        const bathroom = req.body.bathroom;
        const newImg = file.data;
        const encImg = newImg.toString('base64');
    
        var image = {
            contentType: req.files.file.mimetype,
            size: req.files.file.size,
            img: Buffer.from(encImg, 'base64')
        };
    
        rentsCollection.insertOne({ title, price, location, bedroom, bathroom, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
        })
    
    app.get('/rents', (req, res) => {
        rentsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/addRequest', (req, res) => {
        const name = req.body.name;
        const number = req.body.number;
        const email = req.body.email;
        const message = req.body.message;

        bookingsCollection.insertOne({ name, number, email, message })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
        })
    
    app.get('/bookings', (req, res) => {
        bookingsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

});


app.listen(process.env.PORT || port);