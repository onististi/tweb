var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var movieRouter = require('./routes/movies');
var authRouter = require('./routes/auth'); // Aggiunto questo import
require('./config/db'); // Importa la connessione al database

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', indexRouter);
app.use('/api/movies', movieRouter);
app.use('/api/auth', authRouter); // Aggiunta questa riga per montare le route di autenticazione

//middleware per bloccare richieste che non sono API
app.use((req, res, next) => {
  if (!req.originalUrl.startsWith('/api'))
    next(createError(403, "Solo API consentite"));
  else
    next(); // Aggiunto else next() per permettere alle API di continuare
});

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
//server da rendere solo per le api e non anche per visualizzazioni