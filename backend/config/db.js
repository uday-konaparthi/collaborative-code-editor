const mongoose = require('mongoose');

const connectDB = async() => {

  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('MongoDB connected');
      // Start your server or continue with queries here
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
    });
}

module.exports = connectDB