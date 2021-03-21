// CREATING MODEL FOR SHOP PAGE OR HOME PAGE TO ADD PRODUCT
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');


const addProductSchema = new Schema({
    title: {
        type: String,
        require : true
    },
    price: {
        type: Number,
        require
    },
    description: String,
    image: [{ type: String }],
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
}
)

const Product = mongoose.model('Product', addProductSchema);

module.exports = Product;