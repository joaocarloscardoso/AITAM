//credentials used in the app
var credentials = require('../credentials.js');
var globalvalues = require('../globalvalues.js');

var fs = require('fs'),
    path = require('path');

//logging system
var log = require('./log.js');

//database
var database = require('./db.js');

function AddActivity(fileid, sessionid, auditfile, snapshot, operation) {
    var id ='';
    eventDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') 
    if (snapshot==1){
        const crypto = require("crypto");
        id = crypto.randomBytes(16).toString("hex");
        //console.log(id); // => f9b327e70bbcf42494ccb28b2d98e00e
        fs.appendFileSync(fileid,operation + '|' + sessionid + '|' +  id + '|' + auditfile + '|' + eventDate +'\r\n');

        var NewAuditdata = fs.readFileSync(auditfile, { encoding : 'UTF-8' });
        
        var snapshot = {
            sessionid: sessionid,
            auditfile: auditfile,
            snapshotid: id,
            doc: NewAuditdata
        };
        return new Promise(function(resolve, reject){
            database.InsertHistory(snapshot, credentials.mongoDB.colhistory).then(function(Result){
                resolve(Result);
            });
        });

    }
};

module.exports.AddActivity=AddActivity;