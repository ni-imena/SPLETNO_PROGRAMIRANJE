var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// vključimo mongoose in ga povežemo z MongoDB
var mongoose = require("mongoose");
mongoose.set("strictQuery", true);
var mongoDB = "mongodb+srv://admin:admin@ni-imena.sygmxf2.mongodb.net/ni_imena";
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// vključimo routerje
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/userRoutes");
var runsRouter = require("./routes/runRoutes");
var weathersRouter = require("./routes/weatherRoutes");
var app = express();

var cors = require("cors");
var allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

var session = require("express-session");
var MongoStore = require("connect-mongo");
app.use(
  session({
    secret: "work hard",
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongoDB }),
  })
);



//Shranimo sejne spremenljivke v locals
//Tako lahko do njih dostopamo v vseh view-ih (glej layout.hbs)
app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/runs", runsRouter);
app.use("/weather", weathersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.render('error');
  res.json(err);
});

module.exports = app;
