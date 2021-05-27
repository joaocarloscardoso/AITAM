//common business functions
var commonF = require('./common.js');

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
var Catalog = [];

function MergePlugInData(doc, vPointerDomain, selectedLang = credentials.WorkLang) {
    var vTipDomain='';
    var vTipArea='';
    var vTipIssue='';

    var vItemsId = xpath.select("/Audit/PlugIns/PlugIn/@id",doc);
    for (var i=0; i<vItemsId.length; i++) {
        varPluginId = vItemsId[i].nodeValue;
        var vAreas = xpath.select("/Audit/PlugIns/PlugIn[@id='" + varPluginId + "']/Domain[@nr='" + vPointerDomain + "']/Area/@nr",doc);
        for (var j=0; j<vAreas.length; j++) {
            var vPointerArea=vAreas[j].nodeValue;

            var vDescrDomain= vPointerDomain + ' - ' + xpath.select("/Audit/PlugIns/PlugIn/Domain[@nr='" + vPointerDomain + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
            //var PluginId = xpath.select("/Audit/PlugIns/PlugIn/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/../../@id",doc)[0].nodeValue;
    
            var res=xpath.select("/Audit/PlugIns/PlugIn[@id='" + varPluginId + "']/Domain[@nr='" + vPointerDomain + "']/Narrative/narr[@l='" + selectedLang + "']/ak",doc);
            if (res.length==1 && res[0].firstChild != null){
                vTipDomain=res[0].firstChild.nodeValue;
            } else {
                vTipDomain="No data available";
            }
    
            var vDescrArea=vPointerArea + ' - (' + varPluginId + ') ' + xpath.select("/Audit/PlugIns/PlugIn/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
            res=xpath.select("/Audit/PlugIns/PlugIn[@id='" + varPluginId + "']/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Narrative/narr[@l='" + selectedLang + "']/ak",doc);
            if (res.length==1 && res[0].firstChild != null){
                vTipArea=res[0].firstChild.nodeValue;
            } else {
                vTipArea="No data available";
            }
    
            var vIssues = xpath.select("/Audit/PlugIns/PlugIn[@id='" + varPluginId + "']/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Issue/@nr",doc);
            for (var k=0; k<vIssues.length; k++) {
    
                var res=xpath.select("/Audit/PlugIns/PlugIn[@id='" + varPluginId + "']/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Issue[@nr='" + vIssues[k].nodeValue + "']/Narrative/narr[@l='" + selectedLang + "']/ak",doc);
                if (res.length==1 && res[0].firstChild != null){
                    vTipIssue=res[0].firstChild.nodeValue;
                } else {
                    vTipIssue="No data available";
                }    
    
                var tmpIssue = vIssues[k].nodeValue + ' '  + xpath.select("/Audit/PlugIns/PlugIn[@id='" + varPluginId + "']/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Issue[@nr='" + vIssues[k].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
                var NumberOfFindings = xpath.select("/Audit/Cases/Case/cts[@source='" + varPluginId + "' and @domain='" + commonF.CleanXMLEntities(vDescrDomain).replace(' - ', ' ') + "' and @area='" + commonF.CleanXMLEntities(vDescrArea).replace(' - ', ' ') + "'  and @issue='" + commonF.CleanXMLEntities(tmpIssue) + "']/@issue",doc).length;

                var NewEntry = {
                    RowId: '#' + String((iCounter+1)),
                    PluginId: varPluginId,
                    Domain: vDescrDomain,
                    DomainId: vPointerDomain,
                    DomainTip: vTipDomain,
                    Area: vDescrArea,
                    AreaId: vPointerArea,
                    AreaTip: vTipArea,
                    Issue: vIssues[k].nodeValue + ' - '  + xpath.select("/Audit/PlugIns/PlugIn[@id='" + varPluginId + "']/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Issue[@nr='" + vIssues[k].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue,
                    IssueId: vIssues[k].nodeValue,
                    IssueTip: vTipIssue,
                    Risk: xpath.select("/Audit/PlugIns/PlugIn[@id='" + varPluginId + "']/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Issue[@nr='" + vIssues[k].nodeValue + "']/@RiskWeight",doc)[0].nodeValue,
                    Selected: xpath.select("/Audit/PlugIns/PlugIn[@id='" + varPluginId + "']/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Issue[@nr='" + vIssues[k].nodeValue + "']/@Include",doc)[0].nodeValue,
                    Remarks: xpath.select("/Audit/PlugIns/PlugIn[@id='" + varPluginId + "']/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Issue[@nr='" + vIssues[k].nodeValue + "']/@Remarks",doc)[0].nodeValue, 
                    Findings: NumberOfFindings
                };
                Catalog.push(NewEntry);        
                iCounter++;   
            }         
        }
    
    }
};

function MergePlugInData2Doc(doc, vPointerDomain, op, selectedLang = credentials.WorkLang) {
    var vTipDomain='';
    var vTipArea='';
    var vTipIssue='';
    var RiskValueName='';

    var vItemsId = xpath.select("/Audit/PlugIns/PlugIn/@id",doc);
    for (var i=0; i<vItemsId.length; i++) {
        varPluginId = vItemsId[i].nodeValue;
        var vAreas = xpath.select("/Audit/PlugIns/PlugIn[@id='" + varPluginId + "']/Domain[@nr='" + vPointerDomain + "']/Area/@nr",doc);
        for (var j=0; j<vAreas.length; j++) {
            var vPointerArea=vAreas[j].nodeValue;

            var vDescrDomain= vPointerDomain + ' - ' + xpath.select("/Audit/PlugIns/PlugIn/Domain[@nr='" + vPointerDomain + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
            //var PluginId = xpath.select("/Audit/PlugIns/PlugIn/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/../../@id",doc)[0].nodeValue;
    
            var res=xpath.select("/Audit/PlugIns/PlugIn[@id='" + varPluginId + "']/Domain[@nr='" + vPointerDomain + "']/Narrative/narr[@l='" + selectedLang + "']/ak",doc);
            if (res.length==1 && res[0].firstChild != null){
                vTipDomain=res[0].firstChild.nodeValue;
            } else {
                vTipDomain="No data available";
            }
    
            var vDescrArea=vPointerArea + ' - (' + varPluginId + ') ' + xpath.select("/Audit/PlugIns/PlugIn/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
            res=xpath.select("/Audit/PlugIns/PlugIn[@id='" + varPluginId + "']/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Narrative/narr[@l='" + selectedLang + "']/ak",doc);
            if (res.length==1 && res[0].firstChild != null){
                vTipArea=res[0].firstChild.nodeValue;
            } else {
                vTipArea="No data available";
            }
    
            var vIssues = xpath.select("/Audit/PlugIns/PlugIn[@id='" + varPluginId + "']/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Issue/@nr",doc);
            for (var k=0; k<vIssues.length; k++) {
    
                var res=xpath.select("/Audit/PlugIns/PlugIn[@id='" + varPluginId + "']/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Issue[@nr='" + vIssues[k].nodeValue + "']/Narrative/narr[@l='" + selectedLang + "']/ak",doc);
                if (res.length==1 && res[0].firstChild != null){
                    vTipIssue=res[0].firstChild.nodeValue;
                } else {
                    vTipIssue="No data available";
                }    
    
                var RiskValue = xpath.select("/Audit/PlugIns/PlugIn[@id='" + varPluginId + "']/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Issue[@nr='" + vIssues[k].nodeValue + "']/@RiskWeight",doc)[0].nodeValue;
                switch (RiskValue){
                    case "3":
                        RiskValueName="High";
                        break;
                    case "2":
                        RiskValueName="Medium";
                        break;
                    case "1":
                        RiskValueName="Low";
                }
                var NewEntry = {
                    RowId: '#' + String((iCounter+1)),
                    PluginId: varPluginId,
                    Domain: vDescrDomain,
                    DomainId: vPointerDomain,
                    DomainTip: vTipDomain,
                    Area: vDescrArea,
                    AreaId: vPointerArea,
                    AreaTip: vTipArea,
                    Issue: vIssues[k].nodeValue + ' - '  + xpath.select("/Audit/PlugIns/PlugIn[@id='" + varPluginId + "']/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Issue[@nr='" + vIssues[k].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue,
                    IssueId: vIssues[k].nodeValue,
                    IssueTip: vTipIssue,
                    Risk: RiskValueName,
                    Selected: xpath.select("/Audit/PlugIns/PlugIn[@id='" + varPluginId + "']/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Issue[@nr='" + vIssues[k].nodeValue + "']/@Include",doc)[0].nodeValue,
                    Remarks: xpath.select("/Audit/PlugIns/PlugIn[@id='" + varPluginId + "']/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Issue[@nr='" + vIssues[k].nodeValue + "']/@Remarks",doc)[0].nodeValue
                };
                if (op==='risk' && NewEntry.Risk==='Medium' || NewEntry.Risk==='High')
                {
                    Catalog.push(NewEntry);        
                }
                if (op==='included' && NewEntry.Selected==='Yes')
                {
                    Catalog.push(NewEntry);        
                }
                if (op==='all')
                {
                    Catalog.push(NewEntry);        
                }
                iCounter++;   
            }         
        }
    
    }
};

function LoadPlanning(fileid, selectedLang = credentials.WorkLang) {
    Catalog = [];

    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    var vPointerDomain='';
    var vDescrDomain='';
    var vTipDomain='';
    var vTipArea='';
    var vTipIssue='';
    iCounter = 0;
    var vDomains = xpath.select("/Audit/ActiveITAuditDomains/Domain/@nr",doc);
    for (var i=0; i<vDomains.length; i++) {
        if (vPointerDomain != vDomains[i].nodeValue) {
            if (vPointerDomain != '') {
                //call method to get plugins data
                MergePlugInData(doc, vPointerDomain);
            }
            vPointerDomain = vDomains[i].nodeValue;
            vDescrDomain= vPointerDomain + ' - ' + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vPointerDomain + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
            var res = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vPointerDomain + "']/Narrative/narr[@l='" + selectedLang + "']/ak",doc);
            if (res.length==1 && res[0].firstChild != null){
                vTipDomain=res[0].firstChild.nodeValue;
            } else {
                vTipDomain="No data available";
            }
        }

        var vAreas = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vPointerDomain + "']/Area/@nr",doc);
        for (var j=0; j<vAreas.length; j++) {
            var vPointerArea=vAreas[j].nodeValue;
            var vDescrArea=vPointerArea + ' - ' + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
            var res = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Narrative/narr[@l='" + selectedLang + "']/ak",doc);
            if (res.length==1 && res[0].firstChild != null){
                vTipArea=res[0].firstChild.nodeValue;
            } else {
                vTipArea="No data available";
            }

            var vIssues = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Issue/@nr",doc);
            for (var k=0; k<vIssues.length; k++) {
                var res = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Issue[@nr='" + vIssues[k].nodeValue + "']/Narrative/narr[@l='" + selectedLang + "']/ak",doc);
                if (res.length==1 && res[0].firstChild != null){
                    vTipIssue=res[0].firstChild.nodeValue;
                } else {
                    vTipIssue="No data available";
                }    

                var tmpIssue = vIssues[k].nodeValue + ' '  + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Issue[@nr='" + vIssues[k].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
                var NumberOfFindings = xpath.select("/Audit/Cases/Case/cts[@source='AITAM' and @domain='" + commonF.CleanXMLEntities(vDescrDomain).replace(' - ', ' ')  + "' and @area='" + commonF.CleanXMLEntities(vDescrArea).replace(' - ', ' ')  + "'  and @issue='" + commonF.CleanXMLEntities(tmpIssue)  + "']/@issue",doc).length;

                var NewEntry = {
                    RowId: '#' + String((iCounter+1)),
                    PluginId: 'CORE',
                    Domain: vDescrDomain,
                    DomainId: vPointerDomain,
                    DomainTip: vTipDomain,
                    Area: vDescrArea,
                    AreaId: vPointerArea,
                    AreaTip: vTipArea,
                    Issue: vIssues[k].nodeValue + ' - '  + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Issue[@nr='" + vIssues[k].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue,
                    IssueId: vIssues[k].nodeValue,
                    IssueTip: vTipIssue,
                    Risk: xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Issue[@nr='" + vIssues[k].nodeValue + "']/@RiskWeight",doc)[0].nodeValue,
                    Selected: xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Issue[@nr='" + vIssues[k].nodeValue + "']/@Include",doc)[0].nodeValue,
                    Remarks: xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Issue[@nr='" + vIssues[k].nodeValue + "']/@Remarks",doc)[0].nodeValue,
                    Findings: NumberOfFindings
                };
                Catalog.push(NewEntry);        
                iCounter++;   
            }         
        }
    }
    //final call method to get plugins data (if not is going to ignore last domain)
    MergePlugInData(doc, vPointerDomain);
    return Catalog;
};

function LoadPlanning2Doc(fileid, op, selectedLang = credentials.WorkLang) {
    Catalog = [];

    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    var vPointerDomain='';
    var vDescrDomain='';
    var vTipDomain='';
    var vTipArea='';
    var vTipIssue='';
    var RiskValueName='';

    iCounter = 0;
    var vDomains = xpath.select("/Audit/ActiveITAuditDomains/Domain/@nr",doc);
    for (var i=0; i<vDomains.length; i++) {
        if (vPointerDomain != vDomains[i].nodeValue) {
            if (vPointerDomain != '') {
                //call method to get plugins data
                MergePlugInData2Doc(doc, vPointerDomain);
            }
            vPointerDomain = vDomains[i].nodeValue;
            vDescrDomain= vPointerDomain + ' - ' + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vPointerDomain + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
            var res = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vPointerDomain + "']/Narrative/narr[@l='" + selectedLang + "']/ak",doc);
            if (res.length==1 && res[0].firstChild != null){
                vTipDomain=res[0].firstChild.nodeValue;
            } else {
                vTipDomain="No data available";
            }
        }

        var vAreas = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vPointerDomain + "']/Area/@nr",doc);
        for (var j=0; j<vAreas.length; j++) {
            var vPointerArea=vAreas[j].nodeValue;
            var vDescrArea=vPointerArea + ' - ' + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue;
            var res = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Narrative/narr[@l='" + selectedLang + "']/ak",doc);
            if (res.length==1 && res[0].firstChild != null){
                vTipArea=res[0].firstChild.nodeValue;
            } else {
                vTipArea="No data available";
            }
 
            var vIssues = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Issue/@nr",doc);
            for (var k=0; k<vIssues.length; k++) {
                var res = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Issue[@nr='" + vIssues[k].nodeValue + "']/Narrative/narr[@l='" + selectedLang + "']/ak",doc);
                if (res.length==1 && res[0].firstChild != null){
                    vTipIssue=res[0].firstChild.nodeValue;
                } else {
                    vTipIssue="No data available";
                }    

                var RiskValue = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Issue[@nr='" + vIssues[k].nodeValue + "']/@RiskWeight",doc)[0].nodeValue;
                switch (RiskValue){
                    case "3":
                        RiskValueName="High";
                        break;
                    case "2":
                        RiskValueName="Medium";
                        break;
                    case "1":
                        RiskValueName="Low";
                }
                
                var NewEntry = {
                    RowId: '#' + String((iCounter+1)),
                    PluginId: 'CORE',
                    Domain: vDescrDomain,
                    DomainId: vPointerDomain,
                    DomainTip: vTipDomain,
                    Area: vDescrArea,
                    AreaId: vPointerArea,
                    AreaTip: vTipArea,
                    Issue: vIssues[k].nodeValue + ' - '  + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Issue[@nr='" + vIssues[k].nodeValue + "']/title/tx[@l='" + selectedLang + "']/@name",doc)[0].nodeValue,
                    IssueId: vIssues[k].nodeValue,
                    IssueTip: vTipIssue,
                    Risk: RiskValueName,
                    Selected: xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Issue[@nr='" + vIssues[k].nodeValue + "']/@Include",doc)[0].nodeValue,
                    Remarks: xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vPointerDomain + "']/Area[@nr='" + vPointerArea + "']/Issue[@nr='" + vIssues[k].nodeValue + "']/@Remarks",doc)[0].nodeValue
                };

                if (op==='risk' && NewEntry.Risk==='Medium' || NewEntry.Risk==='High')
                {
                    Catalog.push(NewEntry);        
                }
                if (op==='included' && NewEntry.Selected==='Yes')
                {
                    Catalog.push(NewEntry);        
                }
                if (op==='all')
                {
                    Catalog.push(NewEntry);        
                }
                iCounter++;   
            }         
        }
    }
    //final call method to get plugins data (if not is going to ignore last domain)
    MergePlugInData2Doc(doc, vPointerDomain, op);
    return Catalog;
};

function SavePlanning(fileid, Catalog) {
    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    for (let i = 0; i < Catalog.length; i++) {
        if (Catalog[i].PluginId == 'CORE'){
            var res = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + Catalog[i].DomainId + "']/Area[@nr='" + Catalog[i].AreaId + "']/Issue[@nr='" + Catalog[i].IssueId + "']/.",doc)
            res[0].setAttribute('RiskWeight',Catalog[i].Risk);
            res[0].setAttribute('Include',Catalog[i].Selected);
            res[0].setAttribute('Remarks',Catalog[i].Remarks);
        } else {
            var res = xpath.select("/Audit/PlugIns/PlugIn[@id='" + Catalog[i].PluginId + "']/Domain[@nr='" + Catalog[i].DomainId + "']/Area[@nr='" + Catalog[i].AreaId + "']/Issue[@nr='" + Catalog[i].IssueId + "']/.",doc)
            res[0].setAttribute('RiskWeight',Catalog[i].Risk);
            res[0].setAttribute('Include',Catalog[i].Selected);
            res[0].setAttribute('Remarks',Catalog[i].Remarks);
        }
    }
    var writetofile = new XMLSerializer().serializeToString(doc);
    fs.writeFileSync(fileid, writetofile);
    return true;
};

function AssignRisk2Plan(doc, vDomainValue, vDomainRiskNote, vAreaValue, vRiskValue, vAreaRiskNote, vPlugInValue, selectedLang = credentials.WorkLang) {
    if (vPlugInValue == 'CORE'){
        var res = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vDomainValue + "']/Area[@nr='" + vAreaValue + "']/Issue",doc);
    } else {
        var res = xpath.select("/Audit/PlugIns/PlugIn[@id='" + vPlugInValue + "']/Domain[@nr='" + vDomainValue + "']/Area[@nr='" + vAreaValue + "']/Issue",doc);
    }

    for (let i = 0; i < res.length; i++) {
        res[i].setAttribute('RiskWeight',vRiskValue);
        if (vRiskValue === 3) {
            res[i].setAttribute('Include',"Yes");
        }
        res[i].setAttribute('Remarks', vDomainRiskNote + " " + vAreaRiskNote);
    }

};

function SyncPreAssessmentWithRiskAnalysis(fileid, selectedLang = credentials.WorkLang) {
    //reset variables values
    var vGenericValue = 0;
    var vGenericCount = 0;
    var vDomainValue = '';
    var vAreaValue = '';
    var vDomainRiskValue = '1';
    var vDomainRiskNote = '';
    var vAreaRiskValue ='';
    var vAreaRiskNote = '';

    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    var vItems = xpath.select("/Audit/Preassessment/paArea[@nr='A2']/paIssue[@nr='02']/paMatrix[@nr='01']/paSection[@nr='01']/Instances/IElement[@l='" + selectedLang + "']/@nr", doc);
    for (var i=0; i<vItems.length; i++) {
        var ListArray=vItems[i].nodeValue.split("_");
        var SubListArray = ListArray[0].split("|");

        var vItemName = xpath.select("/Audit/Preassessment/paArea[@nr='A2']/paIssue[@nr='02']/paMatrix[@nr='01']/paSection[@nr='01']/Instances/IElement[@l='" + selectedLang + "' and @nr='" + vItems[i].nodeValue + "']/@name", doc)[0].nodeValue;

        //get domain
        if (vDomainValue != SubListArray[1]) {
            vDomainValue = SubListArray[1];
            vGenericValue = 0;
            vGenericCount = 0;
            vDomainRiskValue = "1";
            vDomainRiskNote = "";
        }
        //generic risk evaluation for domain
        if (ListArray[1].indexOf("|")== -1) {
            if (vItemName == "High") {
                vGenericValue = vGenericValue + 3;
                vGenericCount = vGenericCount + 1;
            } else if (vItemName == "Medium") {
                vGenericValue = vGenericValue + 2;
                vGenericCount = vGenericCount + 1;
            } else if (vItemName == "Low") {
                vGenericValue = vGenericValue + 1;
                vGenericCount = vGenericCount + 1;
            }
        } else {
            if (vDomainValue != "") {
                if (vGenericValue != 0) {
                    //apply generic evaluation to all domain
                    //if is a precaution
                    vDomainInterval = Math.round(vGenericValue / (vGenericCount === 0 ? 1 : vGenericCount));
                    if (vDomainInterval == 3) {
                        vDomainRiskValue = "3";
                    } else if (vDomainInterval == 2) {
                        vDomainRiskValue = "2";
                    } else {
                        vDomainRiskValue = "1";
                    }
                    vDomainRiskNote = "Pre-Assessment: " + ((vDomainInterval === 3 ? "Domain - High; " : (vDomainInterval === 2 ? "Domain - Medium; " : "Domain - Low; ")));                    
                }
            }
            SubListArray = ListArray[1].split("|");
            //generic risk evaluation for area
            if (SubListArray[1].indexOf("#")== -1) {
                vAreaValue = SubListArray[1];
                vAreaRiskNote = ((vItemName === "High" ? "Area - High; " : (vItemName === "Medium" ? "Area - Medium; " : "Area - Low; ")));
                //call method to assign generic evaluation on domain/area:             
                if (vItemName == "High") {
                    vAreaRiskValue = 3;
                } else if (vItemName == "Medium") {
                    vAreaRiskValue = 2;
                } else if (vItemName == "Low") {
                    vAreaRiskValue = 1;
                }
                AssignRisk2Plan(doc, vDomainValue, vDomainRiskNote, vAreaValue, (vDomainRiskValue > vAreaRiskValue ? vDomainRiskValue : vAreaRiskValue), vAreaRiskNote, "CORE");
            } else {
            //generic risk evaluation for area in plugin
                if (vItemName == "High") {
                    vAreaRiskValue = 3;
                } else if (vItemName == "Medium") {
                    vAreaRiskValue = 2;
                } else if (vItemName == "Low") {
                    vAreaRiskValue = 1;
                }
                var PlugArray = SubListArray[1].split("#");
                vAreaValue = PlugArray[0];
                vAreaRiskNote = ((vItemName === "High" ? "Area - High; " : (vItemName === "Medium" ? "Area - Medium; " : "Area - Low; ")));
                AssignRisk2Plan(doc, vDomainValue, vDomainRiskNote, vAreaValue, (vDomainRiskValue > vAreaRiskValue ? vDomainRiskValue : vAreaRiskValue), vAreaRiskNote, PlugArray[1]);
            }            
        }
    }
    var writetofile = new XMLSerializer().serializeToString(doc);
    fs.writeFileSync(fileid, writetofile);
    return true;
};

function GetAuditID(fileid) {
    var AuditId='';

    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);
    
    var res = xpath.select("/Audit/About/@id",doc);
    if (res.length==1 && res[0] != null){
        AuditId = res[0].nodeValue;   
    };  
    return AuditId;       
};

module.exports.GetAuditID = GetAuditID;
module.exports.LoadPlanning = LoadPlanning;
module.exports.LoadPlanning2Doc = LoadPlanning2Doc;
module.exports.SavePlanning = SavePlanning;
module.exports.SyncPreAssessmentWithRiskAnalysis = SyncPreAssessmentWithRiskAnalysis;