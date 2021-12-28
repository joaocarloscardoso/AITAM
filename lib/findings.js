//credentials used in the app
var credentials = require('../credentials.js');

var fs = require('fs'),
    path = require('path');

//logging system
var log = require('./log.js');

var xpath   = require('xpath');
var Dom     = require('xmldom').DOMParser;
var XMLSerializer = require('xmlserializer');
var iCounter;
var Catalog = [];

function LoadFindings(fileid, selectedLang = credentials.WorkLang) {
    Catalog = [];
    tempDescription = '';
    vNumber=0;
    tempName = '';

    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    iCounter = 0;
    var vFindings = xpath.select("/Audit/Cases/Case/@nr",doc);

    for (var i=0; i<vFindings.length; i++) {
        if (xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/quote[@type='description']/.",doc)[0].firstChild === null)
        {
            tempDescription= '';
        }else{
            tempDescription= xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/quote[@type='description']/.",doc)[0].firstChild.nodeValue;
        };
        if (xpath.select("boolean(/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/@number)",doc)){
            vNumber = xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/@number",doc)[0].nodeValue
        } else {
            vNumber = 0;
        };
        if (xpath.select("boolean(/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/@name)",doc)){
            tempName = xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/@name",doc)[0].nodeValue
        } else {
            tempName = '';
        };

        var NewEntry = {
            RowId: '#' + String((iCounter+1)),
            Id: vFindings[i].nodeValue,
            Source: xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/cts/@source",doc)[0].nodeValue,
            Domain: xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/cts/@domain",doc)[0].nodeValue,
            Area: xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/cts/@area",doc)[0].nodeValue,
            Issue: xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/cts/@issue",doc)[0].nodeValue,
            Cause: xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/@nm",doc)[0].nodeValue,
            Result: xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/@eff",doc)[0].nodeValue,
            Number: vNumber,
            Name: tempName,
            Description: tempDescription,
            LegalAct: xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/@act",doc)[0].nodeValue,
            ReportReference: xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/@doc",doc)[0].nodeValue,
            Selected: xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/@Include",doc)[0].nodeValue
        };
        Catalog.push(NewEntry);        
        iCounter++;   
    }
    return Catalog;
};

function SaveFindings(fileid, Catalog) {
    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

   for (let i = 0; i < Catalog.length; i++) {
        var res = xpath.select("/Audit/Cases/Case[@nr='" + Catalog[i].Id + "']/.",doc)
        res[0].setAttribute('Include',Catalog[i].Selected);
    }
    var writetofile = XMLSerializer.serializeToString(doc);
    writetofile = writetofile.replace(' xmlns="undefined"','');
    fs.writeFileSync(fileid, writetofile);
    return true;
};

function DeleteFinding(fileid, FindingId) {
    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    var res = xpath.select("/Audit/Cases/Case[@nr='" + FindingId + "']/.",doc)
    res[0].parentNode.removeChild(res[0]);

    var writetofile = XMLSerializer.serializeToString(doc);
    writetofile = writetofile.replace(' xmlns="undefined"','');
    fs.writeFileSync(fileid, writetofile);

    return true;
};

function FindingsForGeneralDomainsAnalysis(fileid, selectedLang = credentials.WorkLang) {
    var Catalog = {
        wLabels:'',
        wNumber: '',
        wRelevant: '',
        wTreshold:''
    };
    //data about labels on 7 core domains
    var WeightLabel   = '';
    //data about findings number on 7 core domains
    var WeightNumber   = '';
    var arrayWeightNumber   = [];
    //data about relevant findings on 7 core domains
    var WeightRelevant = '';
    var arrayWeightRelevant = [];
    //threshold on 7 core domains
    var WeightTreshold = '';
    var arrayWeightTreshold = [];

    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    //1st step
    var vPointerDomain='';
    var vDescrDomain='';
    var vDomains = xpath.select("/Audit/ActiveITAuditDomains/Domain/@nr",doc);
    for (var i=0; i<vDomains.length; i++) {        
        if (vPointerDomain != vDomains[i].nodeValue) {
            vPointerDomain = vDomains[i].nodeValue;
        //    var vIncluded = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vPointerDomain + "']/Area/Issue[@Include='Yes']/@nr",doc)
        //    if (vIncluded.length == 0) {
                //call method to get plugins data
        //        vIncluded = xpath.select("/Audit/PlugIns/PlugIn/Domain[@nr='" + vPointerDomain + "']/Area/Issue[@Include='Yes']/@nr",doc)
        //    }
        //    if (vIncluded.length > 0) {
                vDescrDomain= vPointerDomain + ' ' + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vPointerDomain + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
                if (WeightLabel==''){
                    WeightLabel = vDescrDomain;
                    WeightNumber = '0';
                    WeightRelevant = '0';
                    WeightTreshold = '0';
                } else {
                    WeightLabel = WeightLabel + '|' + vDescrDomain;
                    WeightNumber = WeightNumber + '|0';
                    WeightRelevant = WeightRelevant + '|0';
                    WeightTreshold = WeightTreshold + '|0';
                }
        //    }
        }
    }    

    arrayWeightNumber=WeightNumber.split("|");
    arrayWeightRelevant=WeightRelevant.split("|");
    arrayWeightTreshold=WeightTreshold.split("|");

    //2nd step
    var vDomains = xpath.select("/Audit/Cases/Case/@nr",doc);
    for (var i=0; i<vDomains.length; i++) {
        var vDomain = xpath.select("/Audit/Cases/Case[@nr='" + vDomains[i].nodeValue + "']/cts/@domain",doc)[0].nodeValue.substring(0, 2)
        var vInclude =xpath.select("/Audit/Cases/Case[@nr='" + vDomains[i].nodeValue + "']/@Include",doc)[0].nodeValue;

        arrayWeightNumber[(parseInt(vDomain)-1)] = parseInt(arrayWeightNumber[(parseInt(vDomain)-1)]) + 1;
        arrayWeightTreshold[(parseInt(vDomain)-1)] = parseInt(arrayWeightTreshold[(parseInt(vDomain)-1)]) + 1;
        if (vInclude=="Yes"){
            arrayWeightRelevant[(parseInt(vDomain)-1)] = parseInt(arrayWeightRelevant[(parseInt(vDomain)-1)]) +1;
        }
    }

    for (var j = 0; j < arrayWeightTreshold.length; j++){
        if (arrayWeightTreshold[j]==0){
            arrayWeightTreshold[j]=1;
        }
        
    }
    Catalog.wLabels = WeightLabel;
    Catalog.wNumber = arrayWeightNumber.join();
    Catalog.wRelevant = arrayWeightRelevant.join();
    Catalog.wTreshold = arrayWeightTreshold.join();
    return Catalog;
};

function FindingsForSpecificDomainsAnalysis(fileid, DomainId, selectedLang = credentials.WorkLang) {
    var Catalog = {
        wLabels:'',
        wNumber: '',
        wRelevant: '',
        wTreshold:''
    };
    var vAreas = [];
    //data about labels on areas
    var WeightLabel   = '';
    //data about findings number on areas
    var WeightNumber   = '';
    //data about relevant findings on areas
    var WeightRelevant = '';
    //threshold on areas
    var WeightTreshold = '';
 
    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    //1st step, core AITAM evaluation
    var vSelAreas = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + DomainId + "']/Area/@nr",doc);
    for (var j=0; j<vSelAreas.length; j++) {
        var vPointerArea=vSelAreas[j].nodeValue;
        var vDescrArea=vPointerArea + ' ' + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + DomainId + "']/Area[@nr='" + vPointerArea + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
        var vIncluded = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + DomainId + "']/Area[@nr='" + vPointerArea + "']/Issue[@Include='Yes']/@nr",doc);
        if (vIncluded.length > 0) {
            if (!vAreas.some(Node =>  Node.wLabel === vDescrArea)) {
                var NewEntry = {
                    wLabel: vDescrArea,
                    wNumber: 0,
                    wRelevant: 0,
                    wTreshold: 0
                };
                vAreas.push(NewEntry);   
            }
        }
    }
    //1st step, plugins evaluation
    var vSelAreas = xpath.select("/Audit/PlugIns/PlugIn/Domain[@nr='" + DomainId + "']/Area/@nr",doc);
    for (var j=0; j<vSelAreas.length; j++) {
        var vPointerArea=vSelAreas[j].nodeValue;
        var vPlugInId = xpath.select("/Audit/PlugIns/PlugIn/Domain[@nr='" + DomainId + "']/Area[@nr='" + vPointerArea + "']/../../@id",doc)[0].nodeValue;
        var vDescrArea= '(' + vPlugInId + ') ' + vPointerArea + ' - ' + xpath.select("/Audit/PlugIns/PlugIn/Domain[@nr='" + DomainId + "']/Area[@nr='" + vPointerArea + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
        var vIncluded = xpath.select("/Audit/PlugIns/PlugIn/Domain[@nr='" + DomainId + "']/Area[@nr='" + vPointerArea + "']/Issue[@Include='Yes']/@nr",doc);
        if (vIncluded.length > 0) {
            if (!vAreas.some(Node =>  Node.wLabel === vDescrArea)) {
                var NewEntry = {
                    wLabel: vDescrArea,
                    wNumber: 0,
                    wRelevant: 0,
                    wTreshold: 0
                };
                vAreas.push(NewEntry);   
            }
        }
    }

    //2nd step
    var vDomains = xpath.select("/Audit/Cases/Case/@nr",doc);
    for (var i=0; i<vDomains.length; i++) {
        var vDomain = xpath.select("/Audit/Cases/Case[@nr='" + vDomains[i].nodeValue + "']/cts/@domain",doc)[0].nodeValue.substring(0, 2)
        if (vDomain === DomainId) {
            var vArea = xpath.select("/Audit/Cases/Case[@nr='" + vDomains[i].nodeValue + "']/cts/@area",doc)[0].nodeValue
            var vSource = xpath.select("/Audit/Cases/Case[@nr='" + vDomains[i].nodeValue + "']/cts/@source",doc)[0].nodeValue
            var vInclude =xpath.select("/Audit/Cases/Case[@nr='" + vDomains[i].nodeValue + "']/@Include",doc)[0].nodeValue;
            if (vSource == 'AITAM'){
                vDescrArea = vArea;
            } else {
                vDescrArea = '(' + vSource + ') ' + vArea;
            }
            vAreas.find(Node => 
                Node.wLabel === vDescrArea
            ).wNumber = vAreas.find( Node => 
                Node.wLabel === vDescrArea
            ).wNumber + 1;
            vAreas.find(Node => 
                Node.wLabel === vDescrArea
            ).wTreshold = vAreas.find( Node => 
                Node.wLabel === vDescrArea
            ).wTreshold + 1;
            if (vInclude=="Yes"){
                vAreas.find(Node => 
                    Node.wLabel === vDescrArea
                ).wRelevant = vAreas.find( Node => 
                    Node.wLabel === vDescrArea
                ).wRelevant + 1;
            }
        }
    }

    for (var j = 0; j < vAreas.length; j++){
        if (WeightLabel ===''){
            WeightLabel = vAreas[j].wLabel;
            WeightNumber = vAreas[j].wNumber;
            WeightRelevant = vAreas[j].wRelevant;
            if (vAreas[j].wTreshold === '0') {
                WeightTreshold = '1';
            } else{
                WeightTreshold = vAreas[j].wTreshold;
            }
        } else {
            WeightLabel = WeightLabel + '|' + vAreas[j].wLabel;
            WeightNumber = WeightNumber + ',' + vAreas[j].wNumber;
            WeightRelevant = WeightRelevant + ',' + vAreas[j].wRelevant;
            if (vAreas[j].wTreshold === '0') {
                WeightTreshold = WeightRelevant + ',1';
            } else{
                WeightTreshold = WeightRelevant + ',' + vAreas[j].wTreshold;
            }
        }
    }

    Catalog.wLabels = WeightLabel;
    Catalog.wNumber = WeightNumber;
    Catalog.wRelevant = WeightRelevant;
    Catalog.wTreshold = WeightTreshold;
    return Catalog;
};


