const mongoose = require('mongoose');

const connectDB = async() => {

  mongoose.connect(process.env.MONGO_URI  || `mongodb+srv://udayee005:Jalsa_4K@music-app.sor6jsx.mongodb.net/code-editor`)
    .then(() => {
      console.log('MongoDB connected');
      // Start your server or continue with queries here
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
    });
}

module.exports = connectDB