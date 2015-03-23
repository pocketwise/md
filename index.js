'use strict';

var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var Job = require('./job.js');

var port = process.env.PORT || 8000;
var app = express();

// Setup MongoDB to store job results
mongoose.connect('mongodb://heroku_app35071179:jj9hjgikl4k7oueoua3ckrakga@ds031661.mongolab.com:31661/heroku_app35071179');

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

// Task: get ticker response from Google Finance
var lookup = function(job, done) {
    var ticker = job.data;
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

// process all jobs
jobs.process('ticker', function(job, done){
    lookup(job, done); 
});

// expose api
app.use('/api', kue.app);

// view results
app.get('/view/:id', function(req, res){
    Job.findOne({id: req.params.id}, function(err, callback){
       if (err) {
           res.send(err);
       } else {
           res.send(JSON.stringify(callback));
       }
    });
});

// main UI
app.get('/', function(req, res){
    var html = '<h1>Job Queue with NodeJS</h1><h3>Job: Lookup ticker from google finance</h3>' +
        '<form method="post" action="/api/job">' +
        ' <input name="type" type="hidden" value="ticker" value="ticker"/>' +
        ' Enter ticker: <input name="data" type="text" value="GOOG" size="10" />' +
        ' <input type="submit" value="Add Job" />' +
        '</form>' + 
        '<h3>Useful Links</h3><p><a href="/api/stats">Stats</a></p>' +
        '<p>View job status: http://massdrop.herokuapp.com/api/job/[job id]</p>' + 
        '<p>View job result: http://massdrop.herokuapp.com/view/[job id]</p>';
    res.send(html); 
});


app.listen(port, function () {      
    console.log('Job queue listening on: ', port);
});
