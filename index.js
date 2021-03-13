const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
const methodOverride = require('method-override');
const multer = require('multer');
const Product = require('./models/shop.js');
const { request } = require('http');
const catchAsync = require('./utils/catchAsync.js');
const ExpressError = require('./utils/expressError.js');


mongoose.connect('mongodb://localhost:27017/tenzify', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('connected to Database');
    })
    .catch((err) => {
        console.log(err);
    })

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

//define storage for the image

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
        cb(null, './public/images/uploads');
  },
  filename: function (req, file, cb) {
      cb(null, Date.now()+'-'+file.originalname);
  }
})

//upload parameter for multer
const upload = multer({
    storage: storage
})

app.get('/', async (req, res) => {
    const products = await Product.find();
    res.render('index', { products });
})

//*************ADMIN****************//
app.get('/admin',(req, res)=> {
    res.render('admin')
})
app.post("/add-product", upload.array('image', 12), catchAsync(async (req, res, next) => {
    if (!req.body) throw new ExpressError('Invalid Product Data', 500);
    const files = req.files
    const product = new Product({
        title: req.body.title,
        price: req.body.price,
        description: req.body.description,
        image: files.map(file => {return file.filename })
    })    
    await product.save();
    res.render('admin');
}))

//**********LOGIN*************//
app.get('/login', (req, res) => {
    res.render('login');
})

//**********CART*************//
app.get('/cart', (req, res) => {
    res.render('cart');
})

//**********CHECKOUT*************//
app.get('/checkout', (req, res) => {
    res.render('checkout');
})

//**********CONTACT-US*************//
app.get('/contact', (req, res) => {
    res.render('contact-us');
})

//*************PRODUCT-DETAILS***************//
app.get('/product-details/:id', catchAsync( async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.render('product-details',{product});
}))
//************CATCHING ERROR************//
app.all('/*', (req, res, next) => {
    next(new ExpressError('Page Not Found',404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something Went Wrong';
    res.render('404', { err });
    res.status(statusCode);
})


app.listen(8000, () => {
    console.log('listening to port 8000');
})