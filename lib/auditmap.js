//credentials used in the app
var credentials = require('../credentials.js');
var globalvalues = require('../globalvalues.js');

var fs = require('fs'),
    path = require('path');

//logging system
var log = require('./log.js');

var xpath   = require('xpath');
var Dom     = require('xmldom').DOMParser;
var XMLSerializer = require('xmldom').XMLSerializer;
var iCounter;

var Catalog = [];
var Nodes = [];
var KeyNodes = [];
var Edges = [];
var Support = [];

function LoadAuditMap(fileid) {
    return data = JSON.parse(fs.readFileSync(fileid, { encoding : 'UTF-8' }));
};

function GetPlanObjects(doc){
    var vDomainTitle = '';
    var vDomainDescription = '';
    var vCurrentDomainId = 0;
    var vAreaTitle = '';
    var vAreaDescription = '';
    var vCurrentAreaId = 0;
    var vIssueTitle = '';
    var vIssueDescription = '';
    var vCurrentIssueId = 0;
    var vDomain ='';
    var vArea ='';
    var vIssue = '';

    var vDomains = xpath.select("/Audit/ActiveITAuditDomains/Domain/@nr",doc);
    for (var i=0; i<vDomains.length; i++) {
        var vAreas = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vDomains[i].nodeValue + "']/Area/@nr",doc);
        for (var j=0; j<vAreas.length; j++) {
            var vItems = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vDomains[i].nodeValue + "']/Area[@nr='" + vAreas[j].nodeValue + "']/Issue/@nr",doc);
            for (var m=0; m<vItems.length; m++) {
                var vIncluded =  xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vDomains[i].nodeValue + "']/Area[@nr='" + vAreas[j].nodeValue + "']/Issue[@nr='" + vItems[m].nodeValue + "']/@Include",doc)[0].nodeValue;
                if (vIncluded == "Yes"){ 
                    vIssueTitle = vItems[m].nodeValue + ' ' + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vDomains[i].nodeValue + "']/Area[@nr='" + vAreas[j].nodeValue + "']/Issue[@nr='" + vItems[m].nodeValue + "']/title/tx[@l='" + credentials.WorkLang + "']/@name",doc)[0].nodeValue;
                    res = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vDomains[i].nodeValue + "']/Area[@nr='" + vAreas[j].nodeValue + "']/Issue[@nr='" + vItems[m].nodeValue + "']/Narrative/narr[@l='" + credentials.WorkLang + "']/ak",doc);
                    if (res.length==1 && res[0].firstChild != null){
                        vIssueDescription=res[0].firstChild.nodeValue;
                    } else {
                        vIssueDescription="No description available";
                    }
                    vDomain= 'AITAM_' + vDomains[i].nodeValue;
                    vArea = 'AITAM_' + vDomains[i].nodeValue + '_' + vAreas[j].nodeValue;  
                    vIssue = 'AITAM_' + vDomains[i].nodeValue + '_' + vAreas[j].nodeValue + '_' + vItems[m].nodeValue;
                    //create issue and get id number
                    var NewNodeEntry = {
                        id: Nodes.length,
                        label: 'Issue:\n' + vIssueTitle,
                        title: 'Issue: ' + vIssueTitle,
                        group: 1
                    };
                    vCurrentIssueId = NewNodeEntry.id;
                    Nodes.push(NewNodeEntry);     

                    var NewSupportEntry = {
                        title: 'Issue: ' + vIssueTitle,
                        matrix: '/auditMatrices/planMatrix?plugin=CORE&domain=' + vDomains[i].nodeValue + '&area=' + vAreas[j].nodeValue + '&issue=' + vItems[m].nodeValue + '&src=map',
                        description: vIssueDescription
                    };
                    Support.push(NewSupportEntry);        
                    
                    var NewKeyEntry = {
                        id: vCurrentIssueId,
                        nodekey: vIssue
                    };
                    KeyNodes.push(NewKeyEntry);        
                    console.log(KeyNodes);
                    //find if area exists and:
                    var result = KeyNodes.find( ({ nodekey }) => nodekey === vArea);
                    if(result == null){ 
                        //a) if not create and get id number
                        vAreaTitle = vAreas[j].nodeValue + ' ' + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vDomains[i].nodeValue + "']/Area[@nr='" + vAreas[j].nodeValue + "']/title/tx[@l='" + credentials.WorkLang + "']/@name",doc)[0].nodeValue                   
                        res = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vDomains[i].nodeValue + "']/Area[@nr='" + vAreas[j].nodeValue + "']/Narrative/narr[@l='" + credentials.WorkLang + "']/ak",doc);
                        if (res.length==1 && res[0].firstChild != null){
                            vAreaDescription=res[0].firstChild.nodeValue;
                        } else {
                            vAreaDescription="No description available";
                        }

                        var NewNodeEntry = {
                            id: Nodes.length,
                            label: 'Area:\n' + vAreaTitle,
                            title: 'Area: ' + vAreaTitle,
                            group: 1
                        };
                        vCurrentAreaId = NewNodeEntry.id;
                        Nodes.push(NewNodeEntry);     
    
                        var NewSupportEntry = {
                            title: 'Area: ' + vAreaTitle,
                            matrix: '',
                            description: vAreaDescription
                        };
                        Support.push(NewSupportEntry);        
                        
                        var NewKeyEntry = {
                            id: vCurrentAreaId,
                            nodekey: vArea
                        };
                        KeyNodes.push(NewKeyEntry);        
                    } else {
                        vCurrentAreaId = result.id;
                    }
                    //b) else find area id number
                    //relates edge of issue id with area id
                    var NewEdgeEntry = {
                        From: vCurrentAreaId,
                        To: vCurrentIssueId
                    };        
                    Edges.push(NewEdgeEntry);
                    //find if domain exists and:
                    var result = KeyNodes.find( ({ nodekey }) => nodekey === vDomain);
                    if(result == null){ 
                        //a) if not create and get id number
                        vDomainTitle = vDomains[i].nodeValue + ' ' + xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vDomains[i].nodeValue + "']/title/tx[@l='" + credentials.WorkLang + "']/@name",doc)[0].nodeValue;
                        var res = xpath.select("/Audit/ActiveITAuditDomains/Domain[@nr='" + vDomains[i].nodeValue + "']/Narrative/narr[@l='" + credentials.WorkLang + "']/ak",doc);
                        if (res.length==1 && res[0].firstChild != null){
                            vDomainDescription=res[0].firstChild.nodeValue;
                        } else {
                            vDomainDescription="No description available";
                        }

                        var NewNodeEntry = {
                            id: Nodes.length,
                            label: 'Domain:\n' + vDomainTitle,
                            title: 'Domain: ' + vDomainTitle,
                            group: 1
                        };
                        vCurrentDomainId = NewNodeEntry.id;
                        Nodes.push(NewNodeEntry);     
    
                        var NewSupportEntry = {
                            title: 'Domain: ' + vDomainTitle,
                            matrix: '',
                            description: vDomainDescription
                        };
                        Support.push(NewSupportEntry);        
                        
                        var NewKeyEntry = {
                            id: vCurrentDomainId,
                            nodekey: vDomain
                        };
                        KeyNodes.push(NewKeyEntry);        
                    } else {
                        vCurrentDomainId= result.id;
                    }
                    //b) else find domain id number
                    //relates edge of area id with domain id
                    var NewEdgeEntry = {
                        From: vCurrentDomainId,
                        To: vCurrentAreaId
                    };        
                    Edges.push(NewEdgeEntry);
                    //relates edge of domain id with audit id
                    var NewEdgeEntry = {
                        From: 0,
                        To: vCurrentDomainId
                    };        
                    Edges.push(NewEdgeEntry);
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
                        vDomainTitle = vDomains[i].nodeValue + ' ' + xpath.select("/Audit/PlugIns/PlugIn[@id='" + vPlugins[k].nodeValue + "']/Domain[@nr='" + vDomains[i].nodeValue + "']/title/tx[@l='" + credentials.WorkLang + "']/@name",doc)[0].nodeValue;
                        var res = xpath.select("/Audit/PlugIns/PlugIn[@id='" + vPlugins[k].nodeValue + "']/Domain[@nr='" + vDomains[i].nodeValue + "']/Narrative/narr[@l='" + credentials.WorkLang + "']/ak",doc);
                        if (res.length==1 && res[0].firstChild != null){
                            vDomainDescription=res[0].firstChild.nodeValue;
                        } else {
                            vDomainDescription="No description available";
                        }
                        vIssueTitle = vItems[m].nodeValue + ' ' + xpath.select("/Audit/PlugIns/PlugIn[@id='" + vPlugins[k].nodeValue + "']/Domain[@nr='" + vDomains[i].nodeValue + "']/Area[@nr='" + vAreas[j].nodeValue + "']/Issue[@nr='" + vItems[m].nodeValue + "']/title/tx[@l='" + credentials.WorkLang + "']/@name",doc)[0].nodeValue;
                        res = xpath.select("/Audit/PlugIns/PlugIn[@id='" + vPlugins[k].nodeValue + "']/Domain[@nr='" + vDomains[i].nodeValue + "']/Area[@nr='" + vAreas[j].nodeValue + "']/Issue[@nr='" + vItems[m].nodeValue + "']/Narrative/narr[@l='" + credentials.WorkLang + "']/ak",doc);
                        if (res.length==1 && res[0].firstChild != null){
                            vIssueDescription=res[0].firstChild.nodeValue;
                        } else {
                            vIssueDescription="No description available";
                        }    
                        vDomain= vPlugins[k].nodeValue + '_' + vDomains[i].nodeValue;
                        vArea =  vPlugins[k].nodeValue + '_' + vDomains[i].nodeValue + '_' + vAreas[j].nodeValue;  
                        vIssue = vPlugins[k].nodeValue + '_' + vDomains[i].nodeValue + '_' + vAreas[j].nodeValue + '_' + vItems[m].nodeValue;
                        //create issue and get id number
                        var NewNodeEntry = {
                            id: Nodes.length,
                            label: 'Issue:\n' + vIssueTitle,
                            title: 'Issue: ' + vIssueTitle,
                            group: 1
                        };
                        vCurrentIssueId = NewNodeEntry.id;
                        Nodes.push(NewNodeEntry);     
    
                        var NewSupportEntry = {
                            title: 'Issue: ' + vIssueTitle,
                            matrix: '/auditMatrices/planMatrix?plugin=' + vPlugins[k].nodeValue + '&domain=' + vDomains[i].nodeValue + '&area=' + vAreas[j].nodeValue + '&issue=' + vItems[m].nodeValue + '&src=map',
                            description: vIssueDescription
                        };
                        Support.push(NewSupportEntry);        
                        
                        var NewKeyEntry = {
                            id: vCurrentIssueId,
                            nodekey: vIssue
                        };
                        KeyNodes.push(NewKeyEntry);        
                        //find if area exists and:
                        var result = KeyNodes.find( ({ nodekey }) => nodekey === vArea);
                        if(result == null){ 
                            //a) if not create and get id number
                            vAreaTitle = vAreas[j].nodeValue + ' ' + xpath.select("/Audit/PlugIns/PlugIn[@id='" + vPlugins[k].nodeValue + "']/Domain[@nr='" + vDomains[i].nodeValue + "']/Area[@nr='" + vAreas[j].nodeValue + "']/title/tx[@l='" + credentials.WorkLang + "']/@name",doc)[0].nodeValue                   
                            res = xpath.select("/Audit/PlugIns/PlugIn[@id='" + vPlugins[k].nodeValue + "']/Domain[@nr='" + vDomains[i].nodeValue + "']/Area[@nr='" + vAreas[j].nodeValue + "']/Narrative/narr[@l='" + credentials.WorkLang + "']/ak",doc);
                            if (res.length==1 && res[0].firstChild != null){
                                vAreaDescription=res[0].firstChild.nodeValue;
                            } else {
                                vAreaDescription="No data available";
                            }
    
                            var NewNodeEntry = {
                                id: Nodes.length,
                                label: 'Area:\n' + vAreaTitle,
                                title: 'Area: ' + vAreaTitle,
                                group: 1
                            };
                            vCurrentAreaId = NewNodeEntry.id;
                            Nodes.push(NewNodeEntry);     
        
                            var NewSupportEntry = {
                                title: 'Area: ' + vAreaTitle,
                                matrix: '',
                                description: vAreaDescription
                            };
                            Support.push(NewSupportEntry);        
                            
                            var NewKeyEntry = {
                                id: vCurrentAreaId,
                                nodekey: vArea
                            };
                            KeyNodes.push(NewKeyEntry);        
                        } else {
                            vCurrentAreaId = result.id;
                        }
                        //b) else find area id number
                        //relates edge of issue id with area id
                        var NewEdgeEntry = {
                            From: vCurrentAreaId,
                            To: vCurrentIssueId
                        };        
                        Edges.push(NewEdgeEntry);
                        //find if domain exists and:
                        var result = KeyNodes.find( ({ nodekey }) => nodekey === vDomain);
                        if(result == null){ 
                                //a) if not create and get id number
                            vDomainTitle = vDomains[i].nodeValue + ' ' + xpath.select("/Audit/PlugIns/PlugIn[@id='" + vPlugins[k].nodeValue + "']/Domain[@nr='" + vDomains[i].nodeValue + "']/title/tx[@l='" + credentials.WorkLang + "']/@name",doc)[0].nodeValue;
                            var res = xpath.select("/Audit/PlugIns/PlugIn[@id='" + vPlugins[k].nodeValue + "']/Domain[@nr='" + vDomains[i].nodeValue + "']/Narrative/narr[@l='" + credentials.WorkLang + "']/ak",doc);
                            if (res.length==1 && res[0].firstChild != null){
                                vDomainDescription=res[0].firstChild.nodeValue;
                            } else {
                                vDomainDescription="No description available";
                            }
    
                            var NewNodeEntry = {
                                id: Nodes.length,
                                label: 'Domain:\n' + vDomainTitle,
                                title: 'Domain: ' + vDomainTitle,
                                group: 1
                            };
                            vCurrentDomainId = NewNodeEntry.id;
                            Nodes.push(NewNodeEntry);     
        
                            var NewSupportEntry = {
                                title: 'Domain: ' + vDomainTitle,
                                matrix: '',
                                description: vDomainDescription
                            };
                            Support.push(NewSupportEntry);        
                            
                            var NewKeyEntry = {
                                id: vCurrentDomainId,
                                nodekey: vDomain
                            };
                            KeyNodes.push(NewKeyEntry);        
                        } else {
                            vCurrentDomainId= result.id;
                        }
                        //b) else find domain id number
                        //relates edge of area id with domain id
                        var NewEdgeEntry = {
                            From: vCurrentDomainId,
                            To: vCurrentAreaId
                        };        
                        Edges.push(NewEdgeEntry);
                        //relates edge of domain id with audit id
                        var NewEdgeEntry = {
                            From: 0,
                            To: vCurrentDomainId
                        };        
                        Edges.push(NewEdgeEntry);
                    }
                }
            }
        }
    }
};


