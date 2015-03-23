'use strict';

var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var Job = require('./job.js');

var port = process.env.PORT || 8000;
var app = express();


// Setup Job Queue
var kue = require('kue');
var jobs = kue.createQueue({
    "prefix": "md",
    "redis": {
        "port": "9387",
        "host": "cobia.redistogo.com",
        "auth": "1ee5fc3eabd2bccdbd72a342754b944c"
    }
});

// Setup MongoDB to store job results
mongoose.connect('mongodb://heroku_app35071179:jj9hjgikl4k7oueoua3ckrakga@ds031661.mongolab.com:31661/heroku_app35071179');

// Task: get ticker response from Google Finance
var lookup = function(job, done) {
    var ticker = job.data.ticker;
    if(!(ticker)) {
        return done(new Error('invalid ticker'));
    } else {
    // check sticker price
        var options = {
            hostname: 'finance.google.com',
            port: 80,
            path: '/finance/info?client=ig&q=' + ticker,
            method: 'GET'
        };
        http.get(options, function(res){
            var buffer = '';
            var data;
            res.on('data', function(chunk){
                buffer += chunk;  
            })
            res.on('end', function(){
                console.log('buffer is: ', buffer);
                new Job({id: job.id, ticker: ticker, result: buffer}).save();
            })
        });
        
        done();
    }
};

jobs.process('ticker', function(job, done){
    console.log('job id: ', job.id);
    lookup(job, done); 
});

app.use(kue.app);

var server = app.listen(port, function () {      
    console.log('Job queue listening on: ', port);
});
