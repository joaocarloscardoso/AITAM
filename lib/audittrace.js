//credentials used in the app
var credentials = require('../credentials.js');
var globalvalues = require('../globalvalues.js');

var fs = require('fs'),
    path = require('path');

//logging system
var log = require('./log.js');

//database
var database = require('./db.js');

function AddActivity(fileid, sessionid, auditfile, snapshot, operation, type) {
    var id ='';
    const searchRegExp = '\\';
    const replaceRegExp = '|';
    eventDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') 
    if (snapshot==1){
        const crypto = require("crypto");
        id = crypto.randomBytes(16).toString("hex");
        //console.log(id); // => f9b327e70bbcf42494ccb28b2d98e00e
        fs.appendFileSync(fileid,'{"type":"' + type + '", "operation":"' + operation + '", "session":"' + sessionid + '", "snapshot":"' +  id + '", "auditFile":"' + auditfile.replaceAll(searchRegExp, replaceRegExp) + '", "event":"' + eventDate +'"},\r\n');

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

function GeneralOpCharacterization(fileid, selectedLang = credentials.WorkLang) {
    var Catalog = {
        wImportance: ''
    };
    //data about operation type as an array:
    //wLoad_General: 0,
    //wPlan: 0,
    //wFindings: 0,
    //wRecommendations: 0,
    //wAnalytical: 0
    var WeightImportance = [0,0,0,0,0];

    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    //remove last 3 characters (the comma + LF + CR)
    //var data=data.substring(0, data.length - 2);
    data='[' + data.slice(0, -3) + ']'; 
    // Create a JSON document:
    var doc = JSON.parse(data);

    //operation type evaluation evaluation
    //var vIssues = xpath.select("/Audit/ActiveITAuditDomains/Domain/Area/Issue[@Include='Yes']/@RiskWeight",doc);
    //for (var k=0; k<vIssues.length; k++) {
    //    WeightImportance[(vIssues[k].nodeValue-1)] = parseInt(WeightImportance[(vIssues[k].nodeValue-1)]) + 1;
    //};
    
    Catalog.wImportance = WeightImportance.join();
    return Catalog;
};

module.exports.AddActivity=AddActivity;
module.exports.GeneralOpCharacterization=GeneralOpCharacterization;