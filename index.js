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
const Review = require('./models/review');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const cookieParser = require('cookie-parser');
const { isLoggedIn, isAuthor, validateReview, isReviewAuthor } = require('./middleware');


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

const sessionConfig = {
    secret: "changethislater",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate({usernameField: 'email'})));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
})

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
app.get('/admin', isLoggedIn, (req, res) => {
    if (req.user.email === 'niranjangowda821@gmail.com') {
        return res.render('admin')   
    }
    req.flash('error','you are not authorized')
    res.redirect('/');
})
app.post("/add-product", isLoggedIn,upload.array('image', 12), catchAsync(async (req, res, next) => {
    if (!req.body) throw new ExpressError('Invalid Product Data', 500);
    const files = req.files
    const product = new Product({
        title: req.body.title,
        price: req.body.price,
        description: req.body.description,
        author: req.user._id,
        image: files.map(file => {return file.filename })
    })    
    await product.save();
    res.render('admin');
}))

//**********REGISTER AND LOGIN*************//
app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/register', catchAsync(async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username });
        const registerUser = await User.register(user, password);
        req.login(registerUser, err => {
            if (err) {
                return next(err);
            }
            res.redirect('/')
            req.flash('success',req.user.username)
        })
    } catch (e) {
        console.log(e)
        req.flash('error', e.message);
        res.redirect('/login');
    }
}))

app.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome Back')
    const redirectUrl = req.session.returnUrl || '/';
    delete req.session.returnUrl;
    res.redirect(redirectUrl);
})

app.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    res.redirect('/');
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
app.get('/contact-us', (req, res) => {
    res.render('contact-us');
    console.log(req.user);
})

//*************PRODUCT-DETAILS***************//
app.get('/product-details/:id', catchAsync( async (req, res) => {
    const product = await Product.findById(req.params.id).populate({ path: 'reviews', populate: {path: 'author'}}).populate('author');
    res.render('product-details',{product});
}))
    //DELETE-PRODUCT//
app.delete('/product/:id/delete',isLoggedIn,isAuthor, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.redirect(`/`);
}))

//***************REVIEWS*****************/
app.post('/product-details/:id/review',isLoggedIn, isReviewAuthor, validateReview, catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    product.reviews.push(review);
    await review.save();
    await product.save();
    res.redirect(`/product-details/${product._id}`)
}))
    //DELETE REVIEW /
app.delete('/product-details/:id/review/:reviewId',isLoggedIn, catchAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    await Product.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/product-details/${id}`);
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