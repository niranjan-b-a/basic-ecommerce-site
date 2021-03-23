// CREATING MODEL FOR SHOP PAGE OR HOME PAGE TO ADD PRODUCT
const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;


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
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
}
)

addProductSchema.post('findOneAndDelete',async function (doc) {
    if (doc) {
        Review.remove({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

const Product = mongoose.model('Product', addProductSchema);

module.exports = Product;