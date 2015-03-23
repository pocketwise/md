'use strict';

var express = require('express');
var port    =   process.env.PORT || 8000;
var app = express();

app.get('/', function(req, res) {
    res.send('Job Queue!');  
});

var server = app.listen(port, function () {      
    console.log('Job queue listening on: ', port);
});

