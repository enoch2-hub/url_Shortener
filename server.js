if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const shortid = require('shortid');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 82;
const MONGODB_URI = process.env.dbUrl;

app.use(bodyParser.json());
app.use(cors())

// Connect to MongoDB
const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
let db;

client.connect()
    .then(() => {
        db = client.db('urlShortenerDB');
        console.log('Connected to MongoDB');
    })
    .catch(err => console.error('Error connecting to MongoDB:', err));


app.use(express.static(path.join(__dirname, 'public')));


app.use((req, res, next) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'))
})




app.post('/api/shorten', async (req, res) => {
    const { originalUrl } = req.body;
    console.log(originalUrl)

    // Check if the original URL is valid
    // You may want to add more validation logic here

    // Generate a unique short ID using the shortid library
    const shortId = shortid.generate();

    // Create the shortened URL
    const shortenedUrl = `http://Website:${PORT}/${shortId}`;

    // Store the mapping in the MongoDB database
    await db.collection('urls').insertOne({ shortId, originalUrl });

    res.json({ shortenedUrl });
});

app.get('/:shortId', async (req, res) => {
    const { shortId } = req.params;

    // Retrieve the original URL from MongoDB
    const urlRecord = await db.collection('urls').findOne({ shortId });

    if (urlRecord) {
        // Redirect to the original URL
        res.redirect(urlRecord.originalUrl);
    } else {
        // Short ID not found
        res.status(404).send('Not Found');
    }
});








app.listen(PORT, () => {
    console.log(`CORS-enabled web server listening on port ${PORT} and Server is running on http://localhost:${PORT}`);
});
