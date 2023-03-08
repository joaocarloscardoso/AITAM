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

function LoadPlanMatrix(fileid, PluginId, DomainId, AreaId, IssueId, selectedLang = credentials.WorkLang) {
    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);
    var Objectives='';
    var Criteria='';
    var Inforequired='';
    var Method='';
    var Found='';
    var Conclusion='';

    if (PluginId == 'CORE'){
        var vItems = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + DomainId + "']/Area[@nr='" + AreaId + "']/Issue[@nr='" + IssueId + "']/Matrix/Objectives/obj/tx[@l='" + selectedLang + "']/@name",doc);
        for (var i=0; i<vItems.length; i++) {
            Objectives= Objectives + vItems[i].nodeValue;
        }
        var vItems = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + DomainId + "']/Area[@nr='" + AreaId + "']/Issue[@nr='" + IssueId + "']/Matrix/Criteria/cri/tx[@l='" + selectedLang + "']/@name",doc);
        for (var i=0; i<vItems.length; i++) {
            Criteria= Criteria + vItems[i].nodeValue;
        }
        var vItems = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + DomainId + "']/Area[@nr='" + AreaId + "']/Issue[@nr='" + IssueId + "']/Matrix/InformationRequired/inf/tx[@l='" + selectedLang + "']/@name",doc);
        for (var i=0; i<vItems.length; i++) {
            Inforequired= Inforequired + vItems[i].nodeValue;
        }
        var vItems = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + DomainId + "']/Area[@nr='" + AreaId + "']/Issue[@nr='" + IssueId + "']/Matrix/AnalysisMethod/anm/tx[@l='" + selectedLang + "']/@name",doc);
        for (var i=0; i<vItems.length; i++) {
            Method= Method + vItems[i].nodeValue;
        }
        var vItems = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + DomainId + "']/Area[@nr='" + AreaId + "']/Issue[@nr='" + IssueId + "']/Matrix/foundPreviously/fp/tx[@l='" + selectedLang + "']/@name",doc);
        for (var i=0; i<vItems.length; i++) {
            Found= Found + vItems[i].nodeValue;
        }
        var vItems = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + DomainId + "']/Area[@nr='" + AreaId + "']/Issue[@nr='" + IssueId + "']/Matrix/Conclusion/clu/tx[@l='" + selectedLang + "']/@name",doc);
        for (var i=0; i<vItems.length; i++) {
            Conclusion= Conclusion + vItems[i].nodeValue;
        }
        var NewEntry = {
            PluginId: PluginId,
            DomainId: DomainId,
            AreaId: AreaId,
            IssueId: IssueId,
            Domain: DomainId + ' - ' + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + DomainId + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue,
            Area: AreaId + ' - ' + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + DomainId + "']/Area[@nr='" + AreaId + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue,
            Issue: IssueId + ' - ' + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + DomainId + "']/Area[@nr='" + AreaId + "']/Issue[@nr='" + IssueId + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue,
            Objectives: Objectives,
            Criteria: Criteria,
            Inforequired: Inforequired,
            Method: Method,
            Found: Found,
            Conclusion: Conclusion
        };
    } else {
        var vItems = xpath.select("/Audit/PlugIns/PlugIn[@id='" + PluginId + "']/Domain[@nr='" + DomainId + "']/Area[@nr='" + AreaId + "']/Issue[@nr='" + IssueId + "']/Matrix/Objectives/obj/tx[@l='" + selectedLang + "']/@name",doc);
        for (var i=0; i<vItems.length; i++) {
            Objectives= Objectives + vItems[i].nodeValue;
        }
        var vItems = xpath.select("/Audit/PlugIns/PlugIn[@id='" + PluginId + "']/Domain[@nr='" + DomainId + "']/Area[@nr='" + AreaId + "']/Issue[@nr='" + IssueId + "']/Matrix/Criteria/cri/tx[@l='" + selectedLang + "']/@name",doc);
        for (var i=0; i<vItems.length; i++) {
            Criteria= Criteria + vItems[i].nodeValue;
        }
        var vItems = xpath.select("/Audit/PlugIns/PlugIn[@id='" + PluginId + "']/Domain[@nr='" + DomainId + "']/Area[@nr='" + AreaId + "']/Issue[@nr='" + IssueId + "']/Matrix/InformationRequired/inf/tx[@l='" + selectedLang + "']/@name",doc);
        for (var i=0; i<vItems.length; i++) {
            Inforequired= Inforequired + vItems[i].nodeValue;
        }
        var vItems = xpath.select("/Audit/PlugIns/PlugIn[@id='" + PluginId + "']/Domain[@nr='" + DomainId + "']/Area[@nr='" + AreaId + "']/Issue[@nr='" + IssueId + "']/Matrix/AnalysisMethod/anm/tx[@l='" + selectedLang + "']/@name",doc);
        for (var i=0; i<vItems.length; i++) {
            Method= Method + vItems[i].nodeValue;
        }
        var vItems = xpath.select("/Audit/PlugIns/PlugIn[@id='" + PluginId + "']/Domain[@nr='" + DomainId + "']/Area[@nr='" + AreaId + "']/Issue[@nr='" + IssueId + "']/Matrix/foundPreviously/fp/tx[@l='" + selectedLang + "']/@name",doc);
        for (var i=0; i<vItems.length; i++) {
            Found= Found + vItems[i].nodeValue;
        }
        var vItems = xpath.select("/Audit/PlugIns/PlugIn[@id='" + PluginId + "']/Domain[@nr='" + DomainId + "']/Area[@nr='" + AreaId + "']/Issue[@nr='" + IssueId + "']/Matrix/Conclusion/clu/tx[@l='" + selectedLang + "']/@name",doc);
        for (var i=0; i<vItems.length; i++) {
            Conclusion= Conclusion + vItems[i].nodeValue;
        }
        var NewEntry = {
            PluginId: PluginId,
            DomainId: DomainId,
            AreaId: AreaId,
            IssueId: IssueId,
            Domain: DomainId + ' - ' + xpath.select("/Audit/PlugIns/PlugIn[@id='" + PluginId + "']/Domain[@nr='" + DomainId + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue,
            Area: AreaId + ' - ' + xpath.select("/Audit/PlugIns/PlugIn[@id='" + PluginId + "']/Domain[@nr='" + DomainId + "']/Area[@nr='" + AreaId + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue,
            Issue: IssueId + ' - ' + xpath.select("/Audit/PlugIns/PlugIn[@id='" + PluginId + "']/Domain[@nr='" + DomainId + "']/Area[@nr='" + AreaId + "']/Issue[@nr='" + IssueId + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue,
            Objectives: Objectives,
            Criteria: Criteria,
            Inforequired: Inforequired,
            Method: Method,
            Found: Found,
            Conclusion: Conclusion
        };
    }

    return NewEntry;
};

function LoadFindingMatrix(fileid, FindingId, selectedLang = credentials.WorkLang, newFindingNumber) {
    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);
    var tempDescription ='';
    var tempRecommendation ='';
    var findingNumber=0;
    var tempName ='';

    if (FindingId != 'New') {
        var vSource = xpath.select("/Audit/Cases/Case[@nr='" + FindingId + "']/cts/@source",doc)[0].nodeValue;
        var vDomain = xpath.select("/Audit/Cases/Case[@nr='" + FindingId + "']/cts/@domain",doc)[0].nodeValue;
        var vArea =xpath.select("/Audit/Cases/Case[@nr='" + FindingId + "']/cts/@area",doc)[0].nodeValue;
        var vIssue = xpath.select("/Audit/Cases/Case[@nr='" + FindingId + "']/cts/@issue",doc)[0].nodeValue;

        if (xpath.select("/Audit/Cases/Case[@nr='" + FindingId + "']/quote[@type='description']/.",doc)[0].firstChild === null)
        {
            tempDescription= '';
        }else{
            tempDescription= xpath.select("/Audit/Cases/Case[@nr='" + FindingId + "']/quote[@type='description']/.",doc)[0].firstChild.nodeValue;
        };
        if (xpath.select("/Audit/Cases/Case[@nr='" + FindingId + "']/quote[@type='recommendation']/.",doc)[0].firstChild === null)
        {
            tempRecommendation= '';
        }else{
            tempRecommendation= xpath.select("/Audit/Cases/Case[@nr='" + FindingId + "']/quote[@type='recommendation']/.",doc)[0].firstChild.nodeValue;
        };
        if (xpath.select("boolean(/Audit/Cases/Case[@nr='" + FindingId + "']/@number)",doc)){
            findingNumber = xpath.select("/Audit/Cases/Case[@nr='" + FindingId + "']/@number",doc)[0].nodeValue
        };
        if (xpath.select("boolean(/Audit/Cases/Case[@nr='" + FindingId + "']/@name)",doc)){
            tempName = xpath.select("/Audit/Cases/Case[@nr='" + FindingId + "']/@name",doc)[0].nodeValue
        };

        var NewEntry = {
            FindingId: FindingId,
            Sources: GetSourcesForFindings(fileid, selectedLang),
            Domains: GetDomainsForFindings(fileid, selectedLang),
            Areas: GetAreasForFindings(fileid, selectedLang),
            Issues: GetIssuesForFindings(fileid, selectedLang),
            Source: vSource,
            Domain: vSource + '_' + vDomain.substring(0, 2),
            Area: vSource + '_' + vDomain.substring(0, 2) + '_' + vArea.substring(0, 2),
            Issue: vSource + '_' + vDomain.substring(0, 2) + '_' + vArea.substring(0, 2) + '_' + vIssue.substring(0, 2),
            DomainDescr: vDomain,
            AreaDescr: vArea,
            IssueDescr: vIssue,
            Cause: xpath.select("/Audit/Cases/Case[@nr='" + FindingId + "']/@nm",doc)[0].nodeValue,
            Result: xpath.select("/Audit/Cases/Case[@nr='" + FindingId + "']/@eff",doc)[0].nodeValue,
            Number: findingNumber,
            Name: tempName,
            Description: tempDescription,
            Recommendation: tempRecommendation,
            LegalAct: xpath.select("/Audit/Cases/Case[@nr='" + FindingId + "']/@act",doc)[0].nodeValue,
            ReportReference: xpath.select("/Audit/Cases/Case[@nr='" + FindingId + "']/@doc",doc)[0].nodeValue
        };
    } else {
        var NewEntry = {
            FindingId: '(New)',
            Sources: GetSourcesForFindings(fileid, selectedLang),
            Domains: GetDomainsForFindings(fileid, selectedLang),
            Areas: GetAreasForFindings(fileid, selectedLang),
            Issues: GetIssuesForFindings(fileid, selectedLang),
            Source: 'AITAM',
            Domain: 'AITAM_01',
            Area: 'AITAM_01_01',
            Issue: 'AITAM_01_01_01',
            DomainDescr: '',
            AreaDescr: '',
            IssueDescr: '',
            Cause: '',
            Result: '',
            Number: (parseInt(newFindingNumber) + 1),
            Name: '',
            Description: '',
            Recommendation: '',
            LegalAct: '',
            ReportReference: ''
        };
        var fSource=NewEntry.Sources.split("|");
        var ftempDomain=NewEntry.Domains.split("|");
        var fDomain=ftempDomain[0].split("#");
        var ftempArea=NewEntry.Areas.split("|");
        var fArea=ftempArea[0].split("#");
        var ftempIssue=NewEntry.Issues.split("|");
        var fIssue=ftempIssue[0].split("#");
        NewEntry.Source=fSource[0];
        NewEntry.Domain=fDomain[0];
        NewEntry.Area=fArea[0];
        NewEntry.Issue=fIssue[0];
    }

    return NewEntry;
};

function GetSourcesForFindings(fileid, selectedLang = credentials.WorkLang){
    var vSources = 'AITAM';

    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);
    var vItems = xpath.select("/Audit/PlugIns/PlugIn/@id",doc);
    for (var i=0; i<vItems.length; i++) {
        var vIncluded =  xpath.select("/Audit/PlugIns/PlugIn[@id='" + vItems[i].nodeValue + "']/Domain/Area/Issue[@Include='Yes']/@nr",doc)
        if (vIncluded.length > 0){
            vSources = vSources + '|' + vItems[i].nodeValue;
        }
    }
    return vSources;
};

