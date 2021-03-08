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
var XMLSerializer = require('xmldom').XMLSerializer;
var iCounter;

function GeneralDomainCharacterization(fileid, selectedLang = credentials.WorkLang) {
    var Catalog = {
        wNumber: '',
        wImportance: ''
    };
    //data about weight number on 7 core domains
    var WeightNumber = [0,0,0,0,0,0,0 ];
    //data about weight importance on 7 core domains
    var WeightImportance = [0,0,0,0,0,0,0];

    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    //core AITAM evaluation
    var vDomains = xpath.select("/Audit/ActiveITAuditDomains/Domain/@nr",doc);
    for (var i=0; i<vDomains.length; i++) {
        var vIssues = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vDomains[i].nodeValue + "']/Area/Issue[@Include='Yes']/@RiskWeight",doc);
        for (var k=0; k<vIssues.length; k++) {
            WeightNumber[(parseInt(vDomains[i].nodeValue)-1)] = parseInt(WeightNumber[(parseInt(vDomains[i].nodeValue)-1)]) + 1;
            WeightImportance[(parseInt(vDomains[i].nodeValue)-1)] = parseInt(WeightImportance[(parseInt(vDomains[i].nodeValue)-1)]) + parseInt(vIssues[k].nodeValue);
        }
    }

    //plugins evaluation
    var vDomains = xpath.select("/Audit/PlugIns/PlugIn/Domain/@nr",doc);
    for (var i=0; i<vDomains.length; i++) {
        var vIssues = xpath.select("/Audit/PlugIns/PlugIn/Domain[@nr='" + vDomains[i].nodeValue + "']/Area/Issue[@Include='Yes']/@RiskWeight",doc);
        for (var k=0; k<vIssues.length; k++) {
            WeightNumber[(parseInt(vDomains[i].nodeValue)-1)] = parseInt(WeightNumber[(parseInt(vDomains[i].nodeValue)-1)]) + 1;
            WeightImportance[(parseInt(vDomains[i].nodeValue)-1)] = parseInt(WeightImportance[(parseInt(vDomains[i].nodeValue)-1)]) + parseInt(vIssues[k].nodeValue);
        }
    }
    
    Catalog.wNumber = WeightNumber.join();
    Catalog.wImportance = WeightImportance.join();
    return Catalog;
};

function GeneralRiskCharacterization(fileid, selectedLang = credentials.WorkLang) {
    var Catalog = {
        wImportance: ''
    };
   //data about weight importance on 7 core domains
    var WeightImportance = [0,0,0];

    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    //core AITAM evaluation
    var vIssues = xpath.select("/Audit/ActiveITAuditDomains/Domain/Area/Issue[@Include='Yes']/@RiskWeight",doc);
    for (var k=0; k<vIssues.length; k++) {
        WeightImportance[(vIssues[k].nodeValue-1)] = parseInt(WeightImportance[(vIssues[k].nodeValue-1)]) + 1;
    }

    //plugins evaluation
    var vIssues = xpath.select("/Audit/PlugIns/PlugIn/Domain/Area/Issue[@Include='Yes']/@RiskWeight",doc);
    for (var k=0; k<vIssues.length; k++) {
        WeightImportance[(vIssues[k].nodeValue-1)] = parseInt(WeightImportance[(vIssues[k].nodeValue-1)]) + 1;
    }
    
    Catalog.wImportance = WeightImportance.join();
    return Catalog;
};

function SpecificDomainCharacterization(fileid, DomainId, selectedLang = credentials.WorkLang) {
    var Catalog = {
        labels:'',
        wNumber: '',
        wImportance: ''
    };
    //data about weight number on areas
    var WeightNumber = 0;
    //data about weight importance on areas
    var WeightImportance = 0;
 
    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    //core AITAM evaluation
    var vAreas = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + DomainId + "']/Area/@nr",doc);
    for (var j=0; j<vAreas.length; j++) {
        WeightNumber = 0;
        WeightImportance = 0;
        var vPointerArea=vAreas[j].nodeValue;
        var vDescrArea=vPointerArea + ' - ' + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + DomainId + "']/Area[@nr='" + vPointerArea + "']/title/tx[@l='" + credentials.WorkLang + "']/@name",doc)[0].nodeValue;
        var vIssues = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + DomainId + "']/Area[@nr='" + vPointerArea + "']/Issue[@Include='Yes']/@RiskWeight",doc);
        for (var k=0; k<vIssues.length; k++) {
            WeightNumber = parseInt(WeightNumber) + 1;
            WeightImportance = parseInt(WeightImportance) + parseInt(vIssues[k].nodeValue);
        }
        if (Catalog.labels === ''){
            Catalog.labels = vDescrArea.substring(0, 20) + "...";
            Catalog.wNumber = WeightNumber.toString();
            Catalog.wImportance = WeightImportance.toString();
        } else {
            Catalog.labels = Catalog.labels + '|' + vDescrArea.substring(0, 20) + "...";
            Catalog.wNumber = Catalog.wNumber + ',' + WeightNumber.toString();
            Catalog.wImportance = Catalog.wImportance + ',' + WeightImportance.toString();
        }
    }

    //plugins evaluation
    var vAreas = xpath.select("/Audit/PlugIns/PlugIn/Domain[@nr='" + DomainId + "']/Area/@nr",doc);
    for (var j=0; j<vAreas.length; j++) {
        WeightNumber = 0;
        WeightImportance = 0;
        var vPointerArea=vAreas[j].nodeValue;
        var vDescrArea=vPointerArea + ' - ' + xpath.select("/Audit/PlugIns/PlugIn/Domain[@nr='" + DomainId + "']/Area[@nr='" + vPointerArea + "']/title/tx[@l='" + credentials.WorkLang + "']/@name",doc)[0].nodeValue;
        var vIssues = xpath.select("/Audit/PlugIns/PlugIn/Domain[@nr='" + DomainId + "']/Area[@nr='" + vPointerArea + "']/Issue[@Include='Yes']/@RiskWeight",doc);
        for (var k=0; k<vIssues.length; k++) {
            WeightNumber = parseInt(WeightNumber) + 1;
            WeightImportance = parseInt(WeightImportance) + parseInt(vIssues[k].nodeValue);
        }
        if (Catalog.labels === ''){
            Catalog.labels = vDescrArea.substring(0, 20) + "..." ;
            Catalog.wNumber = WeightNumber.toString();
            Catalog.wImportance = WeightImportance.toString();
        } else {
            Catalog.labels = Catalog.labels + '|' + vDescrArea.substring(0, 20) + "...";
            Catalog.wNumber = Catalog.wNumber + ',' + WeightNumber.toString();
            Catalog.wImportance = Catalog.wImportance + ',' + WeightImportance.toString();
        }
    }

    return Catalog;
};

module.exports.GeneralDomainCharacterization = GeneralDomainCharacterization;
module.exports.GeneralRiskCharacterization = GeneralRiskCharacterization;
module.exports.SpecificDomainCharacterization = SpecificDomainCharacterization;