var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const methodOverride = require('method-override');


// vključimo mongoose in ga povežemo z MongoDB
var mongoose = require('mongoose');
mongoose.set('strictQuery', true);
var mongoDB = "mongodb+srv://admin:admin@ni-imena.sygmxf2.mongodb.net/ni_imena"
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// vključimo routerje
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/userRoutes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var session = require('express-session');
var MongoStore = require('connect-mongo');
app.use(session({
    secret: 'ni_secreta',
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongoDB })
}));

app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

app.use(methodOverride('_method'));
app.use('/', indexRouter);

app.use('/users', usersRouter);

app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;

