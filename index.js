#!/usr/bin/env node

require('babel-polyfill');
require('babel-register');
require('dotenv').config();

// Import the rest of our application.
module.exports = require('./src/app.js');
