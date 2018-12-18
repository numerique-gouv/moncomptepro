#!/usr/bin/env node

require('babel-polyfill');
require('babel-register');

// Import the rest of our application.
module.exports = require('./src/app.js');
