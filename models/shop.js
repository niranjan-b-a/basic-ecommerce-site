// CREATING MODEL FOR SHOP PAGE OR HOME PAGE TO ADD PRODUCT
const mongoose = require('mongoose');


const addProductSchema = new mongoose.Schema({
    title: {
        type: String,
        require : true
    },
    price: {
        type: Number,
        require
    },
    description: String,
    image: String
}
)

const Product = mongoose.model('Product', addProductSchema);

module.exports = Product;