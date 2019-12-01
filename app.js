const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');

const app = express();

const router = express.Router();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

indexRouter(router);

app.use(router);

// error handler
app.use((err, req, res, next) => {
  return res.status(err.status || 500).send(JSON.parse(err.message));
});

module.exports = app;
