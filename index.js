const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const fileUpload = require('express-fileupload');
const app = express()
const port = 5000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('service'));
app.use(fileUpload());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gbmds.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const houseCollection = client.db(`${process.env.DB_NAME}`).collection("houses");
  const bookingCollection = client.db(`${process.env.DB_NAME}`).collection("bookings");

    // Add House
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
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        houseCollection.insertOne({ title, price, location, bedroom, bathroom, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    // All House Data
    app.get('/allHouseData', (req, res) => {
        houseCollection.find({})
            .toArray((error, document) => {
                res.send(document);
            })
    })

    // Single House Info
    // app.get('/houseDetails', (req, res) => {
    //     const queryId = req.query.id;
    //     houseCollection.find({ _id: queryId })
    //         .toArray((error, document) => {
    //             res.send(document);
    //         })
    // })

    // Add Booking
    app.post('/addBooking', (req, res) => {
        const name = req.body.name;
        const number = req.body.number;
        const email = req.body.email;
        const message = req.body.message;
        const status = req.body.status;
    
        bookingCollection.insertOne({ name, number, email, message, status })
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    // All Booking Data
    app.get('/allBookingData', (req, res) => {
        bookingCollection.find({})
            .toArray((error, document) => {
                res.send(document);
            })
    })

});

app.get('/', (req, res) => {
    res.send("Hello from Apartment Hunt Server");
})

app.listen(process.env.PORT || port);