function GetDomainsForFindings(fileid, selectedLang = credentials.WorkLang){
    var vDomains = '';

    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    var vItems = xpath.select("/Audit/ActiveITAuditDomains/Domain/@nr",doc);
    for (var i=0; i<vItems.length; i++) {
        var vIncluded =  xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vItems[i].nodeValue + "']/Area/Issue[@Include='Yes']/@nr",doc)
        if (vIncluded.length > 0){
            if (vDomains == ''){
                vDomains = 'AITAM_' + vItems[i].nodeValue + '#' + vItems[i].nodeValue + ' ' + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vItems[i].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
            } else {
                vDomains = vDomains + '|' + 'AITAM_' + vItems[i].nodeValue + '#' + vItems[i].nodeValue + ' ' + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vItems[i].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
            }
        }
    }
    var vPlugins = xpath.select("/Audit/PlugIns/PlugIn/@id",doc);
    for (var k=0; k<vPlugins.length; k++) {
        var vItems = xpath.select("/Audit/PlugIns/PlugIn[@id='" + vPlugins[k].nodeValue + "']/Domain/@nr",doc);
        for (var i=0; i<vItems.length; i++) {
            var vIncluded =  xpath.select("/Audit/PlugIns/PlugIn/Domain[@nr='" + vItems[i].nodeValue + "']/Area/Issue[@Include='Yes']/@nr",doc)
            if (vIncluded.length > 0){
                if (vDomains == ''){
                    vDomains = vPlugins[k].nodeValue + '_' + vItems[i].nodeValue + '#' + vItems[i].nodeValue + ' ' + xpath.select("/Audit/PlugIns/PlugIn[@id='" + vPlugins[k].nodeValue + "']/Domain[@nr='" + vItems[i].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
                } else {
                    vDomains = vDomains + '|' + vPlugins[k].nodeValue + '_' + vItems[i].nodeValue + '#' + vItems[i].nodeValue + ' ' + xpath.select("/Audit/PlugIns/PlugIn[@id='" + vPlugins[k].nodeValue + "']/Domain[@nr='" + vItems[i].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
                }
            }
        }
    }

    return vDomains;
};

function GetAreasForFindings(fileid, selectedLang = credentials.WorkLang){
    var vAreas = '';

    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    var vDomains = xpath.select("/Audit/ActiveITAuditDomains/Domain/@nr",doc);
    for (var i=0; i<vDomains.length; i++) {
        var vItems = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vDomains[i].nodeValue + "']/Area/@nr",doc);
        for (var j=0; j<vItems.length; j++) {
            var vIncluded =  xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vDomains[i].nodeValue + "']/Area[@nr='" + vItems[j].nodeValue + "']/Issue[@Include='Yes']/@nr",doc)
            if (vIncluded.length > 0){
                if (vAreas == ''){
                    vAreas = 'AITAM_' + vDomains[i].nodeValue + '_' + vItems[j].nodeValue + '#' + vItems[j].nodeValue + ' ' + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vDomains[i].nodeValue + "']/Area[@nr='" + vItems[j].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
                } else {
                    vAreas = vAreas + '|' + 'AITAM_' + vDomains[i].nodeValue + '_' + vItems[j].nodeValue + '#' + vItems[j].nodeValue + ' ' + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vDomains[i].nodeValue + "']/Area[@nr='" + vItems[j].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
                }
            }
        }
    }

    var vPlugins = xpath.select("/Audit/PlugIns/PlugIn/@id",doc);
    for (var k=0; k<vPlugins.length; k++) {
        var vDomains = xpath.select("/Audit/PlugIns/PlugIn[@id='" + vPlugins[k].nodeValue + "']/Domain/@nr",doc);
        for (var i=0; i<vDomains.length; i++) {
            var vItems = xpath.select("/Audit/PlugIns/PlugIn[@id='" + vPlugins[k].nodeValue + "']/Domain[@nr='" + vDomains[i].nodeValue + "']/Area/@nr",doc);
            for (var j=0; j<vItems.length; j++) {
                var vIncluded =  xpath.select("/Audit/PlugIns/PlugIn[@id='" + vPlugins[k].nodeValue + "']/Domain[@nr='" + vDomains[i].nodeValue + "']/Area[@nr='" + vItems[j].nodeValue + "']/Issue[@Include='Yes']/@nr",doc)
                if (vIncluded.length > 0){
                    if (vAreas == ''){
                        vAreas = vPlugins[k].nodeValue + '_' + vDomains[i].nodeValue + '_' + vItems[j].nodeValue + '#' + vItems[j].nodeValue + ' ' + xpath.select("/Audit/PlugIns/PlugIn[@id='" + vPlugins[k].nodeValue + "']/Domain[@nr='" + vDomains[i].nodeValue + "']/Area[@nr='" + vItems[j].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
                    } else {
                        vAreas = vAreas + '|' + vPlugins[k].nodeValue + '_' + vDomains[i].nodeValue + '_' + vItems[j].nodeValue + '#' + vItems[j].nodeValue + ' ' + xpath.select("/Audit/PlugIns/PlugIn[@id='" + vPlugins[k].nodeValue + "']/Domain[@nr='" + vDomains[i].nodeValue + "']/Area[@nr='" + vItems[j].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
                    }
                }
            }
        }
    }

    return vAreas;
};

function GetIssuesForFindings(fileid, selectedLang = credentials.WorkLang){
    var vIssues = '';

    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    var vDomains = xpath.select("/Audit/ActiveITAuditDomains/Domain/@nr",doc);
    for (var i=0; i<vDomains.length; i++) {
        var vAreas = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vDomains[i].nodeValue + "']/Area/@nr",doc);
        for (var j=0; j<vAreas.length; j++) {
            var vItems = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vDomains[i].nodeValue + "']/Area[@nr='" + vAreas[j].nodeValue + "']/Issue/@nr",doc);
            for (var m=0; m<vItems.length; m++) {
                var vIncluded =  xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vDomains[i].nodeValue + "']/Area[@nr='" + vAreas[j].nodeValue + "']/Issue[@nr='" + vItems[m].nodeValue + "']/@Include",doc)[0].nodeValue;
                if (vIncluded == "Yes"){ 
                    if (vIssues == ''){
                        vIssues = 'AITAM_' + vDomains[i].nodeValue + '_' + vAreas[j].nodeValue + '_' + vItems[m].nodeValue + '#' + vItems[m].nodeValue + ' ' + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vDomains[i].nodeValue + "']/Area[@nr='" + vAreas[j].nodeValue + "']/Issue[@nr='" + vItems[m].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
                    } else {
                        vIssues = vIssues + '|' + 'AITAM_' + vDomains[i].nodeValue + '_' + vAreas[j].nodeValue + '_' + vItems[m].nodeValue + '#' + vItems[m].nodeValue + ' ' + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vDomains[i].nodeValue + "']/Area[@nr='" + vAreas[j].nodeValue + "']/Issue[@nr='" + vItems[m].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
                    }
                }
            }
        }
    }

    var vPlugins = xpath.select("/Audit/PlugIns/PlugIn/@id",doc);
    for (var k=0; k<vPlugins.length; k++) {
        var vDomains = xpath.select("/Audit/PlugIns/PlugIn[@id='" + vPlugins[k].nodeValue + "']/Domain/@nr",doc);
        for (var i=0; i<vDomains.length; i++) {
            var vAreas = xpath.select("/Audit/PlugIns/PlugIn[@id='" + vPlugins[k].nodeValue + "']/Domain[@nr='" + vDomains[i].nodeValue + "']/Area/@nr",doc);
            for (var j=0; j<vAreas.length; j++) {
                var vItems = xpath.select("/Audit/PlugIns/PlugIn[@id='" + vPlugins[k].nodeValue + "']/Domain[@nr='" + vDomains[i].nodeValue + "']/Area[@nr='" + vAreas[j].nodeValue + "']/Issue/@nr",doc);
                for (var m=0; m<vItems.length; m++) {
                    var vIncluded =  xpath.select("/Audit/PlugIns/PlugIn[@id='" + vPlugins[k].nodeValue + "']/Domain[@nr='" + vDomains[i].nodeValue + "']/Area[@nr='" + vAreas[j].nodeValue + "']/Issue[@nr='" + vItems[m].nodeValue + "']/@Include",doc)[0].nodeValue;
                    if (vIncluded == "Yes"){ 
                        if (vIssues == ''){
                            vIssues = vPlugins[k].nodeValue + '_' + vDomains[i].nodeValue + '_' + vAreas[j].nodeValue + '_' + vItems[m].nodeValue + '#' + vItems[m].nodeValue + ' ' + xpath.select("/Audit/PlugIns/PlugIn[@id='" + vPlugins[k].nodeValue + "']/Domain[@nr='" + vDomains[i].nodeValue + "']/Area[@nr='" + vAreas[j].nodeValue + "']/Issue[@nr='" + vItems[m].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
                        } else {
                            vIssues = vIssues + '|' + vPlugins[k].nodeValue + '_' + vDomains[i].nodeValue + '_' + vAreas[j].nodeValue + '_' + vItems[m].nodeValue + '#' + vItems[m].nodeValue + ' ' + xpath.select("/Audit/PlugIns/PlugIn[@id='" + vPlugins[k].nodeValue + "']/Domain[@nr='" + vDomains[i].nodeValue + "']/Area[@nr='" + vAreas[j].nodeValue + "']/Issue[@nr='" + vItems[m].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
                        }
                    }
                }
            }
        }
    }

    return vIssues;
};

function GetCategories2Recommendations(){
    var vSources = '(Not defined yet)';
    var fileid = credentials.CoreSetPath;
    fileid = fileid +  'classifications.xml';
console.log(fileid);
    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);
    var vItems = xpath.select("//item/@name",doc);
    for (var i=0; i<vItems.length; i++) {
        vSources = vSources + '|' + vItems[i].nodeValue;
    }
    return vSources;
};


