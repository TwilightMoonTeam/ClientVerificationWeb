const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const favicon = require('serve-favicon');
const helmet = require("helmet");
require('dotenv').config();

const indexRouter = require('./routes/index');
const oauthRouter = require('./routes/oauth');
const accountRouter = require('./routes/account');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public',  'favicon.ico')));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "https://cdn.tailwindcss.com", "https://ajax.googleapis.com"],
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
  },
}));

app.use('/', indexRouter);
app.use('/oauth', oauthRouter);
app.use('/account', accountRouter);


// catch 404 and forward to error handler
app.use(async (req, res, next) => {
  next(createError(404));
});

// error handler
app.use(async (err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', { Title: process.env.Title, Company: process.env.Company, Url: process.env.Url, Email: process.env.Email, TwitchName: process.env.TwitchName, TwitchLink: process.env.TwitchLink, YoutubeLink: process.env.YoutubeLink });
});

module.exports = app;
