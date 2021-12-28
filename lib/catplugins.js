//credentials used in the app
var credentials = require('../credentials.js');

var fs = require('fs'),
    path = require('path'),
    _ = require('underscore');


var xpath   = require('xpath');
var Dom     = require('xmldom').DOMParser;
var XMLSerializer = require('xmlserializer');

module.exports = function(dir){
    var PlugInsPath = dir;
    return {
        // Return only base file name without dir
        getMostRecentFileName: function() {
            var files = fs.readdirSync(PlugInsPath);

            // use underscore for max()
            return _.max(files, function (f) {
                var fullpath = path.join(PlugInsPath, f);

                // ctime = creation time is used
                // replace with mtime for modification time
                return fs.statSync(fullpath).ctime;
            });
        },
        getListOfPlugins: function (selectedLang = credentials.WorkLang) {
            var Catalog = [];
            
            var items = fs.readdirSync(PlugInsPath); 
            
            for (var i=0; i<items.length; i++) {
                var filepath = PlugInsPath + '\\' + items[i];
                var stats = fs.statSync(filepath);

                var cDate = stats["ctime"];

                var NewEntry = {
                    RowId: '#' + String((i+1)),
                    File: items[i],
                    Reference:'',
                    Description:'',
                    Support:'',
                    Version:'',
                    Language:'',
                    Date:cDate.toISOString(),
                    Size: String((stats["size"] / 1024).toFixed(2)) + ' KB',
                    Path: filepath
                };

                var data = fs.readFileSync(filepath, { encoding : 'UTF-8' });
                // Create an XMLDom Element:
                var doc = new Dom().parseFromString(data);
                
                var res = xpath.select("/PlugIn/@id",doc);
                if (res.length==1)
                    NewEntry.Reference = res[0].nodeValue;

                var res = xpath.select("/PlugIn/About/@descriptionfile",doc);
                if (res.length==1)
                    NewEntry.Support = res[0].nodeValue;

                var res = xpath.select("/PlugIn/About/version/@id",doc);
                if (res.length==1)
                    NewEntry.Version = res[0].nodeValue;

                var res = xpath.select("/PlugIn/About/title/tx[@l='" + selectedLang + "']/@name",doc);
                if (res.length==1)
                    NewEntry.Description = res[0].nodeValue;

                var res = xpath.select("/PlugIn/About/WorkingLanguage/@wl",doc);
                if (res.length==1)
                    NewEntry.Language = res[0].nodeValue.replace(" ",", ");
                
                //console.log(NewEntry);
                Catalog.push(NewEntry);
            }
            return Catalog;
        },
        getListOfAuditTemplates: function (AuditTemplatesPath, selectedLang = credentials.WorkLang) {
            var Catalog = [];
            
            var items = fs.readdirSync(AuditTemplatesPath); 
            
            for (var i=0; i<items.length; i++) {
                var filepath = AuditTemplatesPath + '\\' + items[i];
                var stats = fs.statSync(filepath);

                var cDate = stats["ctime"];

                var NewEntry = {
                    RowId: '#' + String((i+1)),
                    File: items[i],
                    Reference:'',
                    Description:'',
                    Support:'',
                    Version:'',
                    Language:'',
                    Date:cDate.toISOString(),
                    Size: String((stats["size"] / 1024).toFixed(2)) + ' KB',
                    Path: filepath
                };

                var data = fs.readFileSync(filepath, { encoding : 'UTF-8' });
                // Create an XMLDom Element:
                var doc = new Dom().parseFromString(data);
                
                var res = xpath.select("/Audit/About/@id",doc);
                if (res.length==1)
                    NewEntry.Reference = res[0].nodeValue;

                var res = xpath.select("/Audit/About/@descriptionfile",doc);
                if (res.length==1)
                    NewEntry.Support = res[0].nodeValue;

                var res = xpath.select("/Audit/About/version/@id",doc);
                if (res.length==1)
                    NewEntry.Version = res[0].nodeValue;

                var res = xpath.select("/Audit/About/title/tx[@l='" + selectedLang + "']/@name",doc);
                if (res.length==1)
                    NewEntry.Description = res[0].nodeValue;

                var res = xpath.select("/Audit/About/WorkingLanguage/@wl",doc);
                if (res.length==1)
                    NewEntry.Language = res[0].nodeValue.replace(" ",", ");
                
                //console.log(NewEntry);
                Catalog.push(NewEntry);
            }
            return Catalog;
        },
        getPluginsForAudit: function (AuditFileId, selectedLang = credentials.WorkLang) {
            var Catalog = [];
            
            var items = fs.readdirSync(PlugInsPath); 
            
            for (var i=0; i<items.length; i++) {
                var filepath = PlugInsPath + '\\' + items[i];

                var Auditdata = fs.readFileSync(AuditFileId, { encoding : 'UTF-8' });
                var auditdoc = new Dom().parseFromString(Auditdata);

                var NewEntry = {
                    RowId: '#' + String((i+1)),
                    File: items[i],
                    Reference:'',
                    Description:'',
                    Version:'',
                    Selected: 'No'
                };

                var data = fs.readFileSync(filepath, { encoding : 'UTF-8' });
                // Create an XMLDom Element:
                var doc = new Dom().parseFromString(data);
                
                var res = xpath.select("/PlugIn/@id",doc);
                if (res.length==1)
                    NewEntry.Reference = res[0].nodeValue;

                var res = xpath.select("/PlugIn/About/@descriptionfile",doc);
                if (res.length==1)
                    NewEntry.Support = res[0].nodeValue;

                var res = xpath.select("/PlugIn/About/version/@id",doc);
                if (res.length==1)
                    NewEntry.Version = res[0].nodeValue;

                var res = xpath.select("/PlugIn/About/title/tx[@l='" + selectedLang + "']/@name",doc);
                if (res.length==1)
                    NewEntry.Description = res[0].nodeValue;

                //merge with current XML audit file
                var auditres = xpath.select("/Audit/PlugIns/PlugIn[@id='" + NewEntry.Reference + "']/.",auditdoc);
                if (auditres[0] == null) {
                    NewEntry.Selected='No';
                } else {
                    NewEntry.Selected='Yes';
                }
                        
                //console.log(NewEntry);
                Catalog.push(NewEntry);
            }
            return Catalog;
        },
        setPluginsForAudit: function (PlugIns2Audit, AuditFileId) {
            var index, SelPluginsLen, Flag;

            var data = fs.readFileSync(AuditFileId, { encoding : 'UTF-8' });
            // Create an XMLDom Element:
            var doc = new Dom().parseFromString(data);
            //array PlugIns2Audit: plugin_reference|plugin_file#
            var ColPlugins =  PlugIns2Audit.split("#");
            Flag=0;
            for (index = 0, SelPluginsLen = (ColPlugins.length-1); index < SelPluginsLen; ++index) {
                var SelPlugin=ColPlugins[index].split("|");
                var res = xpath.select("/Audit/PlugIns/PlugIn[@id='" + SelPlugin[0] + "']/.",doc);
                //plugin does not exist, must be inserted in audit
                if (res.length == 0) {
                    //open plugin
                    var NewPluginpath = PlugInsPath + '\\' + SelPlugin[1];
                    var NewPlugindata = fs.readFileSync(NewPluginpath, { encoding : 'UTF-8' });
                    var NewPlugindoc = new Dom().parseFromString(NewPlugindata);
                    //select plugin root node
                    var AuditPluginRoot = xpath.select("/Audit/PlugIns/.",doc);
                    var NewPluginNode = xpath.select("/PlugIn",NewPlugindoc);
                    //insert plugin root node in XML audit file
                    AuditPluginRoot[0].appendChild(NewPluginNode[0]);
                    Flag=1;
                }   
            }
            //take care of plug-ins to delete
            var vItemsId = xpath.select("/Audit/PlugIns/PlugIn/@id",doc);
            var vItems = xpath.select("/Audit/PlugIns/.",doc);
            for (var j=0; j<vItemsId.length; j++) {
                if (PlugIns2Audit.indexOf(vItemsId[j].nodeValue) == -1) {
                    //console.log("a:" + vItemsId[j].nodeValue);
                    vItem2Delete = xpath.select("/Audit/PlugIns/PlugIn[@id='" + vItemsId[j].nodeValue + "']",doc);
                    vItems[0].removeChild(vItem2Delete[0]);
                    Flag=1;
                }
            }   
            if (Flag==1){
                //save at end if changes happened (new plugins inserted)
                var writetofile = XMLSerializer.serializeToString(doc);
                writetofile = writetofile.replace(' xmlns="undefined"','');
                fs.writeFileSync(AuditFileId, writetofile);
                /*
                fs.writeFile(AuditFileId, writetofile, (err) => {  
                     // throws an error, you could also catch it here
                    if (err) throw err;
                });
                */
            }   
            return true;
        }
    };
};

