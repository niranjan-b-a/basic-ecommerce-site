const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    name: String,
    email: String,
    body: String,
    rating: Number,
    date: {
        type: Date,
        default: Date.now()
    }
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;