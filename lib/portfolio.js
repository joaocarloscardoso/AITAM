//var portfolio = require('../lib/portfolio.js');
//replace user01 with this: req.session.passport.user
//portfolio.LoadFromDatabase(credentials.WorkSetPath + req.sessionID + '_plf.xml','Portfolio01', 'user01');
//portfolio.ListPortfolios('user01', '1').then(function(Result){
//    console.log(Result);
//});

//credentials used in the app
var credentials = require('../credentials.js');
var globalvalues = require('../globalvalues.js');

var fs = require('fs'),
    path = require('path');

//logging system
var log = require('./log.js');

//database
var database = require('./db.js');

var xpath   = require('xpath');
var Dom     = require('xmldom').DOMParser;
var XMLSerializer = require('xmldom').XMLSerializer;
var iCounter;

var Nodes = [];
var KeyNodes = [];
var Edges = [];
var Support = [];

function MapPortfolioReference(doc) {
    var vAuditTitle = '';
    var vAuditBackground = '';

    var NewNodeEntry = {
        id: 0,
        label: xpath.select("/portfolio/@id",doc)[0].nodeValue,
        title: 'Portfolio: ' + xpath.select("/portfolio/@id",doc)[0].nodeValue,
        shape: 'triangleDown',
        group: 0
    };
    vCurrentIssueId = NewNodeEntry.id;
    Nodes.push(NewNodeEntry);     

    var NewSupportEntry = {
        title: 'Portfolio: ' + xpath.select("/portfolio/@id",doc)[0].nodeValue,
        matrix: '',
        description: xpath.select("/portfolio/@description",doc)[0].nodeValue
    };
    Support.push(NewSupportEntry);        

};

