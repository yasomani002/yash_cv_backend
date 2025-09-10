const mongoose = require('mongoose')


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGOOSEURI)
        console.log('MongoDB Connected');
    } catch (error) {
        console.log('MongoDB connection error', error)
        process.exit(1)
    }
}
module.exports = connectDB