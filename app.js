
const express = require('express');
var createError = require('http-errors');
const app = express();
//const upload = require('./middlewares/multer');
const path = require('path');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const multer = require("multer");
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const mongoDbStore = require("connect-mongodb-session")(session)
const logger = require('morgan');
require("dotenv").config();
require('./helpers/handlebarsHelpers');
const clearCache = require('./middlewares/cache');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const productRouter = require('./routes/product');
const orderRouter = require('./routes/orders');
//var fileUpload=require('express-fileupload')
const port = process.env.PORT ||3000;

const connectDb= require('./config/connection')
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//const hbs=require('express-handlebars')
// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'hbs');
//app.use(fileUpload());
app.use(clearCache)
app.use(session({
  secret:process.env.SESSION_SECRET,
  resave:false,
  saveUninitialized:false,
  cookie:{maxAge:600000 * 24},
  store:new mongoDbStore({mongooseConnection:connectDb})  
}))
app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'hbs');
app.engine(
  'hbs',exphbs.engine({
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true
  },
    extname:'.hbs',
    defaultLayout:'userLayout',
    layoutsDir:path.join(__dirname,'views/layout'),
  partialsDir:path.join(__dirname,'views/partials'),
  helpers: {
    multiply: (value1, value2) => value1 * value2
  }
  //  helpers: {
  //   eq: (a, b) => a === b
  //  }
  }));
   // app.use(fileUpload())
app.use(logger('dev'));


app.use(cookieParser());
// app.use(express.static(__dirname, 'public'));
//app.use('/',express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname,"public")));
app.use(express.static(path.join(__dirname,"public/admin")));
app.use('/product',express.static(path.join(__dirname,"public/")));
app.use('/admin',express.static(path.join(__dirname,"public/")));
app.use('/orders',express.static(path.join(__dirname,"public/")));

//app.use(express.static(__dirname + "/public"));

//app.use("/images", express.static(path.join(__dirname, "/images")));
//app.set("view engine", "hbs");
app.use('/', userRouter);
app.use('/admin', adminRouter);
app.use('/',productRouter);
app.use('/',orderRouter);
// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
module.exports = app;
