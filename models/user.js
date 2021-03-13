const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    first: String,
    last: String,
    email: String,
    address: [
        {
            
        }
    ]
})