function LoadRecommendationMatrix(fileid, RecommendationId, selectedLang = credentials.WorkLang, newRecNumber) {
    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);
    var tempDescription ='';
    var ColFindings=[];
    var vSource = '';
    var vDomain = '';
    var vArea = '';
    var vIssue = '';
    var vFindName = '';
    var recNumber=0;
    var vFindNumber = 0;
    var RelFindName = ''
    var RelFindNumber = 0;

    var vFindings = xpath.select("/Audit/Cases/Case/@nr",doc);

    for (var i=0; i<vFindings.length; i++) {
        vSource = xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/cts/@source",doc)[0].nodeValue;
        vDomain = xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/cts/@domain",doc)[0].nodeValue;
        vArea =xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/cts/@area",doc)[0].nodeValue;
        vIssue = xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/cts/@issue",doc)[0].nodeValue;

        if (xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/quote[@type='description']/.",doc)[0].firstChild === null)
        {
            tempDescription= '';
        }else{
            tempDescription= xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/quote[@type='description']/.",doc)[0].firstChild.nodeValue;
        };
        if (xpath.select("boolean(/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/@number)",doc)){
            vFindNumber = xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/@number",doc)[0].nodeValue
        } else {
            vFindNumber =0;
        };
        if (xpath.select("boolean(/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/@name)",doc)){
            vFindName = xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/@name",doc)[0].nodeValue
        } else {
            vFindName ='';
        };

        var NewFinding = {
            FindingId: vFindings[i].nodeValue,
            Number: vFindNumber,
            Name: vFindName,
            //This javascript code removes all 3 types of line breaks
            Description: tempDescription.replace(/(\r\n|\n|\r)/gm,""),
            Source: vSource + '|' + vDomain + '|' + vArea + '|' + vIssue,
            Relevant: xpath.select("/Audit/Cases/Case[@nr='" + vFindings[i].nodeValue + "']/@Include",doc)[0].nodeValue
        };
        ColFindings.push(NewFinding);
    };

    tempDescription= '';

    if (RecommendationId != 'New') {
        var res = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + RecommendationId + "']/quote[@type='description']/.",doc);
        if (res.length==1 && res[0].firstChild != null){
            tempDescription=res[0].firstChild.nodeValue;
        } else {
            tempDescription= '';
        };
        
        var res = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + RecommendationId + "']/quote[@type='timeline']/.",doc);
        if (res.length==1 && res[0].firstChild != null){
            tempTimeline=res[0].firstChild.nodeValue;
        } else {
            tempTimeline= '';
        };    
        var res = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + RecommendationId + "']/quote[@type='aplan']/.",doc);
        if (res.length==1 && res[0].firstChild != null){
            tempAPlan=res[0].firstChild.nodeValue;
        } else {
            tempAPlan= '';
        };    
        var res = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + RecommendationId + "']/quote[@type='responsible']/.",doc);
        if (res.length==1 && res[0].firstChild != null){
            tempResponsible=res[0].firstChild.nodeValue;
        } else {
            tempResponsible= '';
        };    
        var res = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + RecommendationId + "']/quote[@type='timeline']/.",doc);
        if (res.length==1 && res[0].firstChild != null){
            tempOutcome=res[0].firstChild.nodeValue;
        } else {
            tempOutcome= '';
        };    
        var res = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + RecommendationId + "']/quote[@type='remarks']/.",doc);
        if (res.length==1 && res[0].firstChild != null){
            tempRemarks=res[0].firstChild.nodeValue;
        } else {
            tempRemarks= '';
        };    
        if (xpath.select("boolean(/Audit/Recommendations/Recommendation[@nr='" + RecommendationId + "']/@number)",doc)){
            recNumber = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + RecommendationId + "']/@number",doc)[0].nodeValue
        };

        var NewEntry = {
            RecId: RecommendationId,
            Priorities: globalvalues.Recommendation.Priority,
            Risks: globalvalues.Recommendation.RiskCharacterization,
            RisksEvaluation: globalvalues.Recommendation.RiskEvaluation,
            ICategories: globalvalues.Recommendation.Importance,
            Categories: [], //GetCategories2Recommendations(),
            Description: tempDescription,
            Number: recNumber,
            Priority: xpath.select("/Audit/Recommendations/Recommendation[@nr='" + RecommendationId + "']/@priority",doc)[0].nodeValue,
            Risk: xpath.select("/Audit/Recommendations/Recommendation[@nr='" + RecommendationId + "']/@risk",doc)[0].nodeValue,
            Riskevaluation: xpath.select("/Audit/Recommendations/Recommendation[@nr='" + RecommendationId + "']/@riskevaluation",doc)[0].nodeValue,
            Accepted: xpath.select("/Audit/Recommendations/Recommendation[@nr='" + RecommendationId + "']/@accepted",doc)[0].nodeValue,
            Repeated: xpath.select("/Audit/Recommendations/Recommendation[@nr='" + RecommendationId + "']/@repeated",doc)[0].nodeValue,
            Importance: xpath.select("/Audit/Recommendations/Recommendation[@nr='" + RecommendationId + "']/@importance",doc)[0].nodeValue,
            Category:  xpath.select("/Audit/Recommendations/Recommendation[@nr='" + RecommendationId + "']/@category",doc)[0].nodeValue,
            Actionplan: tempAPlan,
            Timeline: tempTimeline,
            Outcome: tempOutcome,
            Responsible: tempResponsible,
            Remarks: tempRemarks,
            Findings: ColFindings,
            MonStatus: globalvalues.Recommendation.ImplementationStatus,
            RelFindings: [],
            Monitoring: []
        };

        var vFindings = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + RecommendationId + "']/findings/finding/@nr",doc);
        for (var k=0; k<vFindings.length; k++) {
            if (xpath.select("boolean(/Audit/Cases/Case[@nr='" + vFindings[k].nodeValue + "']/@number)",doc)){
                RelFindNumber = xpath.select("/Audit/Cases/Case[@nr='" + vFindings[k].nodeValue + "']/@number",doc)[0].nodeValue
            } else {
                RelFindNumber =0;
            };
            if (xpath.select("boolean(/Audit/Cases/Case[@nr='" + vFindings[k].nodeValue + "']/@name)",doc)){
                RelFindName = xpath.select("/Audit/Cases/Case[@nr='" + vFindings[k].nodeValue + "']/@name",doc)[0].nodeValue
            } else {
                RelFindName ='';
            };
            var objFinding = {
                RowId: vFindings[k].nodeValue,
                RelFindName: RelFindName,
                RelFindNumber: RelFindNumber
            };
            NewEntry.RelFindings.push(objFinding);
        };

        var vMonitoring = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + RecommendationId + "']/monitoring/assessment/@nr",doc);
        for (var k=0; k<vMonitoring.length; k++) {
            var objMonitoring = {
                RowId: vMonitoring[k].nodeValue,
                Date: xpath.select("/Audit/Recommendations/Recommendation[@nr='" + RecommendationId + "']/monitoring/assessment[@nr='" + vMonitoring[k].nodeValue + "']/@date",doc)[0].nodeValue,
                Status: xpath.select("/Audit/Recommendations/Recommendation[@nr='" + RecommendationId + "']/monitoring/assessment[@nr='" + vMonitoring[k].nodeValue + "']/@status",doc)[0].nodeValue,
                Note: xpath.select("/Audit/Recommendations/Recommendation[@nr='" + RecommendationId + "']/monitoring/assessment[@nr='" + vMonitoring[k].nodeValue + "']/@note",doc)[0].nodeValue
            };
            NewEntry.Monitoring.push(objMonitoring);
        };

    } else {
        var NewEntry = {
            RecId: '(New)',
            Priorities: globalvalues.Recommendation.Priority,
            Risks: globalvalues.Recommendation.RiskCharacterization,
            RisksEvaluation: globalvalues.Recommendation.RiskEvaluation,
            ICategories: globalvalues.Recommendation.Importance,
            Categories: [], //GetCategories2Recommendations(),
            Description: '',
            Number: (parseInt(newRecNumber)+1),
            Priority: '',
            Risk: '',
            Riskevaluation: '',
            Accepted: 'Yes',
            Repeated: 'No',
            Importance: '',
            Category: '(Not defined yet)', 
            Actionplan: '',
            Timeline: '',
            Outcome: '',
            Responsible: '',
            Remarks: '',
            Findings: ColFindings,
            MonStatus: globalvalues.Recommendation.ImplementationStatus,
            RelFindings: [],
            Monitoring: []
        };
    }

    return NewEntry;
};

