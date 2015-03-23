'use strict';                                                                  
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 
var jobSchema = new Schema({
    id: String,
    date: {type: Date, default: Date.now},
    ticker: String,
    result: String
});

module.exports = mongoose.model('Job', jobSchema);