function MapAuditObjects(doc, portfolioid, selectedLang = credentials.WorkLang){
    var vAuditTitle = '';
    var vAuditBackground = '';
    var vCurrentAuditId = 0;

    //audit reference section
    var vAudits = xpath.select("/portfolio/audits/Audit/About/@id",doc);
    for (var i=0; i<vAudits.length; i++) {
        if (xpath.select("boolean(/portfolio/audits/Audit/About[@id='" + vAudits[i].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name)",doc)){
            vAuditTitle = xpath.select("/portfolio/audits/Audit/About[@id='" + vAudits[i].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue
        } else {
            vAuditTitle = '';
        };
        var res = xpath.select("/portfolio/audits/Audit/About[@id='" + vAudits[i].nodeValue + "']/../Background/ak",doc);
        if (res.length==1 && res[0].firstChild != null) {
            vAuditBackground = res[0].firstChild.nodeValue;
        } else {
            vAuditBackground= '';
        }

        var NewNodeEntry = {
            id: Nodes.length,
            label: 'Audit:\n' + vAuditTitle,
            title: 'Audit: ' + vAuditTitle,
            shape: 'dot',
            group: parseInt(i+1)
        };
        vCurrentAuditId = NewNodeEntry.id;
        Nodes.push(NewNodeEntry);     

        var NewSupportEntry = {
            title: 'Audit: ' + vAuditTitle,
            //place here the url for audit recommendations specific analysis 
            matrix: '/portanalytics/audit?id=' + portfolioid + '&auditid=' + vAudits[i].nodeValue,
            description: vAuditBackground
        };
        Support.push(NewSupportEntry);        
        
        var NewKeyEntry = {
            id: vCurrentAuditId,
            nodekey: vAudits[i].nodeValue,
            group: parseInt(i+1)
        };
        KeyNodes.push(NewKeyEntry);        

        //relates edge of domain id with audit id
        var NewEdgeEntry = {
            from: 0,
            to: vCurrentAuditId
        };        
        Edges.push(NewEdgeEntry);
    };

};

function MapRecommendationObjects(doc, selectedLang = credentials.WorkLang) {
    var tempDescription = '';
    var tempTitle = '';
    var vRecommendations = xpath.select("/portfolio/audits/Audit/Recommendations/Recommendation/@nr",doc);
    var vCurrentRecommendationId = 0;
    var vCurrentAuditId = 0;
    var vCurrentGroup = 0;
    var vNumber = 0;

    for (var i=0; i<vRecommendations.length; i++) {
        if (xpath.select("/portfolio/audits/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/quote[@type='description']/.",doc)[0].firstChild === null)
        {
            tempDescription= '';
        }else{
            tempDescription= xpath.select("/portfolio/audits/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/quote[@type='description']/.",doc)[0].firstChild.nodeValue;
        };
        if (xpath.select("boolean(/portfolio/audits/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@number)",doc)){
            vNumber = xpath.select("/portfolio/audits/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@number",doc)[0].nodeValue
        } else {
            vNumber = 0;
        };        
        tempTitle = xpath.select("/portfolio/audits/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@category",doc)[0].nodeValue;
        if (tempTitle == "(Not defined yet)" || tempTitle == ""){
            if (tempDescription.length > 0){
                tempTitle = tempDescription.substring(0, 60) + '...'
            }
        }

        var vCurrentAudit = xpath.select("/portfolio/audits/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/../../About/@id",doc)[0].nodeValue
        var result = KeyNodes.find( ({ nodekey }) => nodekey === vCurrentAudit);
        if(result == null){ 
            vCurrentAuditId = 0;
            vCurrentGroup = 0;
        } else {
            vCurrentAuditId= result.id;
            vCurrentGroup = result.group;
        };

        //create issue and get id number
        var NewNodeEntry = {
            id: Nodes.length,
            label: 'Recommendation:\n#' + vNumber, 
            title: 'Rec. #' + vNumber +': ' + tempTitle,  
            shape: 'triangle',
            group: vCurrentGroup
        };
        vCurrentRecommendationId = NewNodeEntry.id;
        Nodes.push(NewNodeEntry);     

        var NewSupportEntry = {
            title: 'Recommendation: #' + vNumber,
            matrix: '',
            description: tempDescription
        };
        Support.push(NewSupportEntry);        
        
        var NewKeyEntry = {
            id: vCurrentRecommendationId,
            nodekey: vRecommendations[i].nodeValue,
            group: vCurrentGroup
        };
        KeyNodes.push(NewKeyEntry);        

        var NewEdgeEntry = {
            from: vCurrentAuditId,
            to: vCurrentRecommendationId
        };        
        Edges.push(NewEdgeEntry);        
    };
};

function LoadAuditRecommendations(doc, auditid, selectedLang = credentials.WorkLang) {
    Catalog = [];
    tempDescription = '';
    tempTimeline ='';
    tempStatus='';
    tempFindings=[];
    vNumber=0;
    vFindingNumber = 0;
    vFindingDescription = '';
    vFindingName = '';

    iCounter = 0;
    var vRecommendations = xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation/@nr",doc);

    for (var i=0; i<vRecommendations.length; i++) {
        if (xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/quote[@type='description']/.",doc)[0].firstChild === null)
        {
            tempDescription= '';
        }else{
            tempDescription= xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/quote[@type='description']/.",doc)[0].firstChild.nodeValue;
        };
        if (xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/quote[@type='timeline']/.",doc)[0].firstChild === null)
        {
            tempTimeline= '';
        }else{
            tempTimeline= xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/quote[@type='timeline']/.",doc)[0].firstChild.nodeValue;
        };
        if (xpath.select("boolean(/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@number)",doc)){
            vNumber = xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@number",doc)[0].nodeValue
        } else {
            vNumber = 0;
        };

        var vMonitoring = xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/monitoring/assessment/@date",doc);
        if (vMonitoring.length > 0) {
            tempStatus=xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/monitoring/assessment[@date='" + vMonitoring[(vMonitoring.length-1)].nodeValue + "']/@status",doc)[0].nodeValue;
        } else {
            tempStatus='(not yet accessed))';
        };

        tempFindings=[];
        var vColFindings = xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/findings/finding/@nr",doc);
        for (var jF=0; jF<vColFindings.length; jF++) {
            vFindingName = '';
            if (xpath.select("boolean(/portfolio/audits/Audit/About[@id='" + auditid + "']/../Cases/Case[@nr='" + vColFindings[jF].nodeValue + "']/@number)",doc)){
                vFindingNumber = xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Cases/Case[@nr='" + vColFindings[jF].nodeValue + "']/@number",doc)[0].nodeValue
            } else {
                vFindingNumber = 0;
            };
            if (xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Cases/Case[@nr='" + vColFindings[jF].nodeValue + "']/quote[@type='description']/.",doc)[0].firstChild === null)
            {
                vFindingDescription= '';
            }else{
                vFindingDescription= xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Cases/Case[@nr='" + vColFindings[jF].nodeValue + "']/quote[@type='description']/.",doc)[0].firstChild.nodeValue;
            };
            if (xpath.select("boolean(/portfolio/audits/Audit/About[@id='" + auditid + "']/../Cases/Case[@nr='" + vColFindings[jF].nodeValue + "']/@name)",doc)){
                vFindingName = xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Cases/Case[@nr='" + vColFindings[jF].nodeValue + "']/@name",doc)[0].nodeValue
            };
    
            var NewEntry={
                Number: '#' + vFindingNumber,
                Name: vFindingName,
                Description: vFindingDescription
            };
            tempFindings.push(NewEntry);
        };

        var NewEntry = {
            RowId: '#' + String((iCounter+1)),
            Id: vRecommendations[i].nodeValue,
            Description: tempDescription,
            Number: vNumber,
            Priority: xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@priority",doc)[0].nodeValue,
            Risk: xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@risk",doc)[0].nodeValue,
            Riskevaluation: xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@riskevaluation",doc)[0].nodeValue,
            Repeated: xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@repeated",doc)[0].nodeValue,
            Timeline: tempTimeline,
            Status: tempStatus,
            Findings: tempFindings
        };
        Catalog.push(NewEntry);        
        iCounter++;   
    }
    return Catalog;
};

function LoadRecPriorities(doc, auditid, selectedLang = credentials.WorkLang) {
    var ColPriorities =  globalvalues.Recommendation.Priority.split("|");
    var CatPriorities = [];
    for (index = 0, SelPrioritiesLen = (ColPriorities.length); index < SelPrioritiesLen; ++index) {
        var NewEntry = {
            Priority: ColPriorities[index],
            Number: 0
        };
        CatPriorities.push(NewEntry);
    };

    var vRecommendations = xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation/@nr",doc);
    for (var i=0; i<vRecommendations.length; i++) {
        if (
            CatPriorities.some(Node => 
                Node.Priority === xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@priority",doc)[0].nodeValue
            )) {
                CatPriorities.find(Node => 
                    Node.Priority === xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@priority",doc)[0].nodeValue
                ).Number = CatPriorities.find( Node => 
                    Node.Priority === xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@priority",doc)[0].nodeValue
                ).Number + 1;
            }
    };
    return CatPriorities;
};

function LoadRecCharacterization(doc, auditid, selectedLang = credentials.WorkLang) {
    var ColCharacterization =  globalvalues.Recommendation.RiskCharacterization.split("|");
    var CatCharacterization = [];
    for (index = 0, SelCharacterizationLen = (ColCharacterization.length); index < SelCharacterizationLen; ++index) {
        var NewEntry = {
            Risk: ColCharacterization[index],
            Number: 0
        };
        CatCharacterization.push(NewEntry);
    };

    var vRecommendations = xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation/@nr",doc);
    for (var i=0; i<vRecommendations.length; i++) {
        if (
            CatCharacterization.some(Node => 
                Node.Risk === xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@risk",doc)[0].nodeValue
            )) {
                CatCharacterization.find(Node => 
                    Node.Risk === xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@risk",doc)[0].nodeValue
                ).Number = CatCharacterization.find( Node => 
                    Node.Risk === xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@risk",doc)[0].nodeValue
                ).Number + 1;
            }
    };
    return CatCharacterization;
};

function LoadRecImportance(doc, auditid, selectedLang = credentials.WorkLang) {
    var ColImportance =  globalvalues.Recommendation.Importance.split("|");
    var CatImportance = [];
    for (index = 0, SelImportanceLen = (ColImportance.length); index < SelImportanceLen; ++index) {
        var NewEntry = {
            Importance: ColImportance[index],
            Number: 0
        };
        CatImportance.push(NewEntry);
    };

    var vRecommendations = xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation/@nr",doc);
    for (var i=0; i<vRecommendations.length; i++) {
        if (
            CatImportance.some(Node => 
                Node.Importance === xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@importance",doc)[0].nodeValue
            )) {
                CatImportance.find(Node => 
                    Node.Importance === xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@importance",doc)[0].nodeValue
                ).Number = CatImportance.find( Node => 
                    Node.Importance === xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@importance",doc)[0].nodeValue
                ).Number + 1;
            }
    };
    return CatImportance;
};

function LoadRecLevel(doc, auditid, selectedLang = credentials.WorkLang) {
    var ColLevel =  globalvalues.Recommendation.RiskEvaluation.split("|");
    var CatLevel = [];
    for (index = 0, SelLevelLen = (ColLevel.length); index < SelLevelLen; ++index) {
        var NewEntry = {
            Level: ColLevel[index],
            Number: 0
        };
        CatLevel.push(NewEntry);
    };

    var vRecommendations = xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation/@nr",doc);
    for (var i=0; i<vRecommendations.length; i++) {
        if (
            CatLevel.some(Node => 
                Node.Level === xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@riskevaluation",doc)[0].nodeValue
            )) {
                CatLevel.find(Node => 
                    Node.Level === xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@riskevaluation",doc)[0].nodeValue
                ).Number = CatLevel.find( Node => 
                    Node.Level === xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@riskevaluation",doc)[0].nodeValue
                ).Number + 1;
            }
    };
    return CatLevel;
};

function LoadAuditRecommendationsForAnalysis(doc, auditid, selectedLang = credentials.WorkLang) {
    var tempTitle='';
    var tempBackground ='';
    var tempScope ='';
    var tempRef='';
    var tempNumber=0;
    var tempNew=0;
    var tempPart=0;

    //audit reference section
    tempRef = auditid;
    var res = xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/title/tx[@l='" + selectedLang + "']/@name",doc);
    if (res.length==1 && res[0] != null){
        tempTitle = res[0].nodeValue;
    } else {
        tempTitle = '';
    };
    var res = xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Background/ak",doc);
    if (res.length==1 && res[0].firstChild != null)
        tempBackground = res[0].firstChild.nodeValue;

    var res = xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/../Scope/ak",doc);
    if (res.length==1 && res[0].firstChild != null)
        tempScope = res[0].firstChild.nodeValue;

    var List  = {
        AuditReference: tempRef,
        AuditTitle: tempTitle,
        AuditBackground: tempBackground,
        AuditScope: tempScope,
        StatPriorities: LoadRecPriorities(doc, auditid, selectedLang),
        StatCharacterization: LoadRecCharacterization(doc, auditid, selectedLang),
        StatImportance: LoadRecImportance(doc, auditid, selectedLang),
        StatLevel: LoadRecLevel(doc, auditid, selectedLang),
        Recommendations: LoadAuditRecommendations(doc, auditid, selectedLang),
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

function DeleteAuditFromPortfolio(id, auditid, userid) {
    var dbfields = { data: 1 };

    var sortfields = {"datepub": -1};
    return new Promise(function(resolve, reject){
        database.QueryDataByID(id, dbfields, sortfields).then(function(Result){
            var doc = new Dom().parseFromString(Result[0].data);
            var vItems = xpath.select("/portfolio/audits/.",doc);
            vItem2Delete = xpath.select("/portfolio/audits/Audit/About[@id='" + auditid + "']/..",doc);
            console.log(vItem2Delete[0]);
            vItems[0].removeChild(vItem2Delete[0]);
            var datadb = new XMLSerializer().serializeToString(doc);
            var Portfolio = { $set: 
                {
                    data: datadb
                }
            };

            database.UpdateData(userid, id, Portfolio).then(function(Result){
                resolve(Result);
            });
        });
    });
};

function AddAuditToPortfolio(id, AuditFileAttach, userid) {
    var dbfields = { data: 1 };

    var sortfields = {"datepub": -1};

    return new Promise(function(resolve, reject){
        database.QueryDataByID(id, dbfields, sortfields).then(function(Result){
            //NewAuditdata is a string
            var NewAuditdata = fs.readFileSync(AuditFileAttach, { encoding : 'UTF-8' });
            var NewAuditdoc = new Dom().parseFromString(NewAuditdata);
            var doc = new Dom().parseFromString(Result[0].data);

            //check if audit already exists
            var NewRefId = xpath.select("/Audit/About/@id",NewAuditdoc);
            if (xpath.select("boolean(/portfolio/audits/Audit/About[@id='" + NewRefId[0].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name)",doc)){
                var vError = [  
                    {msg: 'The selected audit was not attached to the portfolio!'},
                    {msg: 'An audit with reference #' + NewRefId[0].nodeValue + ' is already present in portfolio!'}
                ];
                resolve(vError);
            } else {
                //select portfolio audits and selected audit to join root node
                var PortfolioRoot = xpath.select("/portfolio/audits/.",doc);
                var NewAuditNode = xpath.select("/Audit",NewAuditdoc);
                //insert audit root node in XML portfolio file
                PortfolioRoot[0].appendChild(NewAuditNode[0]);
                var datadb = new XMLSerializer().serializeToString(doc);

                var Portfolio = { $set: 
                    {
                        data: datadb
                    }
                };

                database.UpdateData(userid, id, Portfolio).then(function(Result){
                    resolve(Result);
                });
            };
        });
    });
};

function DeletePortfolio(portfolioid, userid) {
    var dbparams = {userid: userid,
        portfolioid: portfolioid
    }

    database.DeleteData(dbparams);
    return true;
};

function UpdatePortfolio(id, data, userid) {
    var dbfields = { data: 1 };

    var sortfields = {"datepub": -1};

    return new Promise(function(resolve, reject){
        database.QueryDataByID(id, dbfields, sortfields).then(function(Result){
            var doc = new Dom().parseFromString(Result[0].data);
            var portdata = xpath.select("/portfolio/.",doc);
            portdata[0].setAttribute('id', data.portfolioid);
            portdata[0].setAttribute('description',data.description);
            portdata[0].setAttribute('coverage',data.coverage);
            portdata[0].setAttribute('org',data.org);
            portdata[0].setAttribute('publisb',data.publish);
            var datadb = new XMLSerializer().serializeToString(doc);

            var Portfolio = { $set: 
                {
                    userid: userid,
                    datepub: (new Date()).toJSON(),
                    portfolioid: data.portfolioid,
                    description: data.description,
                    coverage: data.coverage,
                    org: data.org,
                    publish: data.publish,
                    data: datadb
                }
            };

            database.UpdateData(userid, id, Portfolio).then(function(Result){
                resolve(Result);
            });
        });
    });
};

function CreatePortfolio(data, userid) {
    var Portfolio = {
        userid: userid,
        datepub: (new Date()).toJSON(),
        portfolioid: data.portfolioid,
        description: data.description,
        coverage: data.coverage,
        org: data.org,
        publish: data.publish,
        data: '<?xml version="1.0" encoding="UTF-8"?><portfolio id="' + data.portfolioid + '" description="' + data.description + '" coverage="' + data.coverage + '" org="' + data.org + '" publish="' + data.publish + '"><audits></audits></portfolio>'
    };
    return new Promise(function(resolve, reject){
        database.InsertData(Portfolio).then(function(Result){
            resolve(Result);
        });
    });
};

function LoadPortfolioAudit(portfolioid, auditid, selectedLang = credentials.WorkLang){
    var dbfields = { _id: 0, data: 1 };

    var sortfields = {"datepub": -1};

    return new Promise(function(resolve, reject){
        database.QueryDataByID(portfolioid, dbfields, sortfields).then(function(Result){
            var doc = new Dom().parseFromString(Result[0].data);
            var Catalog = LoadAuditRecommendationsForAnalysis(doc, auditid, selectedLang);
            resolve(Catalog);
        });
    });

};

//get portfolio aggregated overview
function LoadPortfolioOverview(portfolioid, selectedLang = credentials.WorkLang) {
    var dbfields = { _id: 0, portfolioid: 1, description: 1, coverage: 1, org: 1, data: 1, publish: 1 };

    var sortfields = {"datepub": -1};

    return new Promise(function(resolve, reject){
        database.QueryDataByID(portfolioid, dbfields, sortfields).then(function(Result){
            var doc = new Dom().parseFromString(Result[0].data);
            var index = 0;
            var colStatus =  JSON.parse('{"' + globalvalues.Recommendation.ImplementationStatus.split(" ").join("_").split("|").join('": 0, "') + '": 0, "not_yet_accessed": 0}');
            var vRecommendations = xpath.select("/portfolio/audits/Audit/Recommendations/Recommendation/@nr",doc);
            var colRepeated = JSON.parse('{"No": 0, "Yes": 0, "Partially": 0}');
            var colRisk =  JSON.parse('{"' + globalvalues.Recommendation.RiskCharacterization.split(" ").join("_").split("|").join('": 0, "') + '": 0}');

            for (var i=0; i<vRecommendations.length; i++) {
                var vMonitoring = xpath.select("/portfolio/audits/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/monitoring/assessment/@date",doc);
                if (vMonitoring.length > 0) {
                    tempStatus=xpath.select("/portfolio/audits/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/../monitoring/assessment[@date='" + vMonitoring[(vMonitoring.length-1)].nodeValue + "']/@status",doc)[0].nodeValue;
                    tempStatus=tempStatus.split(" ").join("_");
                } else {
                    tempStatus='not_yet_accessed';
                };
                colStatus[tempStatus]=colStatus[tempStatus] + 1;

                tempStatus = xpath.select("/portfolio/audits/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@repeated",doc)[0].nodeValue;
                colRepeated[tempStatus]=colRepeated[tempStatus] + 1;

                tempStatus = xpath.select("/portfolio/audits/Audit/Recommendations/Recommendation[@nr='" + vRecommendations[i].nodeValue + "']/@risk",doc)[0].nodeValue;
                colRisk[tempStatus]=colRisk[tempStatus] + 1;
            };

            var colAudits=[];
            var vAudits = xpath.select("/portfolio/audits/Audit/About/@id",doc);
            for (var i=0; i<vAudits.length; i++) {
                var NewEntry = {
                    PortfolioId: portfolioid,
                    AuditId: vAudits[i].nodeValue,
                    Title: '',
                    Background:'',
                };
                var res = xpath.select("/portfolio/audits/Audit/About[@id='" + vAudits[i].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc);
                if (res.length==1 && res[0] != null){
                    NewEntry.Title = res[0].nodeValue;
                } else {
                    NewEntry.Title = '';
                };
                var res = xpath.select("/portfolio/audits/Audit/About[@id='" + vAudits[i].nodeValue + "']/../Background/ak",doc);
                if (res.length==1 && res[0].firstChild != null)
                    NewEntry.Background = res[0].firstChild.nodeValue;
                colAudits.push(NewEntry);
            };

            Nodes = [];
            KeyNodes = [];
            Edges = [];
            Support = [];
        
            //MapPortfolioReference(doc);
            //MapAuditObjects(doc, portfolioid);
            //MapRecommendationObjects(doc);
            var PortfolioMap = {
                support: Support,
                nodes: Nodes,
                edges: Edges
            };

            var Catalog = {
                _id: portfolioid,
                portfolioid: Result[0].portfolioid,
                description: Result[0].description,
                coverage: Result[0].coverage,
                org: Result[0].org,
                publish: Result[0].publish,
                status_data: colStatus,
                status_label: globalvalues.Recommendation.ImplementationStatus + "|not yet accessed",
                repeated_data: colRepeated,
                repeated_label: 'New|Repeated|Partially',
                risk_data: colRisk,
                risk_label: globalvalues.Recommendation.RiskCharacterization,
                audits: colAudits,
                portfoliomap: PortfolioMap
            };
            resolve(Catalog);
        });
    });

};

//get list of portfolios: from database
function ListPortfolios(userid, published) {
    var dbparams = {};
    if (published == '1') {
        // if (userid == ''){
            dbparams = { publish: published };
        //} else {
        //    dbparams = { userid: userid,
        //        publish: published
        //    };
        //};   
    } else {
        dbparams = { userid: userid };
    };

    var dbfields = { _id: 1, userid: 1, datepub: 1, portfolioid: 1, description: 1, coverage: 1, org: 1, publish: 1 };
    var sortfields = {"datepub": -1};

    return new Promise(function(resolve, reject){
        database.QueryData(dbparams, dbfields, sortfields).then(function(Result){
            resolve(Result);
        });
    });
};

//get list of portfolios: from database
function ListPortfoliosFromUser(userid) {
    var dbparams = {};
    dbparams = { userid: userid };

    var dbfields = { _id: 1, userid: 1, datepub: 1, portfolioid: 1, description: 1, coverage: 1, org: 1, publish: 1 };
    var sortfields = {"datepub": -1};

    return new Promise(function(resolve, reject){
        database.QueryData(dbparams, dbfields, sortfields).then(function(Result){
            resolve(Result);
        });
    });
};

//get list of portfolios: from database
function ListPortfolioBasic(portfolioid) {
    var dbfields = { _id: 1, userid: 1, portfolioid: 1, description: 1, coverage: 1, org: 1 };
    var sortfields = {"datepub": -1};

    return new Promise(function(resolve, reject){
        database.QueryDataByID(portfolioid, dbfields, sortfields).then(function(Result){
            resolve(Result[0]);
        });
    });
};

//get portfolio aggregated overview
function LoadNewPortfolioOverview() {
    var Catalog = {
        _id: 'New',
        portfolioid: '',
        description: '',
        coverage: '',
        org: '',
        publish: 0,
        status_data: [],
        status_label: '',
        repeated_data: [],
        repeated_label: '',
        risk_data: [],
        risk_label: '',
        audits: [],
        portfoliomap: []
    };
    return Catalog;
}

module.exports.CreatePortfolio = CreatePortfolio;
module.exports.UpdatePortfolio = UpdatePortfolio;
module.exports.DeletePortfolio = DeletePortfolio;
module.exports.DeleteAuditFromPortfolio = DeleteAuditFromPortfolio;
module.exports.AddAuditToPortfolio = AddAuditToPortfolio;
module.exports.ListPortfolios = ListPortfolios;
module.exports.LoadPortfolioOverview = LoadPortfolioOverview;
module.exports.LoadPortfolioAudit = LoadPortfolioAudit;
module.exports.ListPortfoliosFromUser = ListPortfoliosFromUser;
module.exports.LoadNewPortfolioOverview = LoadNewPortfolioOverview;
module.exports.ListPortfolioBasic = ListPortfolioBasic;