function LoadFindingsAnalysis(fileid, selectedLang = credentials.WorkLang) {
    Catalog = [];

    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    iCounter = 0;
    var vFindings = xpath.select("/Audit/Cases/Case/@nr",doc);
    for (var i=0; i<vFindings.length; i++) {
        if (
        Catalog.some(Node => 
            Node.Source === xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/cts/@source",doc)[0].nodeValue
            &&
            Node.Domain === xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/cts/@domain",doc)[0].nodeValue
            &&
            Node.Area === xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/cts/@area",doc)[0].nodeValue
            &&
            Node.Issue === xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/cts/@issue",doc)[0].nodeValue
        )) {
            Catalog.find(Node => 
                Node.Source === xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/cts/@source",doc)[0].nodeValue
                &&
                Node.Domain === xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/cts/@domain",doc)[0].nodeValue
                &&
                Node.Area === xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/cts/@area",doc)[0].nodeValue
                &&
                Node.Issue === xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/cts/@issue",doc)[0].nodeValue
            ).Number = Catalog.find( Node => 
                Node.Source === xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/cts/@source",doc)[0].nodeValue
                &&
                Node.Domain === xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/cts/@domain",doc)[0].nodeValue
                &&
                Node.Area === xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/cts/@area",doc)[0].nodeValue
                &&
                Node.Issue === xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/cts/@issue",doc)[0].nodeValue
            ).Number + 1;
        } else {
            var NewEntry = {
                Source: xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/cts/@source",doc)[0].nodeValue,
                Domain: xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/cts/@domain",doc)[0].nodeValue,
                Area: xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/cts/@area",doc)[0].nodeValue,
                Issue: xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/cts/@issue",doc)[0].nodeValue,
                Number: 1
            };
            Catalog.push(NewEntry);   
        }     
        iCounter++;   
    }
    return Catalog;
};

module.exports.LoadFindings = LoadFindings;
module.exports.SaveFindings = SaveFindings;
module.exports.DeleteFinding = DeleteFinding;
module.exports.LoadFindingsAnalysis = LoadFindingsAnalysis;
module.exports.FindingsForGeneralDomainsAnalysis = FindingsForGeneralDomainsAnalysis;
module.exports.FindingsForSpecificDomainsAnalysis = FindingsForSpecificDomainsAnalysis;
