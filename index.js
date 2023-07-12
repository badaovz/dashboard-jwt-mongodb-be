const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');

dotenv.config();
const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URL, () => {
    console.log('Mongo connect success!');
});

const PORT = process.env.PORT || 8080;
app.get('/', function (req, res) {
    res.send('hello world');
});
app.use('/auth', authRoute);
app.use('/user', userRoute);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
