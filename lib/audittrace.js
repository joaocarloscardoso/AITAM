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

        if (credentials.trace == 'Yes'){
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
        };
    }
};

function RestoreSnapshot(sessionid, snapshot) {
    if (credentials.trace == 'Yes'){
        var dbparams = { sessionid: sessionid, snapshotid: snapshot };
        var dbfields = { _id: 0, doc: 1 };
        var sortfields = {"sessionid": -1};
    
        return new Promise(function(resolve, reject){
            database.QueryHistory(dbparams, dbfields, sortfields, credentials.mongoDB.colhistory).then(function(Result){
                var doc = new Dom().parseFromString(Result[0].doc);
                resolve(doc);
            });
        });        
    } else {
        var doc='';
        return doc;
    };
};

function DeleteActivity(sessionid) {
    if (credentials.trace == 'Yes'){
        var dbparams = { sessionid: sessionid };
        database.DeleteHistory(dbparams);
        return true;    
    } else {
        return true;
    };
};

function GeneralOpCharacterization(fileid, selectedLang = credentials.WorkLang) {

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
    var groupNumber = 0;

    var Catalog = {
        wType: '',
        wTotal: 0,
        wFirstInteraction:'',
        wLastInteraction:'',
        wRawData: doc,
        wEvents:''
    };

    const vDocLength = doc.length;
    //operation type evaluation evaluation
    for (var k=0; k<vDocLength; k++) {
        if (doc[k].type == 'Load/General'){
            WeightImportance[0] +=1;
            groupNumber=1;
        } else if (doc[k].type == 'Plan'){
            WeightImportance[1] +=1;
            groupNumber=2;
        } else if (doc[k].type == 'Findings'){
            WeightImportance[2] +=1;
            groupNumber=3;
        } else if (doc[k].type == 'Recommendations'){
            WeightImportance[3] +=1;
            groupNumber=4;
        } else if (doc[k].type == 'Analytical'){
            WeightImportance[4] +=1;
            groupNumber=5;
        };
        Catalog.wTotal +=1;
        if (k === 0){
            Catalog.wFirstInteraction=doc[k].event;
        }
        Catalog.wLastInteraction=doc[k].event;
        var NewEntry = '{id:' + (k+1) + ',content:"' + doc[k].operation + '<br/><a href=\'./restoreaudit?src=' + doc[k].snapshot + '\'><b>Restore version</b></a>",editable:false,start:"' + doc[k].event + '",group:' + groupNumber +'}';
        if (Catalog.wEvents==''){
            Catalog.wEvents=NewEntry;
        }else{
            Catalog.wEvents=Catalog.wEvents+','+NewEntry;
        };
    };
    
    Catalog.wType = WeightImportance.join();
    return Catalog;
};

module.exports.AddActivity=AddActivity;
module.exports.GeneralOpCharacterization=GeneralOpCharacterization;
module.exports.RestoreSnapshot=RestoreSnapshot;
module.exports.DeleteActivity=DeleteActivity;