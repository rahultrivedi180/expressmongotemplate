require('module-alias/register');
const compression = require('compression');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const config = require('./config');
const checkCors = require('@middlewares/checkCors');

const app = express();
mongoose
  .connect(config.dburi, {
    useNewUrlParser: true
  })
  .catch(error => {
    console.error(error);
  });

const userRoutes = require('./components/users/userRoutes');

app
  .use(helmet())
  .use(compression())
  .use(morgan('dev'))
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(cookieParser())
  .use(checkCors);

app.use('/api/user', userRoutes);

// error handler
app.use((_req, _res, next) => {
  const error = new Error('Route Not Found');
  error.status = 404;
  next(error);
});

// development error handler
// will print stracktrace
if (app.get('env') === 'development') {
  app.use((error, _req, res) => {
    res.status(error.status || 500);
    res.json({ error: { message: error.message, error } });
  });
}

// production error handler
// no stacktraces
if (app.get('env') === 'production') {
  app.use((error, _req, res) => {
    res.status(error.status || 500);
    res.json({ error: {} });
  });
}

module.exports = app;