function LoadPreAssessMatrix(fileid, AreaId, IssueId, selectedLang = credentials.WorkLang) {
    var vTipSection='';
    var vTipItem='';
    var RelatesSection = '';
    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    var NewEntry = {
        AreaId: AreaId,
        IssueId: IssueId,
        Issue: xpath.select("/Audit/Preassessment/paArea[@nr='" + AreaId + "']/paIssue[@nr='" + IssueId + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue,
        Sections: []
    };
    
    var vSections = xpath.select("/Audit/Preassessment/paArea[@nr='" + AreaId + "']/paIssue[@nr='" + IssueId + "']/paMatrix[@nr='01']/paSection/@nr",doc);
    for (var k=0; k<vSections.length; k++) {
        RelatesSection = xpath.select("/Audit/Preassessment/paArea[@nr='" + AreaId + "']/paIssue[@nr='" + IssueId + "']/paMatrix[@nr='01']/paSection[@nr='" + vSections[k].nodeValue + "']/@relatesto",doc)[0].nodeValue;
        if (RelatesSection =='') {
            //static section
            var objSection = {
                SectionId: vSections[k].nodeValue,
                SectionName: xpath.select("/Audit/Preassessment/paArea[@nr='" + AreaId + "']/paIssue[@nr='" + IssueId + "']/paMatrix[@nr='01']/paSection[@nr='" + vSections[k].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue,
                SectionTip:'',
                Elements: []
            };
            var vElements = xpath.select("/Audit/Preassessment/paArea[@nr='" + AreaId + "']/paIssue[@nr='" + IssueId + "']/paMatrix[@nr='01']/paSection[@nr='" + vSections[k].nodeValue + "']/paElement/@nr",doc);
            for (var m=0; m<vElements.length; m++) {
                var RelatesElement = xpath.select("/Audit/Preassessment/paArea[@nr='" + AreaId + "']/paIssue[@nr='" + IssueId + "']/paMatrix[@nr='01']/paSection[@nr='" + vSections[k].nodeValue + "']/paElement[@nr='" + vElements[m].nodeValue + "']/@relatesto",doc)[0].nodeValue;
                if (RelatesElement =='') {
                    var objElement = {
                        RefId: vSections[k].nodeValue + '_' + vElements[m].nodeValue,
                        ElementId:vElements[m].nodeValue,
                        ElementName: xpath.select("/Audit/Preassessment/paArea[@nr='" + AreaId + "']/paIssue[@nr='" + IssueId + "']/paMatrix[@nr='01']/paSection[@nr='" + vSections[k].nodeValue + "']/paElement[@nr='" + vElements[m].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue,
                        ElementTip: '',
                        Type: xpath.select("/Audit/Preassessment/paArea[@nr='" + AreaId + "']/paIssue[@nr='" + IssueId + "']/paMatrix[@nr='01']/paSection[@nr='" + vSections[k].nodeValue + "']/paElement[@nr='" + vElements[m].nodeValue + "']/@type",doc)[0].nodeValue, 
                        Values:xpath.select("/Audit/Preassessment/paArea[@nr='" + AreaId + "']/paIssue[@nr='" + IssueId + "']/paMatrix[@nr='01']/paSection[@nr='" + vSections[k].nodeValue + "']/paElement[@nr='" + vElements[m].nodeValue + "']/@value",doc)[0].nodeValue,
                        Value: xpath.select("/Audit/Preassessment/paArea[@nr='" + AreaId + "']/paIssue[@nr='" + IssueId + "']/paMatrix[@nr='01']/paSection[@nr='" + vSections[k].nodeValue + "']/paElement[@nr='" + vElements[m].nodeValue + "']/val/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue
                    };
                    objSection.Elements.push(objElement);     
                }
            }
            NewEntry.Sections.push(objSection);
        } else if (RelatesSection =='Domain') {
            //dynamic section
            var vDomains = xpath.select("/Audit/ActiveITAuditDomains/Domain/@nr",doc);
            for (var n=0; n<vDomains.length; n++) {
                vTipSection='';
                vTipItem='';
                var res = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vDomains[n].nodeValue + "']/Narrative/narr[@l='" + selectedLang + "']/ak",doc);
                if (res.length==1 && res[0].firstChild != null){
                    vTipSection=res[0].firstChild.nodeValue;
                } else {
                    vTipSection="No data available";
                }
    
                var objSection = {
                    SectionId: vDomains[n].nodeValue,
                    SectionName: xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vDomains[n].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue,
                    SectionTip: vTipSection,
                    Elements: []
                };    
                var vElements = xpath.select("/Audit/Preassessment/paArea[@nr='" + AreaId + "']/paIssue[@nr='" + IssueId + "']/paMatrix[@nr='01']/paSection[@nr='" + vSections[k].nodeValue + "']/paElement/@nr",doc);
                for (var m=0; m<vElements.length; m++) {
                    var RelatesElement = xpath.select("/Audit/Preassessment/paArea[@nr='" + AreaId + "']/paIssue[@nr='" + IssueId + "']/paMatrix[@nr='01']/paSection[@nr='" + vSections[k].nodeValue + "']/paElement[@nr='" + vElements[m].nodeValue + "']/@relatesto",doc)[0].nodeValue;
                    if (RelatesElement =='') {
                        vTipItem='';
                        var elementValue = xpath.select("/Audit/Preassessment/paArea[@nr='" + AreaId + "']/paIssue[@nr='" + IssueId + "']/paMatrix[@nr='01']/paSection[@nr='" + vSections[k].nodeValue + "']/paElement[@nr='" + vElements[m].nodeValue + "']/val/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
                        //check if exists already an instance with value and get value to "elementValue"
                        var TestElementValue = xpath.select("/Audit/Preassessment/paArea[@nr='" + AreaId + "']/paIssue[@nr='" + IssueId + "']/paMatrix[@nr='01']/paSection[@nr='" + vSections[k].nodeValue + "']/Instances/IElement[@nr='" + vSections[k].nodeValue + '|' + vDomains[n].nodeValue + '_' + vElements[m].nodeValue + "']/@name",doc);
                        if (TestElementValue.length > 0){ 
                            elementValue = TestElementValue[0].nodeValue;
                        }
                        var objElement = {
                            RefId: vSections[k].nodeValue + '|' + vDomains[n].nodeValue + '_' + vElements[m].nodeValue,
                            ElementId:vElements[m].nodeValue,
                            ElementName: xpath.select("/Audit/Preassessment/paArea[@nr='" + AreaId + "']/paIssue[@nr='" + IssueId + "']/paMatrix[@nr='01']/paSection[@nr='" + vSections[k].nodeValue + "']/paElement[@nr='" + vElements[m].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue,
                            ElementTip: vTipItem,
                            Type: xpath.select("/Audit/Preassessment/paArea[@nr='" + AreaId + "']/paIssue[@nr='" + IssueId + "']/paMatrix[@nr='01']/paSection[@nr='" + vSections[k].nodeValue + "']/paElement[@nr='" + vElements[m].nodeValue + "']/@type",doc)[0].nodeValue, 
                            Values:xpath.select("/Audit/Preassessment/paArea[@nr='" + AreaId + "']/paIssue[@nr='" + IssueId + "']/paMatrix[@nr='01']/paSection[@nr='" + vSections[k].nodeValue + "']/paElement[@nr='" + vElements[m].nodeValue + "']/@value",doc)[0].nodeValue,
                            Value: elementValue
                        };
                        objSection.Elements.push(objElement);     
                    } else if (RelatesElement =='Area') {
                        //get default value to apply
                        var elementValue = xpath.select("/Audit/Preassessment/paArea[@nr='" + AreaId + "']/paIssue[@nr='" + IssueId + "']/paMatrix[@nr='01']/paSection[@nr='" + vSections[k].nodeValue + "']/paElement[@nr='" + vElements[m].nodeValue + "']/val/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
                        //check core AITAm
                        var vAreas = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vDomains[n].nodeValue + "']/Area/@nr",doc)
                        for (var y=0; y<vAreas.length; y++) {
                            vTipItem='';
                            //check if exists already an instance with value and get value to "elementValue"
                            var TestElementValue = xpath.select("/Audit/Preassessment/paArea[@nr='" + AreaId + "']/paIssue[@nr='" + IssueId + "']/paMatrix[@nr='01']/paSection[@nr='" + vSections[k].nodeValue + "']/Instances/IElement[@nr='" + vSections[k].nodeValue + '|' + vDomains[n].nodeValue + '_' + vElements[m].nodeValue + '|' + vAreas[y].nodeValue + "']/@name",doc);
                            if (TestElementValue.length > 0){ 
                                elementValue = TestElementValue[0].nodeValue; 
                            }
                            var res = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vDomains[n].nodeValue + "']/Area[@nr='" + vAreas[y].nodeValue + "']/Narrative/narr[@l='" + selectedLang + "']/ak",doc);
                            if (res.length==1 && res[0].firstChild != null){
                                vTipItem=res[0].firstChild.nodeValue;
                            } else {
                                vTipItem="No data available";
                            }
                
                            var objElement = {
                                RefId: vSections[k].nodeValue + '|' + vDomains[n].nodeValue + '_' + vElements[m].nodeValue + '|' + vAreas[y].nodeValue,
                                ElementId:vAreas[y].nodeValue,
                                ElementName: xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vDomains[n].nodeValue + "']/Area[@nr='" + vAreas[y].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue,
                                ElementTip: vTipItem,
                                Type: xpath.select("/Audit/Preassessment/paArea[@nr='" + AreaId + "']/paIssue[@nr='" + IssueId + "']/paMatrix[@nr='01']/paSection[@nr='" + vSections[k].nodeValue + "']/paElement[@nr='" + vElements[m].nodeValue + "']/@type",doc)[0].nodeValue, 
                                Values:xpath.select("/Audit/Preassessment/paArea[@nr='" + AreaId + "']/paIssue[@nr='" + IssueId + "']/paMatrix[@nr='01']/paSection[@nr='" + vSections[k].nodeValue + "']/paElement[@nr='" + vElements[m].nodeValue + "']/@value",doc)[0].nodeValue,
                                Value: elementValue
                            };
                            objSection.Elements.push(objElement);                                 
                        }
                        //check plugins
                        var vPlugins = xpath.select("/Audit/PlugIns/PlugIn/@id",doc);
                        for (var x=0; x<vPlugins.length; x++) {
                            var vAreas = xpath.select("/Audit/PlugIns/PlugIn[@id='" + vPlugins[x].nodeValue + "']/Domain[@nr='" + vDomains[n].nodeValue + "']/Area/@nr",doc)
                            for (var y=0; y<vAreas.length; y++) {
                                vTipItem='';
                                //check if exists already an instance with value and get value to "elementValue"
                                var TestElementValue = xpath.select("/Audit/Preassessment/paArea[@nr='" + AreaId + "']/paIssue[@nr='" + IssueId + "']/paMatrix[@nr='01']/paSection[@nr='" + vSections[k].nodeValue + "']/Instances/IElement[@nr='" + vSections[k].nodeValue + '|' + vDomains[n].nodeValue + '_' + vElements[m].nodeValue + '|' + vAreas[y].nodeValue + '#' + vPlugins[x].nodeValue + "']/@name",doc);
                                if (TestElementValue.length > 0){ 
                                    elementValue = TestElementValue[0].nodeValue;
                                }    

                                var res = xpath.select("/Audit/PlugIns/PlugIn[@id='" + vPlugins[x].nodeValue + "']/Domain[@nr='" + vDomains[n].nodeValue + "']/Area[@nr='" + vAreas[y].nodeValue + "']/Narrative/narr[@l='" + selectedLang + "']/ak",doc);
                                if (res.length==1 && res[0].firstChild != null){
                                    vTipItem=res[0].firstChild.nodeValue;
                                } else {
                                    vTipItem="No data available";
                                }
                                    
                                var objElement = {
                                    RefId: vSections[k].nodeValue + '|' + vDomains[n].nodeValue + '_' + vElements[m].nodeValue + '|' + vAreas[y].nodeValue + '#' + vPlugins[x].nodeValue,
                                    ElementId:vAreas[y].nodeValue,
                                    ElementName: xpath.select("/Audit/PlugIns/PlugIn[@id='" + vPlugins[x].nodeValue + "']/Domain[@nr='" + vDomains[n].nodeValue + "']/Area[@nr='" + vAreas[y].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue,
                                    Type: xpath.select("/Audit/Preassessment/paArea[@nr='" + AreaId + "']/paIssue[@nr='" + IssueId + "']/paMatrix[@nr='01']/paSection[@nr='" + vSections[k].nodeValue + "']/paElement[@nr='" + vElements[m].nodeValue + "']/@type",doc)[0].nodeValue, 
                                    ElementTip:vTipItem,
                                    Values:xpath.select("/Audit/Preassessment/paArea[@nr='" + AreaId + "']/paIssue[@nr='" + IssueId + "']/paMatrix[@nr='01']/paSection[@nr='" + vSections[k].nodeValue + "']/paElement[@nr='" + vElements[m].nodeValue + "']/@value",doc)[0].nodeValue,
                                    Value: elementValue
                                };
                                objSection.Elements.push(objElement);                                 
                            }
                        }
                    }
                }
                NewEntry.Sections.push(objSection);
            }
        }
        RelatesSection = '';
    }
    
return NewEntry;
};

function SavePlanMatrix(fileid, Catalog, selectedLang = credentials.WorkLang) {
    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    if (Catalog.PluginId == 'CORE'){
        var res = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + Catalog.DomainId + "']/Area[@nr='" + Catalog.AreaId + "']/Issue[@nr='" + Catalog.IssueId + "']/Matrix/Objectives/obj/tx[@l='" + selectedLang + "']/.",doc);
        res[0].setAttribute('name',Catalog.Objectives);    

        var res = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + Catalog.DomainId + "']/Area[@nr='" + Catalog.AreaId + "']/Issue[@nr='" + Catalog.IssueId + "']/Matrix/Criteria/cri/tx[@l='" + selectedLang + "']/.",doc);
        res[0].setAttribute('name',Catalog.Criteria);    

        var res = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + Catalog.DomainId + "']/Area[@nr='" + Catalog.AreaId + "']/Issue[@nr='" + Catalog.IssueId + "']/Matrix/InformationRequired/inf/tx[@l='" + selectedLang + "']/.",doc);
        res[0].setAttribute('name',Catalog.Inforequired);    

        var res = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + Catalog.DomainId + "']/Area[@nr='" + Catalog.AreaId + "']/Issue[@nr='" + Catalog.IssueId + "']/Matrix/AnalysisMethod/anm/tx[@l='" + selectedLang + "']/.",doc);
        res[0].setAttribute('name',Catalog.Method);    

        var res = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + Catalog.DomainId + "']/Area[@nr='" + Catalog.AreaId + "']/Issue[@nr='" + Catalog.IssueId + "']/Matrix/foundPreviously/fp/tx[@l='" + selectedLang + "']/.",doc);
        res[0].setAttribute('name',Catalog.Found);    

        var res = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + Catalog.DomainId + "']/Area[@nr='" + Catalog.AreaId + "']/Issue[@nr='" + Catalog.IssueId + "']/Matrix/Conclusion/clu/tx[@l='" + selectedLang + "']/.",doc);
        res[0].setAttribute('name',Catalog.Conclusion);    

    } else {
        var res = xpath.select("/Audit/PlugIns/PlugIn[@id='" + Catalog.PluginId + "']/Domain[@nr='" + Catalog.DomainId + "']/Area[@nr='" + Catalog.AreaId + "']/Issue[@nr='" + Catalog.IssueId + "']/Matrix/Objectives/obj/tx[@l='" + selectedLang + "']/.",doc);
        res[0].setAttribute('name',Catalog.Objectives);    

        var res = xpath.select("/Audit/PlugIns/PlugIn[@id='" + Catalog.PluginId + "']/Domain[@nr='" + Catalog.DomainId + "']/Area[@nr='" + Catalog.AreaId + "']/Issue[@nr='" + Catalog.IssueId + "']/Matrix/Criteria/cri/tx[@l='" + selectedLang + "']/.",doc);
        res[0].setAttribute('name',Catalog.Criteria);    

        var res = xpath.select("/Audit/PlugIns/PlugIn[@id='" + Catalog.PluginId + "']/Domain[@nr='" + Catalog.DomainId + "']/Area[@nr='" + Catalog.AreaId + "']/Issue[@nr='" + Catalog.IssueId + "']/Matrix/InformationRequired/inf/tx[@l='" + selectedLang + "']/.",doc);
        res[0].setAttribute('name',Catalog.Inforequired);    

        var res = xpath.select("/Audit/PlugIns/PlugIn[@id='" + Catalog.PluginId + "']/Domain[@nr='" + Catalog.DomainId + "']/Area[@nr='" + Catalog.AreaId + "']/Issue[@nr='" + Catalog.IssueId + "']/Matrix/AnalysisMethod/anm/tx[@l='" + selectedLang + "']/.",doc);
        res[0].setAttribute('name',Catalog.Method);    

        var res = xpath.select("/Audit/PlugIns/PlugIn[@id='" + Catalog.PluginId + "']/Domain[@nr='" + Catalog.DomainId + "']/Area[@nr='" + Catalog.AreaId + "']/Issue[@nr='" + Catalog.IssueId + "']/Matrix/foundPreviously/fp/tx[@l='" + selectedLang + "']/.",doc);
        res[0].setAttribute('name',Catalog.Found);    

        var res = xpath.select("/Audit/PlugIns/PlugIn[@id='" + Catalog.PluginId + "']/Domain[@nr='" + Catalog.DomainId + "']/Area[@nr='" + Catalog.AreaId + "']/Issue[@nr='" + Catalog.IssueId + "']/Matrix/Conclusion/clu/tx[@l='" + selectedLang + "']/.",doc);
        res[0].setAttribute('name',Catalog.Conclusion);    
    }

    var writetofile = XMLSerializer.serializeToString(doc);
    writetofile = writetofile.replaceAll(' xmlns="undefined"','');
    writetofile = writetofile.replaceAll(' xmlns="null"','');
    fs.writeFileSync(fileid, writetofile);
    return true;
};

