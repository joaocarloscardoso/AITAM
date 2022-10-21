//credentials used in the app
var credentials = require('../credentials.js');
var globalvalues = require('../globalvalues.js');

var fs = require('fs'),
    path = require('path');

//logging system
var log = require('./log.js');

var xpath   = require('xpath');
var Dom     = require('@xmldom/xmldom').DOMParser;
var XMLSerializer = require('xmlserializer');
var iCounter;
var Catalog = [];

function LoadAuditRecommendations(fileid, selectedLang = credentials.WorkLang) {
    Catalog = [];
    tempDescription = '';
    tempTimeline ='';
    tempStatus='';
    tempFindings='';
    vNumber=0;
    vFindingNumber = 0;

    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    iCounter = 0;
    var vRecommendations = xpath.select("/Audit/Recommendations/Recommendation/@nr",doc);

    for (var i=0; i<vRecommendations.length; i++) {
        if (xpath.select("/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/quote[@type='description']/.",doc)[0].firstChild === null)
        {
            tempDescription= '';
        }else{
            tempDescription= xpath.select("/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/quote[@type='description']/.",doc)[0].firstChild.nodeValue;
        };
        if (xpath.select("/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/quote[@type='timeline']/.",doc)[0].firstChild === null)
        {
            tempTimeline= '';
        }else{
            tempTimeline= xpath.select("/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/quote[@type='timeline']/.",doc)[0].firstChild.nodeValue;
        };
        if (xpath.select("boolean(/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@number)",doc)){
            vNumber = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@number",doc)[0].nodeValue
        } else {
            vNumber = 0;
        };

        var vMonitoring = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/monitoring/assessment/@date",doc);
        if (vMonitoring.length > 0) {
            tempStatus=xpath.select("/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/monitoring/assessment[@date='" + vMonitoring[(vMonitoring.length-1)].nodeValue + "']/@status",doc)[0].nodeValue;
        } else {
            tempStatus='(not yet accessed))';
        };

        tempFindings='';
        var vColFindings = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/findings/finding/@nr",doc);
        for (var jF=0; jF<vColFindings.length; jF++) {
            if (xpath.select("boolean(/Audit/Cases/Case[@nr='" + vColFindings[jF].nodeValue + "']/@number)",doc)){
                vFindingNumber = xpath.select("/Audit/Cases/Case[@nr='" + vColFindings[jF].nodeValue + "']/@number",doc)[0].nodeValue
            } else {
                vFindingNumber = 0;
            };        
            if (jF === 0) {
                tempFindings = vColFindings[jF].nodeValue + "#" + vFindingNumber;
            } else {
                tempFindings = tempFindings + '|' + vColFindings[jF].nodeValue + "#" + vFindingNumber;
            }
        };

        var NewEntry = {
            RowId: '#' + String((iCounter+1)),
            Id: vRecommendations[i].nodeValue,
            Description: tempDescription,
            Number: vNumber,
            Priority: xpath.select("/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@priority",doc)[0].nodeValue,
            Risk: xpath.select("/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@risk",doc)[0].nodeValue,
            Riskevaluation: xpath.select("/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@riskevaluation",doc)[0].nodeValue,
            Repeated: xpath.select("/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@repeated",doc)[0].nodeValue,
            Timeline: tempTimeline,
            Status: tempStatus,
            Findings: tempFindings
        };
        Catalog.push(NewEntry);        
        iCounter++;   
    }
    return Catalog;
};

function DeleteAuditRecommendation(fileid, AuditRecId) {
    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    var res = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + AuditRecId + "']/.",doc)
    res[0].parentNode.removeChild(res[0]);

    var writetofile = XMLSerializer.serializeToString(doc);
    writetofile = writetofile.replaceAll(' xmlns="undefined"','');
    writetofile = writetofile.replaceAll(' xmlns="null"','');
    fs.writeFileSync(fileid, writetofile);

    return true;
};

function LoadRecPriorities(fileid, selectedLang = credentials.WorkLang) {
    var ColPriorities =  globalvalues.Recommendation.Priority.split("|");
    var CatPriorities = [];
    for (index = 0, SelPrioritiesLen = (ColPriorities.length); index < SelPrioritiesLen; ++index) {
        var NewEntry = {
            Priority: ColPriorities[index],
            Number: 0
        };
        CatPriorities.push(NewEntry);
    };

    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    var vRecommendations = xpath.select("/Audit/Recommendations/Recommendation/@nr",doc);
    for (var i=0; i<vRecommendations.length; i++) {
        if (
            CatPriorities.some(Node => 
                Node.Priority === xpath.select("/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@priority",doc)[0].nodeValue
            )) {
                CatPriorities.find(Node => 
                    Node.Priority === xpath.select("/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@priority",doc)[0].nodeValue
                ).Number = CatPriorities.find( Node => 
                    Node.Priority === xpath.select("/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@priority",doc)[0].nodeValue
                ).Number + 1;
            }
    };
    return CatPriorities;
};

function LoadRecCharacterization(fileid, selectedLang = credentials.WorkLang) {
    var ColCharacterization =  globalvalues.Recommendation.RiskCharacterization.split("|");
    var CatCharacterization = [];
    for (index = 0, SelCharacterizationLen = (ColCharacterization.length); index < SelCharacterizationLen; ++index) {
        var NewEntry = {
            Risk: ColCharacterization[index],
            Number: 0
        };
        CatCharacterization.push(NewEntry);
    };

    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    var vRecommendations = xpath.select("/Audit/Recommendations/Recommendation/@nr",doc);
    for (var i=0; i<vRecommendations.length; i++) {
        if (
            CatCharacterization.some(Node => 
                Node.Risk === xpath.select("/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@risk",doc)[0].nodeValue
            )) {
                CatCharacterization.find(Node => 
                    Node.Risk === xpath.select("/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@risk",doc)[0].nodeValue
                ).Number = CatCharacterization.find( Node => 
                    Node.Risk === xpath.select("/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@risk",doc)[0].nodeValue
                ).Number + 1;
            }
    };
    return CatCharacterization;
};

