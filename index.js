const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const routes = require('./routes/routes');

const app = express();
const PORT = 3500;


app.use(cors({
    origin: 'https://e-com-frontend-steel.vercel.app',
    credentials: true
}));

app.use(bodyParser.json());

mongoose.connect('mongodb+srv://pvraj040503:Vraj%404503@vrajmongodb.yqhnpwe.mongodb.net/?retryWrites=true&w=majority&appName=VrajMongoDB');

const connection = mongoose.connection;

connection.once('open', () => {
    console.log('MongoDB database connection established successfully!');
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', routes);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log('Server is running on Port:', PORT);
});