function GetAuditReference(doc) {
    var vAuditTitle = '';
    var vAuditBackground = '';

    //audit reference section
    var res = xpath.select("/Audit/About/title/tx[@l='" + credentials.WorkLang + "']/@name",doc);
    if (res.length==1 && res[0] != null) {
        vAuditTitle = res[0].nodeValue;
    }
    var res = xpath.select("/Audit/Background/ak",doc);
    if (res.length==1 && res[0].firstChild != null) {
        vAuditBackground = res[0].firstChild.nodeValue;
    }

    var NewNodeEntry = {
        id: 0,
        label: vAuditTitle,
        title: 'Audit: ' + vAuditTitle,
        group: 0
    };
    vCurrentIssueId = NewNodeEntry.id;
    Nodes.push(NewNodeEntry);     

    var NewSupportEntry = {
        title: 'Audit: ' + vAuditTitle,
        matrix: '/toolaudit/toolauditreference?src=map',
        description: vAuditBackground
    };
    Support.push(NewSupportEntry);        

};

function GenerateAuditMap(fileid) {
    Catalog = [];
    Nodes = [];
    KeyNodes = [];
    Edges = [];
    Support = [];

    var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var doc = new Dom().parseFromString(data);

    GetAuditReference(doc);
    GetPlanObjects(doc);
    //GetFindingObjects(fileid);
    //GetRecommendationObjects(fileid);
    console.log(Nodes);
    console.log(KeyNodes);
    console.log(Edges);
    console.log(Support);
};

module.exports.LoadAuditMap = LoadAuditMap;
module.exports.GenerateAuditMap = GenerateAuditMap;