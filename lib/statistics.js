//credentials used in the app
var credentials = require('../credentials.js');

var fs = require('fs'),
    path = require('path');

//logging system
var log = require('./log.js');
//credentials used in the app
var credentials = require('../credentials.js');

//obtain method for risk rank
var riskRank = require('./docgeneration.js');

var xpath   = require('xpath');
var Dom     = require('@xmldom/xmldom').DOMParser;
var XMLSerializer = require('xmlserializer');
var stringSimilarity = require('string-similarity');
var iCounter;

function GeneralDomainCharacterization(fileid, selectedLang = credentials.WorkLang) {
    var Catalog = {
        wNumber: '',
        wImportance: '',
        wRiskRank: '',
        wLabels: ''
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
    //issue #146
    var data = riskRank.LoadPlanHeatMatrix(fileid, selectedLang);
    for (var j=0; j<data.Domains.length; j++) {
        if (Catalog.wLabels != ''){
            Catalog.wLabels = Catalog.wLabels + '|' + data.Domains[j].Domain;   
        } else {
            Catalog.wLabels = data.Domains[j].Domain;   
        };
        if (Catalog.wRiskRank != ''){
            Catalog.wRiskRank = Catalog.wRiskRank + ',' + data.Domains[j].rank.toString();   
        } else {
            Catalog.wRiskRank = data.Domains[j].rank.toString();   
        };

    };
    //end issue
    //console.log(Catalog.wRiskRank);
    //console.log(Catalog.wLabels);

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
        name:'',
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
    Catalog.name=xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + DomainId + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;

    var vAreas = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + DomainId + "']/Area/@nr",doc);
    for (var j=0; j<vAreas.length; j++) {
        WeightNumber = 0;
        WeightImportance = 0;
        var vPointerArea=vAreas[j].nodeValue;
        var vDescrArea=vPointerArea + ' - ' + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + DomainId + "']/Area[@nr='" + vPointerArea + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
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
        var vDescrArea=vPointerArea + ' - ' + xpath.select("/Audit/PlugIns/PlugIn/Domain[@nr='" + DomainId + "']/Area[@nr='" + vPointerArea + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
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

function GetTimelineStatus(fileid, selectedLang = credentials.WorkLang) {
    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    var AuditTimeline = { 
        reference: GetReferenceStatus(doc, selectedLang),
        plugins: GetPluginsStatus(doc, selectedLang),
        preassement: GetPreAssessmentStatus(doc, selectedLang),
        plan: GetPlanningStatus(doc, selectedLang),
        findings: GetFindingStatus(doc, selectedLang),
        recommendations: GetRecommendationStatus(doc, selectedLang)
    };

    //console.log(AuditTimeline);
    return AuditTimeline;
}

function GetReferenceStatus(doc, selectedLang = credentials.WorkLang) {
    var ReferenceStatus ='notFilled';
    var AuditReference = {
        AuditId: '',
        Title: '',
        Background:'',
        Scope:''
    };
    //var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    //var doc = new Dom().parseFromString(data);
    
    var res = xpath.select("/Audit/About/@id",doc);
    if (res.length==1 && res[0] != null)
        AuditReference.AuditId = res[0].nodeValue;            

    var res = xpath.select("/Audit/About/title/tx/@name",doc);
    if (res.length==1 && res[0] != null)
        AuditReference.Title = res[0].nodeValue;

    var res = xpath.select("/Audit/Background/ak",doc);
    if (res.length==1 && res[0].firstChild != null)
        AuditReference.Background = res[0].firstChild.nodeValue;

    var res = xpath.select("/Audit/Scope/ak",doc);
    if (res.length==1 && res[0].firstChild != null)
        AuditReference.Scope = res[0].firstChild.nodeValue;

    if (AuditReference.AuditId != '' && AuditReference.Title != '' && AuditReference.Background != '' && AuditReference.Scope != ''){
        ReferenceStatus ='filled';
    } else{
        if (AuditReference.AuditId != '' || AuditReference.Title != '' || AuditReference.Background != '' || AuditReference.Scope != ''){
            ReferenceStatus ='partial';
        };
    };

    return ReferenceStatus;

};

function GetPluginsStatus(doc, selectedLang = credentials.WorkLang) {
    var pluginsStatus=0;

    //var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    //var doc = new Dom().parseFromString(data);

    var vItemsId = xpath.select("/Audit/PlugIns/PlugIn/@id",doc);
    pluginsStatus=vItemsId.length;

    return pluginsStatus;
};

function GetFindingStatus(doc, selectedLang = credentials.WorkLang) {
    var findingStatus=0;

    //var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    //var doc = new Dom().parseFromString(data);

    var vItemsId = xpath.select("/Audit/Cases/Case/@nr",doc);
    findingStatus=vItemsId.length;

    return findingStatus;
};

function GetRecommendationStatus(doc, selectedLang = credentials.WorkLang) {
    var recommendationStatus=0;

    //var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    //var doc = new Dom().parseFromString(data);

    var vItemsId = xpath.select("/Audit/Recommendations/Recommendation/@nr",doc);
    recommendationStatus=vItemsId.length;

    return recommendationStatus;
};

function GetPreAssessmentStatus(doc, selectedLang = credentials.WorkLang) {
    var PreAssessmentStatus ='filled';

    var FilePreAssessPath = credentials.CoreSetPath + 'ITAuditHandbookPreActivities.xml' ;
    var dataPreAssess = fs.readFileSync(FilePreAssessPath, { encoding : 'UTF-8' });
    //var doc1 = new Dom().parseFromString(dataPreAssess);

    //var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    //var doc = new Dom().parseFromString(data);
    var data2Compare = xpath.select("/Audit/Preassessment",doc);

    writetofile = XMLSerializer.serializeToString(data2Compare[0]);
    //doc = new Dom().parseFromString(writetofile);    

    //var compare = require('dom-compare').compare, result;

    // compare to DOM trees, get a result object
    result = stringSimilarity.compareTwoStrings(dataPreAssess, writetofile);

    //var compare = require('dom-compare').compare;
    //var compare = DomRequire.compare;
    //var result = compare(doc1, doc);
    
    if (result>=0.97){
        PreAssessmentStatus ='notFilled';
    };

        return PreAssessmentStatus;
}

function GetPlanningStatus(doc, selectedLang = credentials.WorkLang) {
    var PlanningStatus ='filled';

    var FileCoreDomainsPath = credentials.CoreSetPath + 'ITAuditHandbook.xml' ;
    var dataCoreDomains = fs.readFileSync(FileCoreDomainsPath, { encoding : 'UTF-8' });
    //var doc1 = new Dom().parseFromString(dataCoreDomains);

    //var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    //var doc = new Dom().parseFromString(data);
    var data2Compare = xpath.select("/Audit/ActiveITAuditDomains",doc);

    writetofile = XMLSerializer.serializeToString(data2Compare[0]);
    //doc = new Dom().parseFromString(writetofile);    

    //var compare = require('dom-compare').compare;
    //var compare = DomRequire.compare;
    //var result = compare(doc1, doc);

    // compare to DOM trees, get a result object
    result = stringSimilarity.compareTwoStrings(dataCoreDomains, writetofile);

    //console.log(result);

    if (result>=0.995){
        PlanningStatus ='notFilled';
    };
    return PlanningStatus;
}

function GetPluginsUsed(fileid, selectedLang = credentials.WorkLang) {
    var pluginsStatus=0;
    var Catalog = [];

    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    var vItemsId = xpath.select("/Audit/PlugIns/PlugIn/@id",doc);
    pluginsStatus=vItemsId.length;

    if (pluginsStatus > 0){
        for (var i=0; i<vItemsId.length; i++) {
            varPluginId = vItemsId[i].nodeValue;
            var res = xpath.select("/Audit/PlugIns/PlugIn[@id='" + varPluginId + "']/About/title/tx[@l='" + selectedLang + "']/@name",doc);
            if (res.length==1) {
                var NewEntry = {
                    PluginId: res[0].nodeValue + ' (' + varPluginId + ')'
                };
            };
            Catalog.push(NewEntry);      
        };
    } else {
        var NewEntry = {
            PluginId: 'No plug-in used so far!'
        };
        Catalog.push(NewEntry);   
    };

    return Catalog;
};

module.exports.GeneralDomainCharacterization = GeneralDomainCharacterization;
module.exports.GeneralRiskCharacterization = GeneralRiskCharacterization;
module.exports.SpecificDomainCharacterization = SpecificDomainCharacterization;
module.exports.GetTimelineStatus = GetTimelineStatus;
module.exports.GetPluginsUsed = GetPluginsUsed;