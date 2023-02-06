//credentials used in the app
var credentials = require('../credentials.js');

var fs = require('fs'),
    path = require('path');

//logging system
var log = require('./log.js');

function AddActivity(fileid, operation) {
    eventDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') 
    fs.appendFileSync(fileid,operation + '|' + eventDate +'\r\n');
};

module.exports.AddActivity=AddActivity;