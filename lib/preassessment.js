//credentials used in the app
var credentials = require('../credentials.js');

var fs = require('fs'),
    path = require('path');

//logging system
var log = require('./log.js');
//credentials used in the app
var credentials = require('../credentials.js');

var xpath   = require('xpath');
var Dom     = require('xmldom').DOMParser;
var XMLSerializer = require('xmlserializer');

function LoadPreAssessment(fileid, selectedLang = credentials.WorkLang) {
    var Catalog = [];

    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);
    
    var areas = xpath.select("/Audit/Preassessment/paArea/@nr",doc);
    if (areas[0] != null){
        for (var i=0; i<areas.length; i++) {
            var areaDescr = xpath.select("/Audit/Preassessment/paArea[@nr='" + areas[i].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc);
            var issues = xpath.select("/Audit/Preassessment/paArea[@nr='" + areas[i].nodeValue + "']/paIssue/@nr",doc);
            if (issues[0] != null){
                for (var j=0; j<issues.length; j++) {
                    var NewEntry = {
                        Area:'',
                        AreaId: '',
                        Issue:'',
                        IssueId:''
                    };
                    NewEntry.AreaId = areas[i].nodeValue;
                    if (areaDescr.length==1 && areaDescr[0] != null)
                        NewEntry.Area = areaDescr[0].nodeValue;
                    NewEntry.IssueId = issues[j].nodeValue;

                    var issueDescr = xpath.select("/Audit/Preassessment/paArea[@nr='" + NewEntry.AreaId + "']/paIssue[@nr='" + NewEntry.IssueId + "']/title/tx[@l='" + selectedLang + "']/@name",doc);
                    if (issueDescr.length==1 && issueDescr[0] != null)
                        NewEntry.Issue = issueDescr[0].nodeValue;

                    Catalog.push(NewEntry);                    
                }
            }
        }
    }
    return Catalog;
};

module.exports.LoadPreAssessment = LoadPreAssessment;
