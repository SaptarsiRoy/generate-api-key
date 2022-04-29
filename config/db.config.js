require('dotenv').config()
const mongoose = require('mongoose');

const URI = process.env.MONGODB_URI

mongoose.connect(URI);


module.exports = mongoose.connection;