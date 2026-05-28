require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var swaggerUi = require('swagger-ui-express');
var swaggerFile;
try {
  swaggerFile = require('./swagger.json');
} catch (err) {
  // Fallback minimal OpenAPI spec when swagger.json is not present
  swaggerFile = {
    openapi: '3.0.0',
    info: { title: 'App API', version: '1.0.0', description: 'Auto-generated minimal spec' },
    paths: {}
  };
}

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var usersRouter = require('./routes/users');
var tweetsRouter = require('./routes/tweets');
const { authenticateTokenFromHeaders } = require("./middleware/auth");
const tweetController = require("./controllers/tweetController");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
const allowedOrigins = [
  "https://henriquecandls.github.io",
  "https://henriquecandls.github.io/twitter-clone",
  "https://henriquecandls.github.io/twitter-clone-main",
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Authorization"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/tweets', tweetsRouter);
app.get('/api/feed', authenticateTokenFromHeaders, tweetController.getFeed);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