function SaveFindingMatrix(fileid, Catalog, selectedLang = credentials.WorkLang) {
    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    var FindingIdRef='';
    if (Catalog.FindingId == '(New)'){
        // Return today's date and time to create finding reference
        var currentTime = new Date();
        var seconds = currentTime.getSeconds();
        var minutes = currentTime.getMinutes();
        var hour = currentTime.getHours();
        var month = currentTime.getMonth() + 1;
        var day = currentTime.getDate();
        var year = currentTime.getFullYear();      
        FindingIdRef = 'F' + year.toString() + ('0' + month.toString()).slice(-2)  + ('0' + day.toString()).slice(-2) + '-' + ('0' + hour.toString()).slice(-2) + ('0' + minutes.toString()).slice(-2) + ('0' + seconds.toString()).slice(-2);

        var res = xpath.select("/Audit/Cases",doc);
        res[0].appendChild(doc.createElement('Case'));
        res[0].lastChild.setAttribute('nr', FindingIdRef);
        res[0].lastChild.setAttribute('nm', Catalog.Cause);
        res[0].lastChild.setAttribute('eff',Catalog.Result);
        res[0].lastChild.setAttribute('act',Catalog.LegalAct);
        res[0].lastChild.setAttribute('doc',Catalog.ReportReference);
        res[0].lastChild.setAttribute('Include','Yes');
        res[0].lastChild.setAttribute('number',Catalog.Number);
        res[0].lastChild.setAttribute('name',Catalog.Name);
        res[0].lastChild.removeAttribute('xmlns'); 

        var res = xpath.select("/Audit/Cases/Case[@nr='" + FindingIdRef + "']/.",doc);
        res[0].appendChild(doc.createElement('cts'));
        if (Catalog.Source == 'AITAM'){
            res[0].lastChild.setAttribute('source', Catalog.Source);
            res[0].lastChild.setAttribute('domain',Catalog.Domain + ' ' + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + Catalog.Domain + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue);
            res[0].lastChild.setAttribute('area',Catalog.Area + ' ' + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + Catalog.Domain + "']/Area[@nr='" + Catalog.Area + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue);
            res[0].lastChild.setAttribute('issue',Catalog.Issue + ' ' + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + Catalog.Domain + "']/Area[@nr='" + Catalog.Area + "']/Issue[@nr='" + Catalog.Issue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue);
        } else {
            res[0].lastChild.setAttribute('source', Catalog.Source);
            res[0].lastChild.setAttribute('domain',Catalog.Domain + ' ' + xpath.select("/Audit/PlugIns/PlugIn[@id='" + Catalog.Source + "']/Domain[@nr='" + Catalog.Domain + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue);
            res[0].lastChild.setAttribute('area', Catalog.Area + ' ' + xpath.select("/Audit/PlugIns/PlugIn[@id='" + Catalog.Source + "']/Domain[@nr='" + Catalog.Domain + "']/Area[@nr='" + Catalog.Area + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue);
            res[0].lastChild.setAttribute('issue', Catalog.Issue + ' ' + xpath.select("/Audit/PlugIns/PlugIn[@id='" + Catalog.Source + "']/Domain[@nr='" + Catalog.Domain + "']/Area[@nr='" + Catalog.Area + "']/Issue[@nr='" + Catalog.Issue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue);
        }
        res[0].appendChild(doc.createElement('quote'));
        res[0].lastChild.setAttribute('type', 'description');
        res[0].lastChild.appendChild(doc.createTextNode(Catalog.Description));
        res[0].appendChild(doc.createElement('quote'));
        res[0].lastChild.setAttribute('type', 'recommendation');
        res[0].lastChild.appendChild(doc.createTextNode(Catalog.Recommendation));
    } else {
        FindingIdRef = Catalog.FindingId;
        var res = xpath.select("/Audit/Cases/Case[@nr='" + Catalog.FindingId + "']/.",doc);
        res[0].setAttribute('nm', Catalog.Cause);
        res[0].setAttribute('eff',Catalog.Result);
        res[0].setAttribute('act',Catalog.LegalAct);
        res[0].setAttribute('doc',Catalog.ReportReference);
        if (xpath.select("boolean(/Audit/Cases/Case[@nr='" + Catalog.FindingId + "']/@number)",doc)){
            res[0].setAttribute('number',Catalog.Number);
        } else {
            res[0].setAttribute('number',Catalog.Number);
        };
        if (xpath.select("boolean(/Audit/Cases/Case[@nr='" + Catalog.FindingId + "']/@name)",doc)){
            res[0].setAttribute('name',Catalog.Name);
        } else {
            res[0].setAttribute('name',Catalog.Name);
        };

        if (Catalog.Source == 'AITAM'){
            var res = xpath.select("/Audit/Cases/Case[@nr='" + Catalog.FindingId + "']/cts/.",doc);
            res[0].setAttribute('source', Catalog.Source);
            res[0].setAttribute('domain',Catalog.Domain + ' ' + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + Catalog.Domain + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue);
            res[0].setAttribute('area',Catalog.Area + ' ' + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + Catalog.Domain + "']/Area[@nr='" + Catalog.Area + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue);
            res[0].setAttribute('issue',Catalog.Issue + ' ' + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + Catalog.Domain + "']/Area[@nr='" + Catalog.Area + "']/Issue[@nr='" + Catalog.Issue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue);
        } else {
            var res = xpath.select("/Audit/Cases/Case[@nr='" + Catalog.FindingId + "']/cts/.",doc);
            res[0].setAttribute('source', Catalog.Source);
            res[0].setAttribute('domain',Catalog.Domain + ' ' + xpath.select("/Audit/PlugIns/PlugIn[@id='" + Catalog.Source + "']/Domain[@nr='" + Catalog.Domain + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue);
            res[0].setAttribute('area', Catalog.Area + ' ' + xpath.select("/Audit/PlugIns/PlugIn[@id='" + Catalog.Source + "']/Domain[@nr='" + Catalog.Domain + "']/Area[@nr='" + Catalog.Area + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue);
            res[0].setAttribute('issue', Catalog.Issue + ' ' + xpath.select("/Audit/PlugIns/PlugIn[@id='" + Catalog.Source + "']/Domain[@nr='" + Catalog.Domain + "']/Area[@nr='" + Catalog.Area + "']/Issue[@nr='" + Catalog.Issue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue);
        }
        if (Catalog.Description != null && Catalog.Description != '')
        {
            console.log(Catalog.Description);
            if (xpath.select("/Audit/Cases/Case[@nr='" + Catalog.FindingId + "']/quote[@type='description']/.",doc)[0].firstChild === null)
            {
                var res = xpath.select("/Audit/Cases/Case[@nr='" + Catalog.FindingId + "']/quote[@type='description']/.",doc);
                res[0].appendChild(doc.createTextNode(Catalog.Description));
            } else {
                var res = xpath.select("/Audit/Cases/Case[@nr='" + Catalog.FindingId + "']/quote[@type='description']/.",doc);
                res[0].removeChild(res);
                res[0].appendChild(doc.createTextNode(Catalog.Description));
                // console.log(res.data);
                //res[0].firstChild.data=Catalog.Description;
            }
        }
        if (Catalog.Recommendation != null && Catalog.Recommendation != '')
        {
            if (xpath.select("/Audit/Cases/Case[@nr='" + Catalog.FindingId + "']/quote[@type='recommendation']/.",doc)[0].firstChild === null)
            {
                var res = xpath.select("/Audit/Cases/Case[@nr='" + Catalog.FindingId + "']/quote[@type='recommendation']/.",doc);
                res[0].appendChild(doc.createTextNode(Catalog.Recommendation));
            } else {
                var res = xpath.select("/Audit/Cases/Case[@nr='" + Catalog.FindingId + "']/quote[@type='recommendation']/.",doc);
                res[0].removeChild(res);
                res[0].appendChild(doc.createTextNode(Catalog.Recommendation));
                //res[0].firstChild.data=Catalog.Recommendation;
            }
        }
    }
    var writetofile = XMLSerializer.serializeToString(doc);
    writetofile = writetofile.replaceAll(' xmlns="undefined"','');
    writetofile = writetofile.replaceAll(' xmlns="null"','');
    fs.writeFileSync(fileid, writetofile);
    return FindingIdRef;
};

function SavePreAssessMatrix(fileid, Catalog, AreaId, IssueId, selectedLang = credentials.WorkLang) {
    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);
    
    var commonXpath = "/Audit/Preassessment/paArea[@nr='" + AreaId + "']/paIssue[@nr='" + IssueId + "']/paMatrix[@nr='01']";

    for (let i = 0; i < Catalog.length; i++) {
        if (Catalog[i].Type == 'Element'){
            var vItems = Catalog[i].Reference.split("_");
            var res = xpath.select(commonXpath + "/paSection[@nr='" + vItems[0] + "']/paElement[@nr='" + vItems[1] + "']/val/tx[@l='" + selectedLang + "']/.",doc);
            if (res.length == 0) {
                var Parent = xpath.select(commonXpath + "/paSection[@nr='" + vItems[0] + "']/paElement[@nr='" + vItems[1] + "']/val",doc);
                Parent[0].appendChild(doc.createElement('tx'));
                Parent[0].lastChild.setAttribute('l', selectedLang);
                Parent[0].lastChild.setAttribute('name', Catalog[i].Value);
            } else {
                res[0].setAttribute('name', Catalog[i].Value);
            }
        } else {
            var vSection = '';
            var vItems = Catalog[i].Reference.split("_");
            if (vItems[0].indexOf("|")== -1){
                vSection = vItems[0];
            } else {
                var subItems = vItems[0].split("|");
                vSection = subItems[0];
            }
            var res = xpath.select(commonXpath + "/paSection[@nr='" + vSection + "']/Instances",doc);
            if (res.length == 0) {
                var Parent = xpath.select(commonXpath + "/paSection[@nr='" + vSection + "']/.",doc);
                Parent[0].appendChild(doc.createElement('Instances'));
                Parent[0].lastChild.setAttribute('l', selectedLang);
                Parent[0].lastChild.setAttribute('name', Catalog[i].Value);
                Parent[0].lastChild.removeAttribute('ns')
            }
            res = xpath.select(commonXpath + "/paSection[@nr='" + vSection + "']/Instances/IElement[@nr='" + Catalog[i].Reference + "' and @l='" + selectedLang + "']/.",doc);
            if (res.length == 0) {
                var Parent = xpath.select(commonXpath + "/paSection[@nr='" + vSection + "']/Instances",doc);
                Parent[0].appendChild(doc.createElement('IElement'));
                Parent[0].lastChild.setAttribute('nr', Catalog[i].Reference);
                Parent[0].lastChild.setAttribute('l', selectedLang);
                Parent[0].lastChild.setAttribute('name', Catalog[i].Value);
            } else {
                res[0].setAttribute('name', Catalog[i].Value);
            }
        }
    }

    var writetofile = XMLSerializer.serializeToString(doc);
    writetofile = writetofile.replaceAll(' xmlns="undefined"','');
    writetofile = writetofile.replaceAll(' xmlns="null"','');
    fs.writeFileSync(fileid, writetofile);
    return true;
};

function SaveRecommendationMatrix(fileid, Catalog, selectedLang = credentials.WorkLang) {
    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    if (xpath.select("/Audit/Recommendations",doc).length === 0)
    {
        var res1 = xpath.select("/Audit",doc);
        res1[0].appendChild(doc.createElement('Recommendations'));
    };

    var RecommendationIdRef='';
    if (Catalog.RecommendationId == '(New)'){
        // Return today's date and time to create finding reference
        var currentTime = new Date();
        var seconds = currentTime.getSeconds();
        var minutes = currentTime.getMinutes();
        var hour = currentTime.getHours();
        var month = currentTime.getMonth() + 1;
        var day = currentTime.getDate();
        var year = currentTime.getFullYear();      
        RecommendationIdRef = 'R' + year.toString() + ('0' + month.toString()).slice(-2)  + ('0' + day.toString()).slice(-2) + '-' + ('0' + hour.toString()).slice(-2) + ('0' + minutes.toString()).slice(-2) + ('0' + seconds.toString()).slice(-2);

        var res = xpath.select("/Audit/Recommendations",doc);
        res[0].appendChild(doc.createElement('Recommendation'));
        res[0].lastChild.setAttribute('nr', RecommendationIdRef);
        res[0].lastChild.setAttribute('priority', Catalog.Priority);
        res[0].lastChild.setAttribute('risk',Catalog.Risk);
        res[0].lastChild.setAttribute('riskevaluation',Catalog.Riskevaluation);
        res[0].lastChild.setAttribute('accepted',Catalog.Accepted);
        res[0].lastChild.setAttribute('repeated',Catalog.Repeated);
        res[0].lastChild.setAttribute('importance',Catalog.Importance);
        res[0].lastChild.setAttribute('category',Catalog.Category);
        res[0].lastChild.setAttribute('number',Catalog.Number);

        var res = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + RecommendationIdRef + "']/.",doc);
        res[0].appendChild(doc.createElement('quote'));
        res[0].lastChild.setAttribute('type', 'description');
        res[0].lastChild.appendChild(doc.createTextNode(Catalog.Description));
        res[0].appendChild(doc.createElement('quote'));
        res[0].lastChild.setAttribute('type', 'aplan');
        res[0].lastChild.appendChild(doc.createTextNode(Catalog.Actionplan));
        res[0].appendChild(doc.createElement('quote'));
        res[0].lastChild.setAttribute('type', 'responsible');
        res[0].lastChild.appendChild(doc.createTextNode(Catalog.Responsible));
        res[0].appendChild(doc.createElement('quote'));
        res[0].lastChild.setAttribute('type', 'timeline');
        res[0].lastChild.appendChild(doc.createTextNode(Catalog.Timeline));
        res[0].appendChild(doc.createElement('quote'));
        res[0].lastChild.setAttribute('type', 'outcome');
        res[0].lastChild.appendChild(doc.createTextNode(Catalog.Outcome));
        res[0].appendChild(doc.createElement('quote'));
        res[0].lastChild.setAttribute('type', 'remarks');
        res[0].lastChild.appendChild(doc.createTextNode(Catalog.Remarks));

        var res = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + RecommendationIdRef + "']/.",doc);
        res[0].appendChild(doc.createElement('findings'));
        res[0].appendChild(doc.createElement('monitoring'));

        for (var x=0; x<Catalog.RelFindings.length; x++) {
            var res1 = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + RecommendationIdRef + "']/findings",doc);
            res1[0].appendChild(doc.createElement('finding'));
            res1[0].lastChild.setAttribute('nr', Catalog.RelFindings[x].RowId);
        }
        for (var y=0; y<Catalog.Monitoring.length; y++) {
            var res2 = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + RecommendationIdRef + "']/monitoring",doc);
            res2[0].appendChild(doc.createElement('assessment'));
            res2[0].lastChild.setAttribute('nr', Catalog.Monitoring[y].RowId);
            res2[0].lastChild.setAttribute('date', Catalog.Monitoring[y].Date);
            res2[0].lastChild.setAttribute('status', Catalog.Monitoring[y].Status);
            res2[0].lastChild.setAttribute('note', Catalog.Monitoring[y].Note);
        }
    } else {
        RecommendationIdRef = Catalog.RecommendationId;
        var res = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + Catalog.RecommendationId + "']/.",doc);
        res[0].setAttribute('priority', Catalog.Priority);
        res[0].setAttribute('risk',Catalog.Risk);
        res[0].setAttribute('riskevaluation',Catalog.Riskevaluation);
        res[0].setAttribute('accepted',Catalog.Accepted);
        res[0].setAttribute('repeated',Catalog.Repeated);
        res[0].setAttribute('importance',Catalog.Importance);
        res[0].setAttribute('category',Catalog.Category);
        if (xpath.select("boolean(/Audit/Recommendations/Recommendation[@nr='" + Catalog.RecommendationId + "']/@number)",doc)){
            res[0].setAttribute('number',Catalog.Number);
        } else {
            res[0].setAttribute('number',Catalog.Number);
        };

        if (Catalog.Description != null && Catalog.Description != '')
        {
            if (xpath.select("/Audit/Recommendations/Recommendation[@nr='" + Catalog.RecommendationId + "']/quote[@type='description']/.",doc)[0].firstChild === null)
            {
                var res = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + Catalog.RecommendationId + "']/quote[@type='description']/.",doc);
                res[0].appendChild(doc.createTextNode(Catalog.Description));
            } else {
                var res = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + Catalog.RecommendationId + "']/quote[@type='description']/.",doc);
                res[0].removeChild(res);
                res[0].appendChild(doc.createTextNode(Catalog.Description));
                //res[0].firstChild.data=Catalog.Description;
            }
        }
        if (Catalog.Actionplan != null && Catalog.Actionplan != '')
        {
            if (xpath.select("/Audit/Recommendations/Recommendation[@nr='" + Catalog.RecommendationId + "']/quote[@type='aplan']/.",doc)[0].firstChild === null)
            {
                var res = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + Catalog.RecommendationId + "']/quote[@type='aplan']/.",doc);
                res[0].appendChild(doc.createTextNode(Catalog.Actionplan));
            } else {
                var res = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + Catalog.RecommendationId + "']/quote[@type='aplan']/.",doc);
                res[0].removeChild(res);
                res[0].appendChild(doc.createTextNode(Catalog.Actionplan));
                //res[0].firstChild.data=Catalog.Actionplan;
                }
        }
        if (Catalog.Responsible != null && Catalog.Responsible != '')
        {
            if (xpath.select("/Audit/Recommendations/Recommendation[@nr='" + Catalog.RecommendationId + "']/quote[@type='responsible']/.",doc)[0].firstChild === null)
            {
                var res = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + Catalog.RecommendationId + "']/quote[@type='responsible']/.",doc);
                res[0].appendChild(doc.createTextNode(Catalog.Responsible));
            } else {
                var res = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + Catalog.RecommendationId + "']/quote[@type='responsible']/.",doc);
                res[0].removeChild(res);
                res[0].appendChild(doc.createTextNode(Catalog.Responsible));
                //res[0].firstChild.data=Catalog.Responsible;
            }
        }
        if (Catalog.Timeline != null && Catalog.Timeline != '')
        {
            if (xpath.select("/Audit/Recommendations/Recommendation[@nr='" + Catalog.RecommendationId + "']/quote[@type='timeline']/.",doc)[0].firstChild === null)
            {
                var res = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + Catalog.RecommendationId + "']/quote[@type='timeline']/.",doc);
                res[0].appendChild(doc.createTextNode(Catalog.Timeline));
            } else {
                var res = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + Catalog.RecommendationId + "']/quote[@type='timeline']/.",doc);
                res[0].removeChild(res);
                res[0].appendChild(doc.createTextNode(Catalog.Timeline));
                //res[0].firstChild.data=Catalog.Timeline;
            }
        }
        if (Catalog.Outcome != null && Catalog.Outcome != '')
        {
            if (xpath.select("/Audit/Recommendations/Recommendation[@nr='" + Catalog.RecommendationId + "']/quote[@type='outcome']/.",doc)[0].firstChild === null)
            {
                var res = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + Catalog.RecommendationId + "']/quote[@type='outcome']/.",doc);
                res[0].appendChild(doc.createTextNode(Catalog.Outcome));
            } else {
                var res = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + Catalog.RecommendationId + "']/quote[@type='outcome']/.",doc);
                res[0].removeChild(res);
                res[0].appendChild(doc.createTextNode(Catalog.Outcome));
                //res[0].firstChild.data=Catalog.Outcome;
            }
        }
        if (Catalog.Remarks != null && Catalog.Remarks != '')
        {
            if (xpath.select("/Audit/Recommendations/Recommendation[@nr='" + Catalog.RecommendationId + "']/quote[@type='remarks']/.",doc)[0].firstChild === null)
            {
                var res = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + Catalog.RecommendationId + "']/quote[@type='remarks']/.",doc);
                res[0].appendChild(doc.createTextNode(Catalog.Remarks));
            } else {
                var res = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + Catalog.RecommendationId + "']/quote[@type='remarks']/.",doc);
                res[0].removeChild(res);
                res[0].appendChild(doc.createTextNode(Catalog.Remarks));
                //res[0].firstChild.data=Catalog.Remarks;
            }
        }
        if (xpath.select("/Audit/Recommendations/Recommendation[@nr='" + Catalog.RecommendationId + "']/findings",doc).length !== 0){
            var vItem2Delete = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + Catalog.RecommendationId + "']/findings",doc);
            res[0].removeChild(vItem2Delete[0]);    
        };
        var res = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + RecommendationIdRef + "']/.",doc);
        res[0].appendChild(doc.createElement('findings'));

        if (xpath.select("/Audit/Recommendations/Recommendation[@nr='" + Catalog.RecommendationId + "']/monitoring",doc).length !== 0){
            var vItem2Delete = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + Catalog.RecommendationId + "']/monitoring",doc);
            res[0].removeChild(vItem2Delete[0]);    
        };
        var res = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + RecommendationIdRef + "']/.",doc);
        res[0].appendChild(doc.createElement('monitoring'));

        for (var x=0; x<Catalog.RelFindings.length; x++) {
            var res1 = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + Catalog.RecommendationId + "']/findings",doc);
            res1[0].appendChild(doc.createElement('finding'));
            res1[0].lastChild.setAttribute('nr', Catalog.RelFindings[x].RowId);
        }
        for (var y=0; y<Catalog.Monitoring.length; y++) {
            var res2 = xpath.select("/Audit/Recommendations/Recommendation[@nr='" + Catalog.RecommendationId + "']/monitoring",doc);
            res2[0].appendChild(doc.createElement('assessment'));
            res2[0].lastChild.setAttribute('nr', Catalog.Monitoring[y].RowId);
            res2[0].lastChild.setAttribute('date', Catalog.Monitoring[y].Date);
            res2[0].lastChild.setAttribute('status', Catalog.Monitoring[y].Status);
            res2[0].lastChild.setAttribute('note', Catalog.Monitoring[y].Note);
        }

    }
    var writetofile = XMLSerializer.serializeToString(doc);
    writetofile = writetofile.replaceAll(' xmlns="undefined"','');
    writetofile = writetofile.replaceAll(' xmlns="null"','');
    fs.writeFileSync(fileid, writetofile);
    return RecommendationIdRef;
};

module.exports.LoadPlanMatrix = LoadPlanMatrix;
module.exports.LoadFindingMatrix = LoadFindingMatrix;
module.exports.LoadPreAssessMatrix = LoadPreAssessMatrix;
module.exports.LoadRecommendationMatrix = LoadRecommendationMatrix;
module.exports.SavePlanMatrix = SavePlanMatrix;
module.exports.SaveFindingMatrix = SaveFindingMatrix;
module.exports.SavePreAssessMatrix = SavePreAssessMatrix;
module.exports.SaveRecommendationMatrix = SaveRecommendationMatrix;