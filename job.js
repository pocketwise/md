'use strict';

var express = require('express');
var port = 8001; // user 8001 to serve job queue
var app = express();

var kue = require('kue');
var jobs = kue.createQueue({
    "prefix": "md",
    "redis": {
        "port": "9387",
        "host": "cobia.redistogo.com",
        "auth": "1ee5fc3eabd2bccdbd72a342754b944c"
    }
});

var lookup = function(ticker, done) {
    if(!(ticker)) {
        return done(new Error('invalid ticker'));
    } else {
    // check sticker price
        
        done();
    }
};

app.use(kue.app);

var server = app.listen(port, function () {      
    console.log('Job queue listening on: ', port);
});