function LoadRecImportance(fileid, selectedLang = credentials.WorkLang) {
    var ColImportance =  globalvalues.Recommendation.Importance.split("|");
    var CatImportance = [];
    for (index = 0, SelImportanceLen = (ColImportance.length); index < SelImportanceLen; ++index) {
        var NewEntry = {
            Importance: ColImportance[index],
            Number: 0
        };
        CatImportance.push(NewEntry);
    };

    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    var vRecommendations = xpath.select("/Audit/Recommendations/Recommendation/@nr",doc);
    for (var i=0; i<vRecommendations.length; i++) {
        if (
            CatImportance.some(Node => 
                Node.Importance === xpath.select("/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@importance",doc)[0].nodeValue
            )) {
                CatImportance.find(Node => 
                    Node.Importance === xpath.select("/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@importance",doc)[0].nodeValue
                ).Number = CatImportance.find( Node => 
                    Node.Importance === xpath.select("/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@importance",doc)[0].nodeValue
                ).Number + 1;
            }
    };
    return CatImportance;
};

function LoadRecLevel(fileid, selectedLang = credentials.WorkLang) {
    var ColLevel =  globalvalues.Recommendation.RiskEvaluation.split("|");
    var CatLevel = [];
    for (index = 0, SelLevelLen = (ColLevel.length); index < SelLevelLen; ++index) {
        var NewEntry = {
            Level: ColLevel[index],
            Number: 0
        };
        CatLevel.push(NewEntry);
    };

    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    var vRecommendations = xpath.select("/Audit/Recommendations/Recommendation/@nr",doc);
    for (var i=0; i<vRecommendations.length; i++) {
        if (
            CatLevel.some(Node => 
                Node.Level === xpath.select("/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@riskevaluation",doc)[0].nodeValue
            )) {
                CatLevel.find(Node => 
                    Node.Level === xpath.select("/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@riskevaluation",doc)[0].nodeValue
                ).Number = CatLevel.find( Node => 
                    Node.Level === xpath.select("/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@riskevaluation",doc)[0].nodeValue
                ).Number + 1;
            }
    };
    return CatLevel;
};

function LoadAuditRecommendationsForAnalysis(fileid, selectedLang = credentials.WorkLang) {
    var tempTitle='';
    var tempRef='';
    var tempNumber=0;
    var tempNew=0;
    var tempPart=0;
    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    //audit reference section
    tempRef = xpath.select("/Audit/About/@id",doc)[0].nodeValue;
    var res = xpath.select("/Audit/About/title/tx[@l='" + selectedLang + "']/@name",doc);
    if (res.length==1 && res[0] != null) {
        tempTitle = res[0].nodeValue;
    }

    var List  = {
        AuditReference: tempRef,
        AuditTitle: tempTitle,
        StatPriorities: LoadRecPriorities(fileid, selectedLang),
        StatCharacterization: LoadRecCharacterization(fileid, selectedLang),
        StatImportance: LoadRecImportance(fileid, selectedLang),
        StatLevel: LoadRecLevel(fileid, selectedLang),
        Recommendations: LoadAuditRecommendations(fileid, selectedLang),
        NumberOfRecommendations: 0,
        NumberOfNewRecommendations: 0,
        NumberOfRepRecommendations: 0,
        NumberOfPartRecommendations: 0,
        StatStatus: []
    };
    List.NumberOfRecommendations = List.Recommendations.length;
    for (var j = 0; j < List.Recommendations.length; j++){
        if (List.Recommendations[j].Repeated === 'No'){
            tempNew=tempNew+1;
        }
        if (List.Recommendations[j].Repeated === 'Partially'){
            tempPart=tempPart+1;
        }
    };
    List.NumberOfNewRecommendations = tempNew;
    List.NumberOfPartRecommendations = tempPart;
    List.NumberOfRepRecommendations = (parseInt(List.NumberOfRecommendations) - parseInt(List.NumberOfNewRecommendations) - parseInt(List.NumberOfPartRecommendations))
    var ColStatus =  globalvalues.Recommendation.ImplementationStatus.split("|");
    for (index = 0; index < ColStatus.length; ++index) {
        tempNumber=0;
        for (var j = 0; j < List.Recommendations.length; j++){
            // look for the entry with a matching `code` value
            if (List.Recommendations[j].Status == ColStatus[index]){
                tempNumber=tempNumber+1;
            }
        }
        var NewEntry = {
            Status: ColStatus[index],
            Number: tempNumber
        };
        List.StatStatus.push(NewEntry);
    }
    return List;
};

module.exports.LoadAuditRecommendations = LoadAuditRecommendations;
module.exports.DeleteAuditRecommendation = DeleteAuditRecommendation;
module.exports.LoadRecPriorities = LoadRecPriorities;
module.exports.LoadRecCharacterization = LoadRecCharacterization;
module.exports.LoadRecImportance = LoadRecImportance;
module.exports.LoadRecLevel = LoadRecLevel;
module.exports.LoadAuditRecommendationsForAnalysis = LoadAuditRecommendationsForAnalysis;
