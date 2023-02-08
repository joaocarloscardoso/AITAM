//credentials used in the app
var credentials = require('../credentials.js');

var fs = require('fs'),
    path = require('path');

//logging system
var log = require('./log.js');

function AddActivity(fileid, sessionid, auditfile, snapshot, operation) {
    var id ='';
    if (snapshot==1){
        const crypto = require("crypto");
        id = crypto.randomBytes(16).toString("hex");
        //console.log(id); // => f9b327e70bbcf42494ccb28b2d98e00e
    }
    eventDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') 
    fs.appendFileSync(fileid,operation + '|' + sessionid + '|' +  id + '|' + auditfile + '|' + eventDate +'\r\n');
};

module.exports.AddActivity=AddActivity;