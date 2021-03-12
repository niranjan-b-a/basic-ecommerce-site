const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
const methodOverride = require('method-override');
const multer = require('multer');
const Product = require('./models/shop.js');
const { request } = require('http');

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
app.post("/add-product", upload.single('image'), async (req, res) => {
    const product = new Product({
        title: req.body.title,
        price: req.body.price,
        description: req.body.description,
        image: (req.file.filename).toString()
    })
    await product.save()
    res.send('hhit');
});

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

//****************PRODUCT-DETALIS*****************//
app.get('/product-details', (req, res)=>{
    res.render('product-details')
})

//**********CONTACT-US*************//
app.get('/contact', (req, res) => {
    res.render('contact-us');
})

//**********ERROR*************//
app.get('/*', (req, res) => {
    res.render('404');
})


app.listen(8000, () => {
    console.log('listening to port 8000');
})