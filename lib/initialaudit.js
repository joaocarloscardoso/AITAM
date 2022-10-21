//credentials used in the app
var credentials = require('../credentials.js');

var fs = require('fs'),
    path = require('path');

//logging system
var log = require('./log.js');
//credentials used in the app
var credentials = require('../credentials.js');

var xpath   = require('xpath');
var Dom     = require('@xmldom/xmldom').DOMParser;
//var XMLSerializer = require('xmlserializer');
var XMLSerializer = require('xmlserializer');

module.exports = function(dir){
    var WorkPath = dir;
    return {
        // Return only base file name without dir
        CreateInitialAuditXML: function(selectedLang = credentials.WorkLang) {
            var FilePreAssessPath = credentials.CoreSetPath + 'ITAuditHandbookPreActivities.xml' ;
            var dataPreAssess = fs.readFileSync(FilePreAssessPath, { encoding : 'UTF-8' });
            var FileCoreDomainsPath = credentials.CoreSetPath + 'ITAuditHandbook.xml' ;
            var dataCoreDomains = fs.readFileSync(FileCoreDomainsPath, { encoding : 'UTF-8' });

            var vInitialXML = '<Audit><About id="" descriptionfile=""><version id="1.0" name=""/><title><tx l="' + selectedLang + '" name="" rem=""/></title><WorkingLanguage wl="' + selectedLang + '"/></About><Background><ak/></Background><Scope><ak/></Scope>';
            vInitialXML = vInitialXML + dataPreAssess;
            vInitialXML = vInitialXML + '<Arrangements><team/><timetable/></Arrangements>';
            vInitialXML = vInitialXML + dataCoreDomains;
            vInitialXML = vInitialXML + '<PlugIns/><Cases/></Audit>';

            // write to a new file named
            fs.writeFile(WorkPath, vInitialXML, (err) => {  
                // throws an error, you could also catch it here
                if (err) throw err;

                // success case, the file was saved
                log.info('New audit file created:' + WorkPath);
            });            
        },
        VerifyAuditFile: function(fileid) {
            return fs.existsSync(fileid);
        },
        GetAuditReference: function(fileid, selectedLang = credentials.WorkLang) {
            var AuditReference = {
                AuditId: '',
                Title: '',
                Background:'',
                Scope:''
            };
            var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
            // Create an XMLDom Element:
            var doc = new Dom().parseFromString(data);
            
            var res = xpath.select("/Audit/About/@id",doc);
            if (res.length==1 && res[0] != null)
                AuditReference.AuditId = res[0].nodeValue;    
                
                console.log(AuditReference.AuditId);

            var res = xpath.select("/Audit/About/title/tx[@l='" + selectedLang + "']/@name",doc);
            if (res.length==1 && res[0] != null)
                AuditReference.Title = res[0].nodeValue;

            var res = xpath.select("/Audit/Background/ak",doc);
            if (res.length==1 && res[0].firstChild != null)
                AuditReference.Background = res[0].firstChild.nodeValue;

            var res = xpath.select("/Audit/Scope/ak",doc);
            if (res.length==1 && res[0].firstChild != null)
                AuditReference.Scope = res[0].firstChild.nodeValue;

            return AuditReference;
        },
        SetAuditReference: function(fileid, AuditReference, selectedLang = credentials.WorkLang) {
            var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
            //var serializer = new XMLSerializer();
            // Create an XMLDom Element:
            var doc = new Dom().parseFromString(data);
            
            var res = xpath.select("/Audit/About",doc);
            res[0].setAttribute('id',AuditReference.AuditId);

            var res = xpath.select("/Audit/About/title/tx[@l='" + selectedLang + "']/.",doc);
            res[0].setAttribute('name',AuditReference.Title); 

            var res = xpath.select("/Audit/Background/ak",doc);
            //other possibility: .childNodes[0] instead of .firstChild
            if (res[0].firstChild == null) {
                res[0].appendChild(doc.createTextNode(AuditReference.Background));
            } else {
                res[0].firstChild.data = AuditReference.Background;
            }

            var res = xpath.select("/Audit/Scope/ak",doc);
            if (res[0].firstChild == null) {
                res[0].appendChild(doc.createTextNode(AuditReference.Scope));
            } else {
                res[0].firstChild.data = AuditReference.Scope;
            }

            //var writetofile = new XMLSerializer().serializeToString(doc);
            //var writetofile = XMLSerializer().serializeToString(doc);
            var writetofile = XMLSerializer.serializeToString(doc);
            writetofile = writetofile.replaceAll(' xmlns="undefined"','');
            writetofile = writetofile.replaceAll(' xmlns="null"','');            

            fs.writeFileSync(fileid, writetofile);
            //fs.writeFile(fileid, writetofile, (err) => {  
                // throws an error, you could also catch it here
            //    if (err) throw err;
            //});            
        },
        GetCoreVersion: function(fileid) {
            var AuditVersion='0';

            var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
            // Create an XMLDom Element:
            var doc = new Dom().parseFromString(data);
            
            var res = xpath.select("/Audit/ActiveITAuditDomains/About/version/@id",doc);
            if (res.length==1 && res[0] != null)
                AuditVersion = res[0].nodeValue;            

            return AuditVersion;
        },
        GetCoreSupportedLanguages: function(fileid) {
            var AuditLanguages='';

            var data = fs.readFileSync(fileid, { encoding : 'UTF-8' });
            // Create an XMLDom Element:
            var doc = new Dom().parseFromString(data);
            
            var res = xpath.select("/Audit/ActiveITAuditDomains/About/WorkingLanguage/@wl",doc);
            if (res.length==1 && res[0] != null)
                AuditLanguages = res[0].nodeValue;            

            return AuditLanguages;
        }
    };
};

